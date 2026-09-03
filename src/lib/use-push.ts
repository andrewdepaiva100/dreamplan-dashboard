import { useCallback, useEffect, useState } from "react";
import {
  getPushPublicKey,
  registerPush,
  sendTestPush,
  unregisterPush,
} from "@/lib/push.functions";
import { getPerson, pushEnvironment, setPerson, type Person } from "@/lib/push-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToBase64Url(buf: ArrayBuffer | null) {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return window.btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deviceLabel() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android phone";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Device";
}

export function usePush() {
  const [person, setPersonState] = useState<Person | null>(null);
  const [env, setEnv] = useState<ReturnType<typeof pushEnvironment>>("unsupported");
  const [permission, setPermission] = useState<NotificationPermission | "unknown">("unknown");
  const [subscribed, setSubscribed] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setPersonState(getPerson());
    const e = pushEnvironment();
    setEnv(e);
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
    if (e !== "ok") return;
    void (async () => {
      const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        setSubscribed(true);
        setEndpoint(sub.endpoint);
      }
    })();
  }, []);

  const choosePerson = useCallback((p: Person) => {
    setPerson(p);
    setPersonState(p);
  }, []);

  const enable = useCallback(async () => {
    const who = getPerson();
    if (!who) {
      setStatus("Pick who you are first.");
      return;
    }
    if (pushEnvironment() !== "ok") {
      setStatus("Notifications can't be turned on in this window.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const perm =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setStatus("Notifications were blocked. Allow them in your phone's settings for this app.");
        return;
      }

      const { publicKey } = await getPushPublicKey();
      if (!publicKey) {
        setStatus("Push isn't configured on the server yet.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/push-sw.js");
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      await registerPush({
        data: {
          endpoint: sub.endpoint,
          p256dh: bufToBase64Url(sub.getKey("p256dh")),
          auth: bufToBase64Url(sub.getKey("auth")),
          person: who,
          deviceLabel: deviceLabel(),
        },
      });
      setSubscribed(true);
      setEndpoint(sub.endpoint);
      setStatus("Notifications are on for this device.");
    } catch (err) {
      console.error(err);
      setStatus(err instanceof Error ? err.message : "Could not turn on notifications.");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await unregisterPush({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setEndpoint(null);
      setStatus("Notifications are off for this device.");
    } catch (err) {
      console.error(err);
      setStatus("Could not turn notifications off.");
    } finally {
      setBusy(false);
    }
  }, []);

  const test = useCallback(async () => {
    if (!endpoint) return;
    setBusy(true);
    try {
      const res = await sendTestPush({ data: { endpoint } });
      setStatus(res.sent ? "Test notification sent." : "Test failed to deliver.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Test failed.");
    } finally {
      setBusy(false);
    }
  }, [endpoint]);

  return {
    person,
    choosePerson,
    env,
    permission,
    subscribed,
    busy,
    status,
    enable,
    disable,
    test,
  };
}

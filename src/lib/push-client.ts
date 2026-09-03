import { sendPush } from "@/lib/push.functions";

export type Person = "andrew" | "maria";

const PERSON_KEY = "plan.person";

export function getPerson(): Person | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(PERSON_KEY);
  return v === "andrew" || v === "maria" ? v : null;
}

export function setPerson(p: Person) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PERSON_KEY, p);
}

export function personName(p: Person) {
  return p === "andrew" ? "Andrew" : "Maria";
}

/** True when this browser context can register a push service worker. */
export function pushEnvironment():
  | "ok"
  | "unsupported"
  | "open-in-new-tab"
  | "add-to-home-screen" {
  if (typeof window === "undefined") return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    // iOS only exposes these once the app is installed to the Home Screen.
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
    return isIOS ? "add-to-home-screen" : "unsupported";
  }
  return "ok";
}

// ---------------------------------------------------------------------------
// Outgoing notifications (batched so a burst of edits is one alert)
// ---------------------------------------------------------------------------

type Pending = { messages: string[]; url: string; tag: string };
const buffers = new Map<string, Pending>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const QUIET_MS = 6000;

function flush(kind: string) {
  const pending = buffers.get(kind);
  buffers.delete(kind);
  timers.delete(kind);
  const from = getPerson();
  if (!pending || !from) return;

  const who = personName(from);
  const body =
    pending.messages.length === 1
      ? pending.messages[0]!
      : `${pending.messages[0]!} (+${pending.messages.length - 1} more ${kind === "calendar" ? "calendar changes" : "updates"})`;

  void sendPush({
    data: { from, title: `${who} · ${titleFor(kind)}`, body, url: pending.url, tag: pending.tag },
  }).catch((err) => console.warn("Push notify failed", err));
}

function titleFor(kind: string) {
  if (kind === "calendar") return "Calendar";
  if (kind === "notes") return "Notes";
  if (kind === "devotional") return "Devotionals";
  return "Plan update";
}

/**
 * Queue a notification for the *other* person. Never throws — a failed
 * notification must not affect saving.
 */
export function notifyPartner(
  kind: "money" | "calendar" | "notes" | "devotional",
  message: string,
  url = "/",
) {
  try {
    if (typeof window === "undefined") return;
    if (!getPerson()) return;
    const existing = buffers.get(kind);
    if (existing) existing.messages.push(message);
    else buffers.set(kind, { messages: [message], url, tag: `plan-${kind}` });

    const t = timers.get(kind);
    if (t) clearTimeout(t);
    timers.set(
      kind,
      setTimeout(() => flush(kind), QUIET_MS),
    );
  } catch (err) {
    console.warn("notifyPartner failed", err);
  }
}

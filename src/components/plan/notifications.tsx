import { BellRing, BellOff, Smartphone, Share, CheckCircle2 } from "lucide-react";
import { usePush } from "@/lib/use-push";

export function Notifications() {
  const { person, choosePerson, env, permission, subscribed, busy, status, enable, disable, test } =
    usePush();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy">
          <Smartphone size={17} className="text-royal" /> 1. Who is on this phone?
        </h3>
        <p className="mt-1 text-[12.5px] text-ink-soft">
          Alerts always go to the other person, so we never buzz you for your own edits.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(["andrew", "maria"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => choosePerson(p)}
              className={`rounded-xl border px-4 py-3 text-[14px] font-semibold transition ${
                person === p
                  ? "border-gold bg-gold/10 text-navy"
                  : "border-line bg-paper text-ink-soft hover:border-royal/40"
              }`}
            >
              {p === "andrew" ? "Andrew" : "Maria"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy">
          <BellRing size={17} className="text-teal" /> 2. Turn on notifications
        </h3>

        {env === "open-in-new-tab" && (
          <p className="mt-2 rounded-xl bg-gold/10 px-3 py-2 text-[12.5px] text-navy">
            Open the app in its own browser tab (not this preview window) to turn notifications on.
          </p>
        )}
        {env === "add-to-home-screen" && (
          <p className="mt-2 flex gap-2 rounded-xl bg-gold/10 px-3 py-2 text-[12.5px] text-navy">
            <Share size={15} className="mt-0.5 shrink-0" />
            On iPhone: tap Share → “Add to Home Screen”, open the app from the home screen icon,
            then come back here and tap Enable.
          </p>
        )}
        {env === "unsupported" && (
          <p className="mt-2 rounded-xl bg-paper px-3 py-2 text-[12.5px] text-ink-soft">
            This browser doesn’t support push notifications.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || env !== "ok" || !person}
            onClick={() => (subscribed ? void disable() : void enable())}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-white transition disabled:opacity-50 ${
              subscribed ? "bg-navy/70 hover:bg-navy" : "bg-teal hover:brightness-110"
            }`}
          >
            {subscribed ? <BellOff size={16} /> : <BellRing size={16} />}
            {subscribed ? "Turn off on this device" : "Enable notifications"}
          </button>
          {subscribed && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void test()}
              className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-[13.5px] font-semibold text-navy transition hover:border-royal/50 disabled:opacity-50"
            >
              Send test
            </button>
          )}
        </div>

        {subscribed && (
          <p className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold text-teal">
            <CheckCircle2 size={15} /> This device is registered
            {person ? ` as ${person === "andrew" ? "Andrew" : "Maria"}` : ""}.
          </p>
        )}
        {permission === "denied" && (
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Notifications are blocked in your device settings for this app — allow them there first.
          </p>
        )}
        {status && <p className="mt-2 text-[12.5px] text-ink-soft">{status}</p>}
      </div>

      <div className="rounded-2xl border border-line bg-paper p-5 lg:col-span-2">
        <h3 className="text-[14px] font-bold text-navy">What triggers an alert</h3>
        <ul className="mt-2 grid gap-1.5 text-[12.5px] text-ink-soft sm:grid-cols-2">
          <li>• Any money change (budget, funds, payments, expenses, lease, furnishing)</li>
          <li>• Calendar events added, edited, completed or deleted</li>
          <li>• New shared notes and comments</li>
          <li>• Devotional reflections saved</li>
        </ul>
        <p className="mt-3 text-[12px] text-ink-soft">
          Quick bursts of edits are grouped into a single alert so your phone doesn’t buzz on every
          keystroke.
        </p>
      </div>
    </div>
  );
}

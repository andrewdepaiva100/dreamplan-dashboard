# Push Notifications for Andrew & Maria

Get a real phone notification when the other person changes money, adds a calendar event, or posts a note or devotional reflection.

## How it will work

1. Each phone adds the app to the Home Screen (required by iPhone for push).
2. Open the app, tap "Notifications", pick who you are (Andrew or Maria), and allow notifications once.
3. From then on, whenever one of you makes a change, the other phone gets a push alert like:
   - "Maria marked Payment 2 as paid — $3,905.00"
   - "Andrew added a calendar event: Dinner with family, Sept 14"
   - "Maria posted a note"
4. Tapping the notification opens the app on the matching section.

You never get notified about your own edits, only the other person's.

## What gets built

**Who am I**
- A one-time "I'm Andrew" / "I'm Maria" choice, remembered on each device and attached to every change so alerts can be addressed to the right person.

**Notification setup screen**
- New "Notifications" card on the dashboard: enable/disable, current status, which device is registered, and a "Send test notification" button.
- Clear guidance when notifications can't be enabled yet (e.g. still viewing in the Lovable preview frame, or not yet added to Home Screen on iPhone).

**Triggers**
- Money: budget/funds edits, wedding payments toggled, expenses added or removed, lease/savings amounts changed.
- Calendar: event added, edited, deleted.
- Notes & devotionals: shared notes posted, devotional reflections saved.
- Batching: rapid edits within ~30 seconds collapse into one alert ("Maria made 4 budget updates") so you aren't spammed while someone types.

**Home-screen app support**
- Add a web app manifest (name, icons, theme colors, standalone display) so the app installs properly on both phones — needed for iOS push.

## Technical notes

- Standard Web Push (VAPID), no third-party push service. A VAPID key pair is generated and stored as project secrets; the public key is exposed to the browser.
- New `push_subscriptions` table in the backend: endpoint, keys, person (`andrew`/`maria`), device label, created/last-seen timestamps. Shared-access RLS matching the app's existing shared model, with grants.
- Service worker at `public/push-sw.js` handling `push` and `notificationclick` only (no offline caching, no app-shell worker), registered from a guarded wrapper that skips iframes and the preview host.
- Sending happens server-side in a TanStack server function using an edge-compatible Web Push library (Web Crypto based, Cloudflare Workers safe). It signs the VAPID JWT and posts encrypted payloads to each subscription of the *other* person; 404/410 responses delete stale subscriptions.
- A small `notify()` helper is called from existing mutation paths in `use-plan.ts` and `use-calendar.ts`; it debounces and posts a summary to the server function. Notification failures never block a save.
- Notifications are best-effort: they do not replace the existing realtime sync, which continues to update both screens live.

## Caveats to expect

- iPhone only delivers web push when the app is added to the Home Screen and opened at least once from there; Safari tabs won't get alerts.
- Notifications must be allowed per device; if either of you denies the prompt, it has to be re-enabled in iPhone Settings for the installed app.
- Delivery is not guaranteed instant if the phone is offline; iOS queues and delivers when it reconnects.

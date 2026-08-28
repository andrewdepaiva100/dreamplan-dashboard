import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Unlock — Andrew & Maria's Financial Plan" },
      {
        name: "description",
        content: "Private financial plan. Enter the shared password to view the dashboard.",
      },
      { property: "og:title", content: "Unlock — Andrew & Maria's Financial Plan" },
      {
        property: "og:description",
        content: "Private financial plan protected by a shared password.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setBusy(true);
    setError(false);
    try {
      const { ok } = await unlock({ data: { password } });
      if (ok) await router.navigate({ to: "/" });
      else setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[22px] bg-[image:var(--gradient-cover)] px-8 py-12 text-center shadow-[var(--shadow-cover)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky">Private</p>
          <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight text-white">
            Our Financial Master Plan
          </h1>
          <p className="font-serif-italic text-[17px] italic text-sky">
            For Andrew &amp; Maria only
          </p>
          <div className="mx-auto mt-5 h-0.5 w-16 bg-gold" />
        </div>

        <form onSubmit={onSubmit} className="card-surface mt-6 rounded-[18px] px-7 py-8">
          <label
            htmlFor="password"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-royal"
          >
            Shared password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            className="mt-2 w-full rounded-lg border border-mist bg-white px-3 py-2.5 text-navy focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/10"
          />
          {error && (
            <p className="mt-2 text-[13.5px] font-semibold text-destructive">
              That password isn&apos;t right — try again.
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-navy px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Unlocking…" : "Unlock plan"}
          </button>
        </form>
      </div>
    </main>
  );
}

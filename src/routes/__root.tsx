import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Try again</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital@0;1&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const installPlanningCard = () => {
      const nav = document.querySelector("main nav");
      if (!nav || document.getElementById("marriage-invitations-planning-group")) return false;

      const section = document.createElement("section");
      section.id = "marriage-invitations-planning-group";
      section.className = "rounded-2xl border border-white/15 bg-navy/20 p-3.5 shadow-sm backdrop-blur-sm sm:p-4";
      section.innerHTML = `
        <div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 class="text-[12px] font-bold uppercase tracking-[0.16em] text-gold">Planning</h2>
            <p class="text-[11px] text-sky/75">Wedding details and guest organization.</p>
          </div>
          <span class="text-[10.5px] font-medium text-sky/60">1 tool</span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/guests" class="group flex min-h-[112px] items-center gap-3 rounded-2xl border border-gold/55 bg-gold/20 px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-xl transition-transform group-hover:scale-105" aria-hidden="true">💍</span>
            <span class="min-w-0 flex-1">
              <span class="block text-[13.5px] font-bold leading-snug text-navy">Marriage Invitations</span>
              <span class="mt-0.5 block text-[11px] leading-snug text-ink-soft">View, add, remove & organize guests</span>
            </span>
            <span class="ml-auto text-base font-semibold text-navy/45">›</span>
          </a>
        </div>`;
      nav.appendChild(section);
      return true;
    };

    if (installPlanningCard()) return;
    const observer = new MutationObserver(() => {
      if (installPlanningCard()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

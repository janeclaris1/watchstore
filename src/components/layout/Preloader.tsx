"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";

const MIN_INITIAL_MS = 1100;
const MIN_NAV_MS = 700;
const MAX_MS = 3200;
const EXIT_MS = 480;

function isSkippablePath(path: string | null | undefined) {
  return !!path?.startsWith("/admin") || !!path?.startsWith("/maintenance");
}

function internalNavHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }

  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor) return null;

  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return null;
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) return null;
  if (isSkippablePath(url.pathname)) return null;

  const next = `${url.pathname}${url.search}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (next === current) return null;

  return next;
}

export function Preloader() {
  const pathname = usePathname();
  const skipRoute = isSkippablePath(pathname);

  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const startedAt = useRef(0);
  const minMs = useRef(MIN_INITIAL_MS);
  const hideTimer = useRef<number | null>(null);
  const failsafeTimer = useRef<number | null>(null);
  const pathAtShow = useRef(pathname);

  const clearTimers = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (failsafeTimer.current) window.clearTimeout(failsafeTimer.current);
    hideTimer.current = null;
    failsafeTimer.current = null;
  };

  const hide = () => {
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, minMs.current - elapsed);

    hideTimer.current = window.setTimeout(() => {
      setLeaving(true);
      hideTimer.current = window.setTimeout(() => {
        setVisible(false);
        setLeaving(false);
      }, EXIT_MS);
    }, wait);
  };

  const show = (duration: number) => {
    clearTimers();
    document.documentElement.classList.remove("preload-skip");
    minMs.current = duration;
    startedAt.current = Date.now();
    pathAtShow.current = window.location.pathname;
    setLeaving(false);
    setVisible(true);
    failsafeTimer.current = window.setTimeout(hide, MAX_MS);
  };

  // First paint / hard load
  useEffect(() => {
    if (skipRoute) return;

    show(MIN_INITIAL_MS);

    const onLoad = () => hide();
    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", onLoad);
    }

    return () => {
      window.removeEventListener("load", onLoad);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial mount only
  }, [skipRoute]);

  // Internal link clicks
  useEffect(() => {
    if (skipRoute) return;

    const onClick = (event: MouseEvent) => {
      if (!internalNavHref(event)) return;
      show(MIN_NAV_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipRoute]);

  // Hide once the App Router finishes navigating
  useEffect(() => {
    if (skipRoute || !visible || leaving) return;
    if (pathname === pathAtShow.current) return;
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, skipRoute, visible, leaving]);

  useEffect(() => {
    if (!visible || leaving || skipRoute) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible, leaving, skipRoute]);

  if (skipRoute || !visible) return null;

  return (
    <div
      className={`preloader fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white ${
        leaving ? "preloader--leave" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading COSY AURA WATCH STORE"
    >
      <div className="preloader__glow" aria-hidden="true" />

      <div className="preloader__content relative flex flex-col items-center gap-10 px-6">
        <div className="preloader__logo">
          <div className="preloader__logo-inner">
            <BrandLogo size="lg" className="scale-[1.35] md:scale-[1.55]" />
          </div>
        </div>

        <div className="preloader__bar" aria-hidden="true">
          <span className="preloader__bar-fill" />
        </div>
      </div>
    </div>
  );
}

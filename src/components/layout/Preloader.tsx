"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const MIN_INITIAL_MS = 600;
const MIN_NAV_MS = 450;
const MAX_MS = 3200;
const EXIT_MS = 280;

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

function LogoSpinner({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="preloader__mark"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="22" y="2" width="20" height="10" rx="2.5" />
      <rect x="22" y="52" width="20" height="10" rx="2.5" />
      <path d="M20 12h8l-3 7h-5z" />
      <path d="M36 12h8v7h-5l-3-7z" />
      <path d="M20 45h5l3 7h-8z" />
      <path d="M39 45h5v7h-8l3-7z" />
      <circle cx="32" cy="32" r="18" />
      <rect x="49" y="27" width="5" height="10" rx="1.5" />
      <circle cx="32" cy="32" r="12" fill="#fff" />
      <path
        d="M32 32l-6-8"
        stroke="#1A1A1A"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 32l7-3"
        stroke="#1A1A1A"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="32" r="2" fill="#1A1A1A" />
    </svg>
  );
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

  useEffect(() => {
    if (skipRoute || !visible || leaving) return;
    if (pathname === pathAtShow.current) return;
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, skipRoute, visible, leaving]);

  if (skipRoute || !visible) return null;

  return (
    <div
      className={`preloader ${leaving ? "preloader--leave" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="preloader__spinner" aria-hidden="true">
        <LogoSpinner />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";

export const PRELOADER_SESSION_KEY = "cosy-aura-preloader-seen";
const MIN_MS = 1100;
const MAX_MS = 3200;

export function Preloader() {
  const pathname = usePathname();
  const skipRoute =
    !!pathname?.startsWith("/admin") || !!pathname?.startsWith("/maintenance");

  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (skipRoute) {
      setGone(true);
      return;
    }

    try {
      if (sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1") {
        setGone(true);
        return;
      }
    } catch {
      // ignore
    }

    const started = Date.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;

      const wait = Math.max(0, MIN_MS - (Date.now() - started));

      window.setTimeout(() => {
        setLeaving(true);
        try {
          sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
        } catch {
          // ignore
        }
        window.setTimeout(() => setGone(true), 520);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }

    const failsafe = window.setTimeout(finish, MAX_MS);

    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(failsafe);
    };
  }, [skipRoute]);

  useEffect(() => {
    if (gone || skipRoute || leaving) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gone, skipRoute, leaving]);

  if (skipRoute || gone) return null;

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

      <div className="preloader__content relative flex flex-col items-center gap-8 px-6">
        <div className="preloader__logo">
          <BrandLogo size="lg" />
        </div>

        <div className="preloader__ring" aria-hidden="true">
          <span className="preloader__hand preloader__hand--hour" />
          <span className="preloader__hand preloader__hand--minute" />
          <span className="preloader__pivot" />
        </div>

        <p className="preloader__tagline font-cantora text-[11px] tracking-[0.35em] uppercase text-wf-gray">
          New luxury watches
        </p>

        <div className="preloader__bar" aria-hidden="true">
          <span className="preloader__bar-fill" />
        </div>
      </div>
    </div>
  );
}

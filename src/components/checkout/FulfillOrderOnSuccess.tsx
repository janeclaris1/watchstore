"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function FulfillOrderOnSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || status !== "idle") return;

    let cancelled = false;
    setStatus("working");

    (async () => {
      try {
        const res = await fetch("/api/checkout/fulfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setStatus("error");
          setMessage(data.reason || data.error || "Could not confirm order");
          return;
        }
        setStatus("done");
        if (data.reason === "Already fulfilled") {
          setMessage("Order already confirmed.");
        } else {
          setMessage("Confirmation email sent.");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not confirm order email.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, status]);

  if (!sessionId) return null;

  return (
    <p className="text-sm text-wf-gray mb-4">
      {status === "working" && "Confirming your order…"}
      {status === "done" && (message || "Order confirmed.")}
      {status === "error" && (
        <span className="text-amber-700">
          {message} If you were charged, contact support with your session id.
        </span>
      )}
    </p>
  );
}

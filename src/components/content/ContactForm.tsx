"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-sm font-medium text-wf-black mb-1.5">
            Name
          </span>
          <input
            name="name"
            required
            className="w-full border border-wf-border rounded px-4 py-3 text-sm focus:outline-none focus:border-gold"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-wf-black mb-1.5">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-wf-border rounded px-4 py-3 text-sm focus:outline-none focus:border-gold"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="block text-sm font-medium text-wf-black mb-1.5">
          Subject
        </span>
        <input
          name="subject"
          required
          className="w-full border border-wf-border rounded px-4 py-3 text-sm focus:outline-none focus:border-gold"
          placeholder="How can we help?"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-wf-black mb-1.5">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full border border-wf-border rounded px-4 py-3 text-sm focus:outline-none focus:border-gold resize-y"
          placeholder="Tell us more about your enquiry..."
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-gold disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
      {status === "sent" && (
        <p className="text-sm text-green-700">
          Thank you — we&apos;ll get back to you within one business day.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
    </form>
  );
}

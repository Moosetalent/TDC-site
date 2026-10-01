"use client";

import { useState } from "react";

// Catch Hook webhook (Zapier) -> Create Database Item (Notion). Free Zapier
// plan: 100 tasks/mo, two-step Zaps, which is exactly this setup.
const ZAPIER_ENDPOINT =
  "https://hooks.zapier.com/hooks/catch/24545096/4mzrv9l/";

type Status = "idle" | "sending" | "sent" | "error";

export default function DeployedForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("sending");
    try {
      // no-cors: Zapier's catch-hook response isn't readable from the
      // browser anyway, and we don't want a CORS quirk to look like a
      // failed submission when the webhook actually received it fine.
      await fetch(ZAPIER_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="deployed__form">
        <div className="join__confirm">
          <div className="join__confirm-tag">&gt;_ nomination received</div>
          <div className="join__confirm-title">
            Thanks — we&apos;ve got it.
          </div>
          <div className="join__confirm-body">
            Nominees are reviewed monthly. We&apos;ll be in touch before
            anything goes live.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="deployed__form" onSubmit={handleSubmit}>
      <div className="deployed__row">
        <label className="field">
          FDE&apos;s name
          <input name="nominee" required placeholder="Full name" />
        </label>
        <label className="field">
          Company
          <input
            name="company"
            required
            placeholder="Where they deploy from"
          />
        </label>
      </div>

      <label className="field">
        LinkedIn
        <input name="link" type="url" placeholder="https://" />
      </label>

      <label className="field">
        What did they ship?
        <textarea
          name="why"
          required
          placeholder="The customer, the problem, the result. A few lines is plenty."
        />
      </label>

      <div className="deployed__row deployed__row--three">
        <label className="field">
          Your name
          <input name="nominator" placeholder="Full name" />
        </label>
        <label className="field">
          Company
          <input name="nominator_company" placeholder="Where you work" />
        </label>
        <label className="field">
          Your email
          <input name="email" type="email" placeholder="you@company.com" />
        </label>
      </div>

      <button
        type="submit"
        className="glass glass--orange deployed__submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Submitting…" : "Submit nomination"}
      </button>

      {status === "error" && (
        <div className="deployed__note">
          That didn&apos;t send. Check your connection and try again.
        </div>
      )}
    </form>
  );
}

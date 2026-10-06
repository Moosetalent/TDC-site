"use client";

import { useState } from "react";

const ROLES = [
  { value: "fde", label: "Forward deployed engineer" },
  { value: "aspiring", label: "Aspiring FDE" },
  { value: "founder", label: "Founder" },
  { value: "hiring", label: "Hiring manager" },
];

// Catch Hook webhook (Zapier) -> Lookup Table (role code -> label) ->
// Create Data Source Item (Notion). Body must be sent as
// application/x-www-form-urlencoded (via URLSearchParams) rather than
// JSON.stringify: under fetch's no-cors mode the browser can only send a
// CORS-safelisted Content-Type, so a JSON body silently gets sent as
// text/plain and Zapier's Catch Hook can't parse it into individual fields.
const ZAPIER_ENDPOINT =
  "https://hooks.zapier.com/hooks/catch/24545096/4mzjnhj/";

type Status = "idle" | "sending" | "sent" | "error";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("fde");
  const [city, setCity] = useState("");
  const [lastDeploy, setLastDeploy] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("sending");
    try {
      // no-cors: Zapier's catch-hook response isn't readable from the
      // browser anyway, and we don't want a CORS quirk to look like a
      // failed submission when the webhook actually received it fine.
      await fetch(ZAPIER_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          name,
          email,
          role,
          city,
          lastDeploy,
        }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div id="form" className="join__form">
        <div className="join__confirm">
          <div className="join__confirm-tag">&gt;_ deploy accepted</div>
          <div className="join__confirm-title">
            You&apos;re in the queue, {name}.
          </div>
          <div className="join__confirm-body">
            A human reviews every request. Expect a reply within one release
            cycle.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form id="form" className="join__form" onSubmit={handleSubmit}>
      <label className="field">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
        />
      </label>

      <label className="field">
        Work email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </label>

      <label className="field">
        Role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        City
        <input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="San Francisco"
        />
      </label>

      <label className="field">
        What did you deploy last?
        <input
          value={lastDeploy}
          onChange={(e) => setLastDeploy(e.target.value)}
          placeholder="One line. Specifics beat adjectives."
        />
      </label>

      <button
        type="submit"
        className="glass glass--orange join__submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Submitting…" : "Apply to Join"}
      </button>

      <div className="join__note">
        {status === "error"
          ? "That didn't send. Check your connection and try again."
          : "No spam. One email per release cycle."}
      </div>
    </form>
  );
}

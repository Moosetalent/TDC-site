"use client";

import { useState } from "react";

const ROLES = [
  { value: "fde", label: "Forward deployed engineer" },
  { value: "aspiring", label: "Aspiring FDE" },
  { value: "founder", label: "Founder" },
  { value: "hiring", label: "Hiring manager" },
];

export default function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("fde");
  const [city, setCity] = useState("");
  const [lastDeploy, setLastDeploy] = useState("");
  const [joined, setJoined] = useState(false);

  // Client-side only: swap the card to its confirmation state. Wire this up to
  // an API route or email provider when there is somewhere to send it.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void { name, email, role, city, lastDeploy };
    setJoined(true);
  }

  if (joined) {
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

      <button type="submit" className="glass glass--orange join__submit">
        Request to join
      </button>

      <div className="join__note">No spam. One email per release cycle.</div>
    </form>
  );
}

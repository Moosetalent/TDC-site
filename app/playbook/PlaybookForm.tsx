"use client";

import { useState } from "react";
import Link from "next/link";

const ROLES = [
  "Forward deployed engineer",
  "Aspiring FDE",
  "Founder",
  "Hiring manager",
];

// Catch Hook webhook (Zapier) -> Create Data Source Item (Notion
// "Playbook Downloads"). Role is sent as its label so the Zap needs no
// Lookup Table step (keeps it a two-step Zap on the free plan).
//
// Same encoding rules as JoinForm: URLSearchParams, not JSON, because
// no-cors only allows CORS-safelisted Content-Types.
//
// TODO: paste the Catch Hook URL from the "Playbook Downloads" Zap here.
// While it's empty the form still unlocks the download, but nothing is
// recorded in Notion.
const ZAPIER_ENDPOINT = "";

const PLAYBOOK_PDF =
  "/downloads/The-Forward-Deployed-Engineer-Playbook.pdf";

type Status = "idle" | "sending" | "sent";

function sourceFromUrl() {
  // ?src=linkedin on the link you DM lets you see where downloads came from.
  if (typeof window === "undefined") return "direct";
  const src = new URLSearchParams(window.location.search).get("src");
  return src ? src.slice(0, 60) : "direct";
}

export default function PlaybookForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    if (ZAPIER_ENDPOINT) {
      try {
        await fetch(ZAPIER_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams({
            name,
            email,
            role,
            company,
            source: sourceFromUrl(),
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch {
        // Never hold the playbook hostage to a webhook hiccup.
      }
    }

    setStatus("sent");
  }

  if (status === "sent") {
    const firstName = name.trim().split(/\s+/)[0] || "there";
    return (
      <div id="form" className="join__form">
        <div className="join__confirm">
          <div className="join__confirm-tag">&gt;_ deploy successful</div>
          <div className="join__confirm-title">It&apos;s yours, {firstName}.</div>
          <div className="join__confirm-body">
            36 pages, four templates. Keep it, share it, argue with it.
          </div>
          <a
            href={PLAYBOOK_PDF}
            download
            className="glass glass--orange join__submit playbook__download"
          >
            Download the playbook
          </a>
        </div>
        <div className="playbook__next">
          <div className="playbook__next-title">Want to work on this with other FDEs?</div>
          <div className="playbook__next-body">
            The Deployment Club is a members-only community for the people
            doing this work. Membership is free and reviewed by humans.
          </div>
          <Link href="/join" className="playbook__next-link">
            Apply to join <span className="accent">&rarr;</span>
          </Link>
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
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Company
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Optional"
        />
      </label>

      <button
        type="submit"
        className="glass glass--orange join__submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Unlocking…" : "Get the playbook"}
      </button>

      <div className="join__note">
        Free. No spam. We&apos;ll only email you about the club.
      </div>
    </form>
  );
}

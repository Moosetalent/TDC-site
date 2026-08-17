import type { Metadata } from "next";
import Nav from "../components/Nav";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
  title: "Join the Club — The Deployment Club",
  description:
    "Membership is free and reviewed by humans. Tell us what you deploy and where — we'll match you to the nearest chapter.",
};

const STATS = [
  "400+ FDEs and counting",
  "14 city chapters",
  "One demo night a month",
];

export default function Join() {
  return (
    <div className="page">
      <Nav current="chapters" ctaHref="#form" />

      <main className="join">
        <div className="join__intro">
          <div className="join__eyebrow">&gt;_ init membership</div>
          <h1 className="join__title">
            Your finger is already on the <span className="accent">key</span>.
          </h1>
          <p className="join__sub">
            Membership is free and reviewed by humans. Tell us what you deploy
            and where — we&apos;ll match you to the nearest chapter.
          </p>
          <div className="join__stats">
            {STATS.map((stat) => (
              <div key={stat}>
                <span className="accent">&gt;</span> {stat}
              </div>
            ))}
          </div>
        </div>

        <JoinForm />
      </main>
    </div>
  );
}

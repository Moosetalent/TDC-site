import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "Manifesto — The Deployment Club",
  description:
    "Great people. Real problems. Technology deployed where it matters.",
};

const RULES = [
  { num: "/01", text: "No BS, bring your A game & innovate with peers." },
  {
    num: "/02",
    text:
      "What’s shared in the room stays in the room. Incident stories are off the record.",
  },
  {
    num: "/03",
    text: "Specifics beat adjectives. Bring numbers, logs, and timelines.",
  },
  { num: "/04", text: "No pitching, no recruiting spam. Peers first." },
];

export default function Manifesto() {
  return (
    <div className="page">
      <Nav current="manifesto" />

      <main className="manifesto">
        <div className="manifesto__eyebrow">&gt;_ manifesto</div>
        <h1 className="manifesto__title">
          Great people. Real problems. Technology deployed where it matters.
        </h1>

        <div className="manifesto__body">
          <p>
            Software isn&apos;t finished when it compiles. It&apos;s finished
            when someone else is using it. Between those two moments sits the
            hardest, least glamorous work in the industry — and the people who
            do it rarely have a room of their own.
          </p>
          <p>
            This is that room. The Deployment Club is a private community for
            forward deployed engineers, the people who show up on-site, sit next
            to the customer, and make the technology actually work in the mess
            of the real world.
          </p>
          <div className="pull-quote">
            We believe the last mile is the whole job. Everything before it is
            preparation.
          </div>
          <p>
            We keep it simple. You demo what you deployed, not what you planned.
            Numbers beat adjectives. Postmortems stay off the record. And nobody
            presents a slide deck about work they haven&apos;t shipped.
          </p>
        </div>

        <div className="rules">
          <div className="rules__eyebrow">The rules</div>
          {RULES.map((rule) => (
            <div key={rule.num} className="rule">
              <div className="rule__num">{rule.num}</div>
              <div className="rule__text">{rule.text}</div>
            </div>
          ))}
        </div>

        <div className="manifesto__ctas">
          <Link href="/join" className="glass glass--orange btn-lg btn-lg--primary">
            Join the club
          </Link>
          <Link href="/" className="glass btn-lg">
            Back home
          </Link>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "Manifesto | The Deployment Club",
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
            when someone else is using it, and somewhere between those two
            moments is the only room in the building where the roadmap and
            the real world actually meet.
          </p>
          <p>
            That room belongs to forward deployed engineers. You&apos;re the
            feedback loop between the people building the product and the
            people paying for it: the first to hear when something&apos;s
            broken, the first to see when something clicks. You understand
            product-market fit before the CEO does, because you&apos;re
            standing next to the customer when it happens.
          </p>
          <div className="pull-quote">
            We believe the last mile is the whole job. Everything before it is
            preparation.
          </div>
          <p>
            The best parts of the job rarely make it into a case study: the
            late night shipping the fix that actually moves a customer&apos;s
            numbers, the moment a skeptic turns into a champion. We think
            that deserves a room of its own.
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

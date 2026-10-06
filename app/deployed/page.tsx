import type { Metadata } from "next";
import Image from "next/image";
import Nav from "../components/Nav";
import DeployedForm from "./DeployedForm";

export const metadata: Metadata = {
  title: "Deployed | The Deployment Club",
  description:
    "The forward deployed engineers making AI actually work inside real companies. Nominated by the industry, shipped to the front page.",
};

type Nominee = {
  name: string;
  role: string;
  photo: string;
  feature?: boolean;
};

const ROSTER: Nominee[] = [
  {
    name: "Shweta Kumar",
    role: "Senior FDE | HappyRobot",
    photo: "/assets/deployed/shweta-kumar.jpg",
    feature: true,
  },
  {
    name: "Isabel Gomez",
    role: "FDE | OpenAI",
    photo: "/assets/deployed/isabel-gomez.jpg",
  },
  {
    name: "Kevin Bai",
    role: "Applied AI | Anthropic",
    photo: "/assets/deployed/kevin-bai.jpg",
  },
  {
    name: "Senta Knuth",
    role: "Enterprise Product Deployment | ElevenLabs",
    photo: "/assets/deployed/senta-knuth.jpg",
  },
  {
    name: "Lane Versteeg",
    role: "Head of FDE | Bland",
    photo: "/assets/deployed/lane-versteeg.jpg",
  },
  {
    name: "James Hiester",
    role: "Solutions Architect | OpenAI",
    photo: "/assets/deployed/james-hiester.jpg",
  },
  {
    name: "Sasha Rich",
    role: "Founding Engineer | WithCoverage",
    photo: "/assets/deployed/sasha-rich.jpg",
  },
  {
    name: "Dylan Barnacle",
    role: "TPM | Realm Alliance (ex-Palantir)",
    photo: "/assets/deployed/dylan-barnacle.jpg",
  },
];

export default function Deployed() {
  const feature = ROSTER.find((person) => person.feature);
  const rest = ROSTER.filter((person) => !person.feature);

  return (
    <div className="page">
      <Nav current="deployed" />

      <main className="deployed">
        <div className="deployed__hero">
          <div className="deployed__eyebrow">
            FDEs you should know &middot; Monthly
          </div>
          <h1 className="deployed__title">
            <span className="accent">Deployed</span>.
          </h1>
          <p className="deployed__sub">
            The forward deployed engineers making AI actually work inside real
            companies. Nominated by the industry, shipped to the front page.
          </p>
          <div className="deployed__ctas">
            <a
              href="#nominate"
              className="glass glass--orange btn-lg btn-lg--primary"
            >
              Nominate an FDE
            </a>
            <a href="#roster" className="glass btn-lg">
              See this month
            </a>
          </div>
        </div>

        <div className="deployed__criteria">
          <p className="deployed__criteria-lede">
            Chosen through nominations, referrals, and our own scouting, with
            five things in mind:
          </p>
          <p className="deployed__criteria-five">
            Shipped. <span className="accent">Embedded.</span> Unblocked.{" "}
            <span className="accent">Trusted.</span> Generous.
          </p>
          <p className="deployed__criteria-fine">
            Final picks are made by The Deployment Club.
          </p>
        </div>

        <div id="roster" className="deployed__roster-head">
          <div className="deployed__roster-meta">Now deploying</div>
          <h2 className="deployed__roster-month">October 2026</h2>
        </div>

        <div className="deployed__grid">
          {feature && (
            <div className="deployed__card deployed__card--feature">
              <div className="deployed__photo">
                <span className="deployed__badge">FDE of the month</span>
                <Image
                  src={feature.photo}
                  alt={feature.name}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center 20%" }}
                />
              </div>
              <div className="deployed__who">
                <div className="deployed__name">{feature.name}</div>
                <div className="deployed__role">{feature.role}</div>
              </div>
            </div>
          )}

          {rest.map((person) => (
            <div key={person.name} className="deployed__card">
              <div className="deployed__photo">
                <Image
                  src={person.photo}
                  alt={person.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="deployed__who">
                <div className="deployed__name">{person.name}</div>
                <div className="deployed__role">{person.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div id="nominate" className="deployed__nominate">
          <div>
            <h2 className="deployed__nominate-title">
              Know an FDE who <span className="accent">belongs here?</span>
            </h2>
            <p className="deployed__nominate-sub">
              The best deployments rarely get a shout-out. Tell us who made
              one work.
            </p>
          </div>

          <DeployedForm />
        </div>
      </main>
    </div>
  );
}

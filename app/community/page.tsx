import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "Community | The Deployment Club",
  description:
    "A private community and network for forward deployed engineers and the founders, leaders, and operators who build FDE teams.",
};

type Included = {
  path: string;
  name: string;
  text: string;
  feature?: boolean;
  link?: { href: string; label: string };
};

const INCLUDED: Included[] = [
  {
    path: "~/network",
    name: "Member community",
    text: "Your bench of people who've been there. Ask the questions you can't ask at work, like how to price a pilot, when to push back on a customer, or whether that offer is actually good, and get answers from people who've done it.",
  },
  {
    path: "~/dinners & parties",
    name: "Dinners & Parties",
    text: "Small, invite-only dinners where the war stories and comp talk stay in the room. Then the other end of the scale: not another tech event with a few speakers, sandwiches and free drinks, but a proper FDE shindig. Big venue, tons of swag, great people, and a ridiculous party the community actually remembers.",
  },
  {
    path: "~/deployed",
    name: "Deployed",
    text: "Our monthly, industry-nominated list of FDEs you should know. It spotlights engineers doing exceptional work in the field, nominated by the people who've watched them do it.",
    feature: true,
    link: { href: "/deployed", label: "See Deployed" },
  },
  {
    path: "~/roles",
    name: "Early roles",
    text: "FDE and deployment roles we hear about first, often before a job description exists. Each one comes with the real picture: who you'd work with, what the customers are like, and how much you'd be on the road.",
  },
  {
    path: "~/field-notes",
    name: "Playbooks & field notes",
    text: "What's working in forward deployed engineering: how the best teams scope, ship, hand off, and scale. Written by practitioners, for practitioners.",
  },
  {
    path: "~/kit",
    name: "Member kit",
    text: "Every member gets a TDC kit when they join. It's not the usual t-shirt and sticker. Coming soon!",
  },
];

export default function Community() {
  return (
    <div className="page">
      <Nav current="community" />

      <main className="community">
        <section className="community__intro">
          <div className="community__eyebrow">&gt;_ community</div>
          <h1 className="community__title">
            The best FDEs aren&apos;t made in a classroom. They&apos;re made
            in the <span className="accent">field.</span>
          </h1>

          <div className="community__body">
            <p>
              Forward deployed engineering is a craft you learn by doing it:
              on a customer&apos;s site, inside their messiest systems,
              shipping under pressure, translating between what they asked
              for and what they actually need.
            </p>
            <p>
              It can also be lonely. You&apos;re often the only engineer in
              the room, a long way from your own team, solving problems
              nobody on the roadmap has seen yet.
            </p>
            <p>
              Most of what makes a great FDE never gets written down. It
              lives in the war stories: the deployment that almost went
              sideways, the integration nobody thought would work, the
              moment a customer went from skeptic to champion. That
              knowledge moves between people, not through docs.
            </p>
            <blockquote className="pull-quote">
              Nobody gets good at this alone. You get good by being around
              people who&apos;ve already been in the room you&apos;re about
              to walk into.
              <cite>The Deployment Club</cite>
            </blockquote>
            <p className="community__lede">
              So we built a home base for people who spend most of their
              time on someone else&apos;s turf.
            </p>
            <p>
              TDC is a private community and network for forward deployed
              engineers and the founders, leaders, and operators who build
              FDE teams. We bring it together over dinners and parties.
              Members include people doing the job today, people who&apos;ve
              moved on to start companies, and people quietly working out
              what comes next.
            </p>
            <p>
              Nobody&apos;s here to teach you a framework or sell you a
              course. The people here learned the job the same way you did,
              on live deployments.
            </p>
            <p>
              We keep it simple: get good people together often enough that
              they stop being strangers. After that, you&apos;ll find people
              swapping playbooks, making intros, and texting each other at
              11pm from a customer&apos;s office.
            </p>
          </div>
        </section>

        <figure className="community__scene">
          <Image
            src="/assets/community-party.jpg"
            alt="A packed warehouse party with an orange neon Deploy Together sign on the screen"
            width={1496}
            height={1051}
            sizes="(max-width: 1120px) 100vw, 1040px"
          />
          <figcaption className="community__scene-caption">
            <div>
              <div className="community__scene-tag">~/dinners &amp; parties</div>
              <p className="community__scene-line">
                Big venue. Tons of swag. A party the FDE community actually
                remembers.
              </p>
            </div>
          </figcaption>
        </figure>

        <section
          className="community__included"
          aria-labelledby="community-included"
        >
          <div className="community__included-head">
            <h2
              className="community__included-title"
              id="community-included"
            >
              What&apos;s included
            </h2>
            <div className="community__included-meta">
              Members-only &middot; Est. 2026
            </div>
          </div>

          <div className="community__grid">
            {INCLUDED.map((item) => (
              <article
                key={item.name}
                className={`community__card${
                  item.feature ? " community__card--feature" : ""
                }`}
              >
                <div className="community__card-path">{item.path}</div>
                <h3 className="community__card-name">{item.name}</h3>
                <p className="community__card-text">{item.text}</p>
                {item.link && (
                  <Link href={item.link.href} className="community__card-link">
                    {item.link.label} <span>&rarr;</span>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="community__cta">
          <div>
            <h2 className="community__cta-title">Pull up a chair.</h2>
            <p className="community__cta-sub">
              Tell us what you&apos;ve deployed. We&apos;ll take it from
              there.
            </p>
          </div>
          <div className="community__cta-actions">
            <Link
              href="/join"
              className="glass glass--orange btn-lg btn-lg--primary"
            >
              Join the club
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

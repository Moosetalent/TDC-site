import type { Metadata } from "next";
import Image from "next/image";
import Nav from "../components/Nav";
import PlaybookForm from "./PlaybookForm";

export const metadata: Metadata = {
  title: "The FDE Playbook | The Deployment Club",
  description:
    "A free field guide to breaking in, getting hired, shipping real software, and building the teams behind it. 36 pages, four templates.",
  openGraph: {
    title: "The Forward Deployed Engineer Playbook",
    description:
      "A free field guide to breaking in, getting hired, shipping real software, and building the teams behind it.",
    url: "/playbook/",
  },
};

const INSIDE = [
  "Breaking in without the title",
  "What FDE interviews actually test",
  "Your first 30 days",
  "Scoping, shipping, and pilot to production",
  "Career levels and evaluating an offer",
  "Building and hiring an FDE team",
  "Four templates you can use tomorrow",
];

export default function Playbook() {
  return (
    <div className="page">
      <Nav />

      <main className="join">
        <div className="join__intro">
          <div className="join__eyebrow">&gt;_ free field guide</div>
          <h1 className="join__title">
            The FDE <span className="accent">Playbook</span>.
          </h1>
          <p className="join__sub">
            Two companies can post the same FDE title and want completely
            different people. This is the craft, written down: how to break
            in, get hired, ship real software, and build the teams behind it.
          </p>
          <div className="join__stats">
            {INSIDE.map((item) => (
              <div key={item}>
                <span className="accent">&gt;</span> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="playbook__side">
          <div className="playbook__file">
            <Image
              src="/assets/playbook-cover.jpg"
              alt="Cover of The Forward Deployed Engineer Playbook"
              width={720}
              height={932}
              className="playbook__thumb"
              priority
            />
            <div>
              <div className="playbook__file-name">
                The Forward Deployed Engineer Playbook
              </div>
              <div className="playbook__file-meta">
                PDF &middot; 36 pages &middot; v1.0 &middot; Oct 2026
              </div>
            </div>
          </div>
          <PlaybookForm />
        </div>
      </main>
    </div>
  );
}

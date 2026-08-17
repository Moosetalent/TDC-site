import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";

const KEYS = [
  { src: "/assets/key-1.png", alt: "Blank keycap", w: 148, h: 195, cls: "hero__key--1" },
  { src: "/assets/key-2.png", alt: "Terminal keycap", w: 146, h: 195, cls: "hero__key--2" },
  { src: "/assets/key-3.png", alt: "Blank keycap", w: 142, h: 195, cls: "hero__key--3" },
  { src: "/assets/key-4.png", alt: "Deploy keycap", w: 148, h: 195, cls: "hero__key--4" },
];

export default function Home() {
  return (
    <div className="page">
      <Nav />

      <header className="hero">
        <div className="hero__keys">
          {KEYS.map(({ src, alt, w, h, cls }) => (
            <Image
              key={src}
              src={src}
              alt={alt}
              width={w}
              height={h}
              className={cls}
              priority
            />
          ))}
        </div>

        <div className="hero__copy">
          <div className="eyebrow-mono">Members-only · Est. 2026</div>
          <h1 className="hero__title">
            <span className="accent">Deploy</span> Together
          </h1>
          <p className="hero__sub">
            A club for the people who take software the last mile. We meet, we
            demo, we deploy on Fridays.
          </p>
          <div className="hero__ctas">
            <Link href="/join" className="glass glass--orange btn-lg btn-lg--primary">
              Join the club
            </Link>
            <Link href="/manifesto" className="glass btn-lg">
              Read the manifesto
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

type NavKey = "manifesto" | "club" | "chapters";

const LINKS: { key: NavKey; label: string; href: string }[] = [
  { key: "manifesto", label: "Manifesto", href: "/manifesto" },
  { key: "club", label: "The Club", href: "/" },
  { key: "chapters", label: "Chapters", href: "/join" },
];

export default function Nav({
  current,
  ctaHref = "/join",
}: {
  current?: NavKey;
  /** Join page points its CTA at the on-page form instead of a route. */
  ctaHref?: string;
}) {
  return (
    <nav className="nav">
      <Link href="/" className="nav__logo" aria-label="TDC — The Deployment Club">
        <Image
          src="/assets/logo-dark.png"
          alt="TDC — The Deployment Club"
          width={213}
          height={64}
          priority
        />
      </Link>

      <div className="nav__links">
        {LINKS.map(({ key, label, href }) => {
          const isCurrent = key === current;
          return (
            <Link
              key={key}
              href={href}
              className={`glass nav__pill${isCurrent ? " glass--current" : ""}`}
              aria-current={isCurrent ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {ctaHref.startsWith("#") ? (
        <a href={ctaHref} className="glass glass--orange nav__cta">
          Join the club
        </a>
      ) : (
        <Link href={ctaHref} className="glass glass--orange nav__cta">
          Join the club
        </Link>
      )}
    </nav>
  );
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/* Shared renderer for app/opengraph-image.tsx and app/twitter-image.tsx.
   Not a route itself — Next only treats the reserved metadata filenames as
   routes, so a plain module beside them is fine.

   Everything is read from disk at module scope: this runs in Node during the
   build, and satori needs real bytes rather than URLs. The fonts are static
   TTF instances of the site's variable woff2 files, since satori cannot
   decode woff2 (see app/fonts/og/README.md). */

const FONTS = join(process.cwd(), "app/fonts/og");
const ASSETS = join(process.cwd(), "public/assets");

const archivo800 = readFileSync(join(FONTS, "Archivo-800.ttf"));
const archivo400 = readFileSync(join(FONTS, "Archivo-400.ttf"));
const mono400 = readFileSync(join(FONTS, "JetBrainsMono-400.ttf"));

const dataUri = (file: string) =>
  `data:image/png;base64,${readFileSync(join(ASSETS, file)).toString("base64")}`;

/* Widths keep each keycap's native aspect ratio at a 200px row height,
   matching the proportions the hero uses on the site. */
const KEYS = [
  { src: dataUri("key-1.png"), alt: "Blank keycap", w: 152 },
  { src: dataUri("key-2.png"), alt: "Terminal keycap", w: 150 },
  { src: dataUri("key-3.png"), alt: "Blank keycap", w: 146 },
  { src: dataUri("key-4.png"), alt: "Deploy keycap", w: 152 },
];

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "The Deployment Club — Deploy Together. The community solving the biggest bottleneck in AI - Deployment.";

export default function Card() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 44 }}>
          {KEYS.map(({ src, alt, w }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={alt} src={src} alt={alt} width={w} height={200} />
          ))}
        </div>

        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#f5821e",
          }}
        >
          Members-only · Est. 2026
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginTop: 22,
          }}
        >
          <span style={{ color: "#f5821e" }}>Deploy</span>
          <span>&nbsp;Together</span>
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "#b3b3b3",
            marginTop: 22,
          }}
        >
          The community solving the biggest bottleneck in AI - Deployment.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivo800, weight: 800, style: "normal" },
        { name: "Archivo", data: archivo400, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: mono400, weight: 400, style: "normal" },
      ],
    },
  );
}

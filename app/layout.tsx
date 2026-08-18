import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted rather than next/font/google: Next's Google Fonts manifest points
// at Archivo URLs that 404, and self-hosting keeps the build off the network.
// Both files are the latin-subset variable builds, which cover all copy on the
// site (including ·, —, and curly quotes).
const archivo = localFont({
  src: "./fonts/Archivo-latin.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-latin.woff2",
  weight: "400 500",
  style: "normal",
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  // Unfurlers reject relative image paths, and the static export has no
  // request context to infer an origin from, so the production origin is
  // pinned here. app/opengraph-image.tsx and app/twitter-image.tsx are
  // resolved against it automatically.
  //
  // www, not the apex: Vercel 308s thedeployment.club to www, and not every
  // crawler follows a redirect on og:image. Pointing straight at the
  // canonical host removes the hop.
  metadataBase: new URL("https://www.thedeployment.club"),
  title: "The Deployment Club — Deploy Together",
  description:
    "The community solving the biggest bottleneck in AI - Deployment.",
  openGraph: {
    type: "website",
    siteName: "The Deployment Club",
    url: "/",
    title: "The Deployment Club — Deploy Together",
    description:
      "The community solving the biggest bottleneck in AI - Deployment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Deployment Club — Deploy Together",
    description:
      "The community solving the biggest bottleneck in AI - Deployment.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

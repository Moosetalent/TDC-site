/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Every route here prerenders as static HTML — there are no server components
  // needing runtime, API routes, or dynamic rendering. Exporting keeps the
  // deploy to plain files and avoids the serverless bundling layer entirely.
  output: "export",
  // Emits each route as <route>/index.html, which static hosts resolve natively
  // (/manifesto -> /manifesto/index.html) without needing rewrite rules.
  trailingSlash: true,
  images: {
    // Required by `output: "export"`. The keycaps and logo are small,
    // pre-sized PNGs, so they are served as-is.
    unoptimized: true,
  },
};

export default nextConfig;

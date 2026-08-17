/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Every route prerenders as static HTML — no server components needing
  // runtime, no API routes, no dynamic rendering. Exporting to out/ skips
  // Next's serverless bundling step, which fails to trace node_modules on
  // Vercel's builder (ENOENT on client-only / @swc/helpers).
  output: "export",
  // Emits each route as <route>/index.html so a static host resolves
  // /manifesto -> /manifesto/index.html without rewrite rules.
  trailingSlash: true,
  images: {
    // Required by output: "export". The keycaps and logo are small,
    // pre-sized PNGs, so they are served as-is.
    unoptimized: true,
  },
};

export default nextConfig;

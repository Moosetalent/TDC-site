// Required by output: "export" — the card is identical for every visitor, so
// it is rendered once at build time and emitted as a static PNG.
export const dynamic = "force-static";

export { size, contentType, alt, default } from "./og-card";

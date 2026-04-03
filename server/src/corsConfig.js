/**
 * Allowlist CORS origins (Wiz / similar tools flag wide-open cors()).
 * Requests with no Origin (same-origin via reverse proxy, curl) are allowed.
 */
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

export function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return DEFAULT_ORIGINS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsOriginCallback(origin, cb) {
  if (!origin) return cb(null, true);
  const allowed = parseAllowedOrigins();
  if (allowed.includes(origin)) return cb(null, true);
  return cb(null, false);
}

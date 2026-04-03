import test from "node:test";
import assert from "node:assert/strict";
import { parseAllowedOrigins } from "./corsConfig.js";

test("parseAllowedOrigins uses defaults when CORS_ORIGIN unset", () => {
  delete process.env.CORS_ORIGIN;
  const o = parseAllowedOrigins();
  assert.ok(o.includes("http://localhost:5173"));
});

test("parseAllowedOrigins splits CORS_ORIGIN", () => {
  process.env.CORS_ORIGIN = "https://a.example, https://b.example ";
  assert.deepEqual(parseAllowedOrigins(), [
    "https://a.example",
    "https://b.example",
  ]);
  delete process.env.CORS_ORIGIN;
});

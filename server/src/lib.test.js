import test from "node:test";
import assert from "node:assert/strict";
import {
  isPrime,
  passesHeavyFilter,
  enrichPost,
  processPosts,
  paginate,
  PAGE_SIZE,
} from "./lib.js";

test("isPrime", () => {
  assert.equal(isPrime(0), false);
  assert.equal(isPrime(1), false);
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(3), true);
  assert.equal(isPrime(4), false);
  assert.equal(isPrime(17), true);
  assert.equal(isPrime(18), false);
});

test("heavy filter removes long body", () => {
  assert.equal(passesHeavyFilter({ body: "x".repeat(180) }), true);
  assert.equal(passesHeavyFilter({ body: "x".repeat(181) }), false);
});

test("enrichPost sentiment from prime id", () => {
  const p2 = enrichPost({ id: 2, title: "t", body: "b" });
  assert.equal(p2.sentiment, "alert");
  const p4 = enrichPost({ id: 4, title: "t", body: "b" });
  assert.equal(p4.sentiment, "stable");
});

test("paginate returns exactly PAGE_SIZE when enough items", () => {
  const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
  const r1 = paginate(items, 1);
  assert.equal(r1.posts.length, PAGE_SIZE);
  assert.equal(r1.page, 1);
  const r2 = paginate(items, 2);
  assert.equal(r2.posts.length, PAGE_SIZE);
});

test("processPosts filters and enriches", () => {
  const raw = [
    { id: 2, title: "a", body: "short" },
    { id: 3, title: "b", body: "x".repeat(200) },
  ];
  const out = processPosts(raw);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 2);
  assert.equal(out[0].sentiment, "alert");
});

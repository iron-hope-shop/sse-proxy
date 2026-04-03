const UPSTREAM = "https://jsonplaceholder.typicode.com/posts";
const BODY_MAX = 180;
const PAGE_SIZE = 8;

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function enrichPost(post) {
  return {
    ...post,
    sentiment: isPrime(post.id) ? "alert" : "stable",
  };
}

export function passesHeavyFilter(post) {
  const body = post.body ?? "";
  return typeof body === "string" && body.length <= BODY_MAX;
}

export function processPosts(rawPosts) {
  return rawPosts.filter(passesHeavyFilter).map(enrichPost);
}

export function paginate(items, page) {
  const p = Number.parseInt(String(page), 10);
  const pageNum = Number.isFinite(p) && p >= 1 ? p : 1;
  const start = (pageNum - 1) * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);
  return { page: pageNum, posts: slice, totalFiltered: items.length };
}

export async function fetchUpstreamPosts() {
  const res = await fetch(UPSTREAM);
  if (!res.ok) {
    throw new Error(`Upstream error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export { UPSTREAM, BODY_MAX, PAGE_SIZE };

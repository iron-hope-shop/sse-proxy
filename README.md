# Data Sanitization Proxy

Proxy over [JSONPlaceholder `/posts`](https://jsonplaceholder.typicode.com/posts): drops posts with body longer than 180 characters, adds `sentiment` (prime `id` → `"alert"`, else `"stable"`), 30s in-memory cache with `X-Cache-Status: HIT|MISS`, paginates 8 per page. **React + Vite** UI uses **MUI** with a dark theme (True Blue / Spark Yellow family), app bar, cache chip, card skeletons while loading, prev/next at top and bottom.

**Node 18+** (uses `fetch`).

## Run locally

**Terminal 1 — API (port 3001, optional `PORT=...`):**

```bash
cd server && npm install && npm start
```

**Terminal 2 — UI (proxies `/api` to 3001):**

```bash
cd client && npm install && npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). Errors log to `server/error.log`.

Optional: copy `.env.example` → `.env` and set `CORS_ORIGIN` (comma-separated) for browser calls to the API from non-localhost hosts.

## Security notes (SAST / dependency / cloud scanners)

- **`npm audit`**: run in `server/` and `client/` before release; both were clean at last check.
- **Secrets**: no API keys or tokens in source; keep deployment secrets in the environment, not git.
- **SSRF**: upstream is a fixed HTTPS URL in code (`lib.js`), not user-controlled.
- **CORS**: allowlisted origins (defaults to local Vite ports); override with `CORS_ORIGIN`. No-origin requests (e.g. server-side proxy) still work.
- **Headers**: `helmet` on the API, `X-Powered-By` disabled. This is a JSON API only (CSP disabled for that reason).
- **XSS**: UI uses React text nodes only (no `dangerouslySetInnerHTML` in app source).

Third-party scanners (e.g. Wiz, Snyk, GitHub Advanced Security) must still run in your pipeline; this section documents intent, not a guarantee.

## Assessment criteria (spec checklist)

| Requirement | Implementation |
|-------------|------------------|
| `GET /api/posts?page=<n>` | `server/src/index.js` |
| Remove posts with `body` length **> 180** | `passesHeavyFilter` in `server/src/lib.js` |
| **8** items per page (last page may be shorter) | `PAGE_SIZE`, `paginate()` |
| `sentiment`: **alert** if `id` prime, else **stable** | `enrichPost` / `isPrime` |
| In-memory cache, **30s** TTL | `TTL_MS`, `cache` in `index.js` |
| **`X-Cache-Status`**: `HIT` / `MISS` | Set on every JSON response |
| UI: title + body snippet, **red** alert / **gray** stable border | `App.jsx` + theme |
| UI: cache telemetry from header | Chip in app bar |
| UI: **Previous** / **Next** | Two `Pager` rows |

## Tests (local, no network)

```bash
cd server && npm test
```

Covers prime check, heavy filter, enrichment, and pagination logic. Hitting the real upstream is not required for `npm test`; use the two terminals above to exercise the full stack against JSONPlaceholder.

**Client (WCAG contrast on theme tokens):**

```bash
cd client && npm test
```

## API

`GET /api/posts?page=1` → JSON `{ page, pageSize, totalFiltered, posts[] }` plus header `X-Cache-Status`.

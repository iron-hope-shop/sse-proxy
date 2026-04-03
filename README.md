# Data Sanitization Proxy

**Node 18+**

## Run locally

**API** (default port `3001`; override with `PORT`):

```bash
cd server && npm install && npm start
```

**UI** (dev server proxies `/api` → `3001`):

```bash
cd client && npm install && npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). API errors append to `server/error.log`. For browser calls from other hosts, set `CORS_ORIGIN` in `.env` (see `.env.example`).

## Tests

```bash
cd server && npm test
cd client && npm test
```

Server tests need no network. Client tests check theme contrast helpers.

## Spec checklist

| Requirement | Where |
|-------------|--------|
| `GET /api/posts?page=<n>` | `server/src/index.js` |
| Drop posts with `body` **> 180** chars | `server/src/lib.js` (`passesHeavyFilter`) |
| **8** posts per page | `PAGE_SIZE`, `paginate()` |
| `sentiment`: **alert** if `id` prime, else **stable** | `enrichPost`, `isPrime` |
| In-memory cache, **30s** TTL | `server/src/index.js` |
| Header **`X-Cache-Status`**: `HIT` / `MISS` | Same |
| UI: title + snippet; **red** / **muted** border by sentiment | `client/src/App.jsx` |
| UI: cache status from header | App bar chip |
| UI: **Previous** / **Next** | Top and bottom |

## API

`GET /api/posts?page=1` → `{ page, pageSize, totalFiltered, posts }` and `X-Cache-Status`.

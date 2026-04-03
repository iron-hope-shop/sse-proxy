import { useCallback, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { walmartDarkTokens } from "./designTokens.js";

const SNIPPET_LEN = 120;
const PAGE_SIZE = 8;
/** Fixed card footprint so the eight-up grid reads evenly (title clamp is layout-only; full title on hover). */
const POST_CARD_MIN_HEIGHT = 204;
const TITLE_MAX_LINES = 2;
const BODY_MAX_LINES = 4;

function lineClamp(lines) {
  return {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    wordBreak: "break-word",
  };
}

function snippet(text) {
  const t = (text ?? "").trim();
  if (t.length <= SNIPPET_LEN) return t;
  return `${t.slice(0, SNIPPET_LEN)}…`;
}

function Pager({
  disabled,
  page,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  align = "start",
}) {
  const end = align === "end";
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent={end ? "flex-end" : "flex-start"}
      sx={{ width: end ? "100%" : "auto", flexShrink: 0 }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={onPrev}
        disabled={disabled || prevDisabled}
      >
        Previous
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={onNext}
        disabled={disabled || nextDisabled}
      >
        Next
      </Button>
      <Typography
        variant="caption"
        color="text.secondary"
        component="span"
        sx={{
          ml: 0.5,
          minWidth: "9ch",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        page {page}
      </Typography>
    </Stack>
  );
}

function FeedSkeleton({ count = PAGE_SIZE }) {
  return (
    <Stack spacing={2} aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: count }, (_, k) => (
        <Card
          key={k}
          variant="outlined"
          sx={{
            borderColor: "divider",
            minHeight: POST_CARD_MIN_HEIGHT,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Skeleton variant="rounded" width={72} height={22} sx={{ mb: 1 }} />
            <Skeleton
              variant="rounded"
              height={40}
              sx={{ mb: 1, flexShrink: 0 }}
            />
            <Skeleton variant="rounded" height={72} sx={{ flexShrink: 0 }} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default function App() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [pending, setPending] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(true);

  const loadPage = useCallback(async (n) => {
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts?page=${n}`);
      const cacheHeader = res.headers.get("X-Cache-Status") ?? "MISS";
      setCacheStatus(cacheHeader === "HIT" ? "cached" : "live");

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }

      const data = await res.json();
      const p = data.page ?? n;
      const list = data.posts ?? [];
      const total = data.totalFiltered ?? 0;
      const size = data.pageSize ?? PAGE_SIZE;

      setPage(p);
      setPosts(list);
      setTotalFiltered(total);

      const lastPage = Math.max(1, Math.ceil(total / size));
      setPrevDisabled(p <= 1);
      setNextDisabled(p >= lastPage || list.length === 0);
      setReady(true);
    } catch (e) {
      setError(e.message ?? "Request failed");
      setCacheStatus("live");
      setPosts([]);
      setPrevDisabled(n <= 1);
      setNextDisabled(false);
      setReady(true);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  const handlePrev = () => {
    if (page > 1) loadPage(page - 1);
  };

  const handleNext = () => {
    loadPage(page + 1);
  };

  const cacheLabel =
    cacheStatus === "cached"
      ? "Data status: Cached"
      : cacheStatus === "live"
        ? "Data status: Live"
        : "Data status: …";

  const metaBase =
    error != null
      ? error
      : `Page ${page} · ${posts.length} shown · ${totalFiltered} posts after filter`;

  const skeletonCount =
    pending && ready && posts.length > 0 ? posts.length : PAGE_SIZE;

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} color="default">
        <Toolbar variant="dense" sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
          <Typography variant="h1" component="h1" sx={{ flexGrow: 1 }}>
            Posts feed
          </Typography>
          <Chip
            size="small"
            label={cacheLabel}
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderColor:
                cacheStatus === "cached"
                  ? "secondary.main"
                  : cacheStatus === "live"
                    ? "primary.main"
                    : "divider",
              color:
                cacheStatus === "cached"
                  ? "secondary.main"
                  : cacheStatus === "live"
                    ? "primary.main"
                    : "text.secondary",
              bgcolor:
                cacheStatus === "cached"
                  ? "rgba(255, 194, 32, 0.12)"
                  : cacheStatus === "live"
                    ? "rgba(94, 176, 255, 0.1)"
                    : "transparent",
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2, pb: 4 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Typography
              variant="body2"
              color={error ? "error" : "text.secondary"}
              aria-live="polite"
              aria-busy={pending}
              sx={{
                minWidth: 0,
                flex: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {metaBase}
            </Typography>
            <Pager
              disabled={pending}
              page={page}
              onPrev={handlePrev}
              onNext={handleNext}
              prevDisabled={prevDisabled}
              nextDisabled={nextDisabled}
            />
          </Box>

          {pending ? (
            <FeedSkeleton count={skeletonCount} />
          ) : (
            <>
              <Stack spacing={2}>
                {posts.map((post) => {
                  const alert = post.sentiment === "alert";
                  return (
                    <Card
                      key={post.id}
                      variant="outlined"
                      sx={{
                        borderWidth: 3,
                        borderStyle: "solid",
                        borderColor: alert
                          ? "error.main"
                          : walmartDarkTokens.stableBorder,
                        minHeight: POST_CARD_MIN_HEIGHT,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <Chip
                          size="small"
                          label={alert ? "alert" : "stable"}
                          color={alert ? "error" : "default"}
                          variant={alert ? "filled" : "outlined"}
                          sx={{
                            mb: 1,
                            alignSelf: "flex-start",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            ...(alert
                              ? {}
                              : {
                                  borderColor: walmartDarkTokens.stableBorder,
                                  color: "text.secondary",
                                }),
                          }}
                        />
                        <Typography
                          variant="h2"
                          component="h2"
                          title={post.title ?? undefined}
                          sx={{
                            mb: 1,
                            minHeight: "2.6em",
                            ...lineClamp(TITLE_MAX_LINES),
                          }}
                        >
                          {post.title ?? ""}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            minHeight: "5.75em",
                            ...lineClamp(BODY_MAX_LINES),
                          }}
                        >
                          {snippet(post.body)}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>

              {ready && posts.length === 0 && !error && (
                <Typography color="text.secondary">
                  No posts on this page.
                </Typography>
              )}
            </>
          )}

          <Pager
            align="end"
            disabled={pending}
            page={page}
            onPrev={handlePrev}
            onNext={handleNext}
            prevDisabled={prevDisabled}
            nextDisabled={nextDisabled}
          />
        </Stack>
      </Container>
    </>
  );
}

import { Hono } from "hono";

const auth = new Hono();

// Proxy all auth requests to Better Auth running on Convex
auth.all("/*", async (c) => {
  const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
  if (!CONVEX_SITE_URL) {
    return c.json({ error: "Server misconfigured" }, 500);
  }

  const path = c.req.path.replace("/v1/auth", "/api/auth");
  const url = `${CONVEX_SITE_URL}${path}`;

  const headers = new Headers(c.req.raw.headers);
  headers.delete("host");

  const res = await fetch(url, {
    method: c.req.method,
    headers,
    body: c.req.method !== "GET" ? await c.req.raw.text() : undefined,
  });

  const responseHeaders = new Headers();
  for (const [key, value] of res.headers) {
    if (key.toLowerCase() === "set-cookie" || key.toLowerCase() === "content-type") {
      responseHeaders.append(key, value);
    }
  }

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
});

export default auth;

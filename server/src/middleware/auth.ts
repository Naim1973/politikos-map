import type { Context, Next } from "hono";

export async function authMiddleware(c: Context, next: Next) {
  const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
  if (!CONVEX_SITE_URL) {
    return c.json({ error: "Server misconfigured" }, 500);
  }

  const cookie = c.req.header("cookie") ?? "";
  const authHeader = c.req.header("authorization") ?? "";

  try {
    const res = await fetch(`${CONVEX_SITE_URL}/api/auth/get-session`, {
      headers: {
        cookie,
        authorization: authHeader,
      },
    });

    if (!res.ok) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await res.json();
    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
}

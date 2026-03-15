import { Hono } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth";

const superAdmin = new Hono();

superAdmin.use("*", authMiddleware);
superAdmin.use("*", requireRole("superAdmin"));

// POST /v1/super-admin/users — Create account
superAdmin.post("/users", async (c) => {
  const body = await c.req.json();
  const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;

  // Create user via Better Auth admin API
  const res = await fetch(`${CONVEX_SITE_URL}/api/auth/admin/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: c.req.header("cookie") ?? "",
      authorization: c.req.header("authorization") ?? "",
    },
    body: JSON.stringify({
      name: body.name,
      email: body.email,
      password: body.temporaryPassword,
      role: body.role?.toLowerCase() ?? "admin",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: "Failed to create user", detail: err }, res.status as any);
  }

  const data = await res.json();
  return c.json({ data }, 201);
});

// PATCH /v1/super-admin/users/:userId — Update role
superAdmin.patch("/users/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();

  const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
  const res = await fetch(`${CONVEX_SITE_URL}/api/auth/admin/set-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: c.req.header("cookie") ?? "",
      authorization: c.req.header("authorization") ?? "",
    },
    body: JSON.stringify({
      userId,
      role: body.role?.toLowerCase(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: "Failed to update user", detail: err }, res.status as any);
  }

  const data = await res.json();
  return c.json({ data });
});

// POST /v1/super-admin/users/:userId/disable — Disable account
superAdmin.post("/users/:userId/disable", async (c) => {
  const userId = c.req.param("userId");

  const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
  const res = await fetch(`${CONVEX_SITE_URL}/api/auth/admin/ban-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: c.req.header("cookie") ?? "",
      authorization: c.req.header("authorization") ?? "",
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: "Failed to disable user", detail: err }, res.status as any);
  }

  const data = await res.json();
  return c.json({ data });
});

export default superAdmin;

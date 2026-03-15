import { Hono } from "hono";
import { convex } from "../lib/convex";
import { api } from "../../convex/_generated/api";

const map = new Hono();

// GET /v1/map/upazila-counts — Counts per upazila (public)
map.get("/upazila-counts", async (c) => {
  const params = c.req.query();

  const result = await convex.query(api.map.getUpazilaCounts, {
    status: params.status,
    from: params.from ? new Date(params.from).getTime() : undefined,
    to: params.to ? new Date(params.to).getTime() : undefined,
    minCount: params.minCount ? parseInt(params.minCount) : undefined,
    maxCount: params.maxCount ? parseInt(params.maxCount) : undefined,
    category: params.category,
    includeZero: params.includeZero === "true",
    sort: params.sort,
  });

  return c.json(result);
});

export default map;

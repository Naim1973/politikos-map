import { Hono } from "hono";
import { convex } from "../lib/convex";
import { api } from "../../convex/_generated/api";
import { authMiddleware, requireRole } from "../middleware/auth";

const admin = new Hono();

admin.use("*", authMiddleware);
admin.use("*", requireRole("admin", "superAdmin"));

// GET /v1/admin/reports — List reports with filters
admin.get("/reports", async (c) => {
  const params = c.req.query();

  const result = await convex.query(api.reports.list, {
    status: params.status,
    relationId: params.relationId ? parseInt(params.relationId) : undefined,
    page: params.page ? parseInt(params.page) : undefined,
    pageSize: params.pageSize ? parseInt(params.pageSize) : undefined,
  });

  return c.json(result);
});

// GET /v1/admin/reports/:reportId — Report details
admin.get("/reports/:reportId", async (c) => {
  const reportId = c.req.param("reportId");

  const result = await convex.query(api.reports.getDetail, {
    reportId: reportId as any,
  });

  return c.json({ data: result });
});

// POST /v1/admin/reports/:reportId/approve
admin.post("/reports/:reportId/approve", async (c) => {
  const reportId = c.req.param("reportId");
  const body = await c.req.json();

  const result = await convex.mutation(api.reports.approve, {
    reportId: reportId as any,
    notes: body.notes,
    verifiedUpazilaRelationId: body.verifiedUpazilaRelationId,
  });

  return c.json({ data: result });
});

// POST /v1/admin/reports/:reportId/reject
admin.post("/reports/:reportId/reject", async (c) => {
  const reportId = c.req.param("reportId");
  const body = await c.req.json();

  const result = await convex.mutation(api.reports.reject, {
    reportId: reportId as any,
    reasonCode: body.reasonCode,
    notes: body.notes,
  });

  return c.json({ data: result });
});

export default admin;

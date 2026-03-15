import { Hono } from "hono";
import { convex } from "../lib/convex";
import { api } from "../../convex/_generated/api";

const reports = new Hono();

// POST /v1/reports — Submit a report (public)
reports.post("/", async (c) => {
  const body = await c.req.json();

  const result = await convex.mutation(api.reports.submit, {
    type: body.category,
    title: body.title,
    description: body.description,
    locationText: body.location?.addressText,
    selectedUpazilaRelationId: body.upazila?.relationId,
    upazilaNameSnapshot: body.upazila?.nameSnapshot,
    latitude: body.location?.lat,
    longitude: body.location?.lng,
    severity: body.severity,
    occurredAt: body.occurredAt ? new Date(body.occurredAt).getTime() : undefined,
    reporterName: body.contact?.name,
    politicalParty: body.politicalParty,
    suspectName: body.suspectName,
    otherPeople: body.otherPeople,
    newsArticleUrl: body.newsArticleUrl,
    videoEvidenceUrl: body.videoEvidenceUrl,
    audioEvidenceUrl: body.audioEvidenceUrl,
    attachments: body.attachments?.map((a: { type: string; fileId: string }) => ({
      type: a.type,
      fileId: a.fileId,
    })),
  });

  return c.json({ data: result }, 201);
});

// GET /v1/reports/approved — List approved reports (public, for map)
reports.get("/approved", async (c) => {
  const result = await convex.query(api.reports.listApproved, {});
  return c.json(result);
});
// GET /v1/reports/pending — List pending reports (admin only)
reports.get("/pending", async (c) => {
  const result = await convex.query(api.reports.list, { status: "PENDING" });
  return c.json(result);
});

// GET /v1/reports/rejected
reports.get("/rejected", async (c) => {
  const result = await convex.query(api.reports.list, { status: "REJECTED" });
  return c.json(result);
});

// GET /v1/reports/status/:trackingCode — Check report status (public)
reports.get("/status/:trackingCode", async (c) => {
  const trackingCode = c.req.param("trackingCode");
  const result = await convex.query(api.reports.getByTrackingCode, {
    trackingCode,
  });

  if (!result) {
    return c.json({ error: "Report not found" }, 404);
  }

  return c.json({ data: result });
});

// PATCH /v1/reports/:id/approve
reports.patch("/:id/approve", async (c) => {
  const reportId = c.req.param("id") as any;
  const body = await c.req.json().catch(() => ({}));
  const result = await convex.mutation(api.reports.approve, {
    reportId,
    notes: body.notes,
  });
  return c.json(result);
});

// PATCH /v1/reports/:id/reject
reports.patch("/:id/reject", async (c) => {
  const reportId = c.req.param("id") as any;
  const body = await c.req.json().catch(() => ({}));
  const result = await convex.mutation(api.reports.reject, {
    reportId,
    notes: body.notes,
  });
  return c.json(result);
});

// GET /v1/reports/activity
reports.get("/activity", async (c) => {
  const result = await convex.query(api.reports.getActivityLog, {});
  return c.json(result);
});

// POST /v1/reports/activity
reports.post("/activity", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await convex.mutation(api.reports.logActivity, {
    action: body.action,
    target: body.target,
    detail: body.detail,
  });
  return c.json(result);
});

// POST /v1/reports/:id/delete
reports.post("/:id/delete", async (c) => {
  const reportId = c.req.param("id") as any;
  await convex.mutation(api.reports.remove, { reportId });
  return c.json({ success: true });
});

// DELETE /v1/reports/:id
reports.delete("/:id", async (c) => {
  const reportId = c.req.param("id") as any;
  await convex.mutation(api.reports.remove, { reportId });
  return c.json({ success: true });
});

reports.patch("/:id/pending", async (c) => {
  const reportId = c.req.param("id") as any;
  const result = await convex.mutation(api.reports.setPending, { reportId });
  return c.json(result);
});

// PATCH /v1/reports/:id/tag
reports.patch("/:id/tag", async (c) => {
  const reportId = c.req.param("id") as any;
  const body = await c.req.json().catch(() => ({}));
  const result = await convex.mutation(api.reports.setTag, {
    reportId,
    tag: body.tag,
  });
  return c.json(result);
});

// PATCH /v1/reports/:id
reports.patch("/:id", async (c) => {
  const reportId = c.req.param("id") as any;
  const body = await c.req.json().catch(() => ({}));
  const result = await convex.mutation(api.reports.update, {
    reportId,
    ...body,
  });
  return c.json(result);
});

export default reports;

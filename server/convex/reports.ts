import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.string(),
    locationText: v.optional(v.string()),
    selectedUpazilaRelationId: v.optional(v.number()),
    upazilaNameSnapshot: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    severity: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
    reporterName: v.optional(v.string()),
    politicalParty: v.optional(v.string()),
    suspectName: v.optional(v.string()),
    otherPeople: v.optional(v.string()),
    newsArticleUrl: v.optional(v.string()),
    videoEvidenceUrl: v.optional(v.string()),
    audioEvidenceUrl: v.optional(v.string()),
    attachments: v.optional(
      v.array(v.object({ type: v.string(), fileId: v.id("files") }))
    ),
  },
  handler: async (ctx, args) => {
    const trackingCode = generateTrackingCode();
    const { attachments, ...reportFields } = args;

    const reportId = await ctx.db.insert("reports", {
      ...reportFields,
      publicTrackingCode: trackingCode,
      workflowStatus: "PENDING",
      updatedAt: Date.now(),
    });

    if (attachments) {
      for (const att of attachments) {
        await ctx.db.insert("reportAttachments", {
          reportId,
          fileId: att.fileId,
          attachmentType: att.type,
        });
      }
    }

    return {
      reportId,
      trackingCode,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };
  },
});

// Public: list all approved reports with full details for the map
export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_workflow_status", (q) =>
        q.eq("workflowStatus", "APPROVED")
      )
      .order("desc")
      .collect();

    return {
      data: reports.map((r) => ({
        _id: r._id,
        _creationTime: r._creationTime,
        publicTrackingCode: r.publicTrackingCode,
        adminTag: r.adminTag,
        type: r.type,
        title: r.title,
        description: r.description,
        locationText: r.locationText,
        selectedUpazilaRelationId: r.selectedUpazilaRelationId,
        upazilaNameSnapshot: r.upazilaNameSnapshot,
        latitude: r.latitude,
        longitude: r.longitude,
        severity: r.severity,
        occurredAt: r.occurredAt,
        workflowStatus: r.workflowStatus,
        reporterName: r.reporterName,
        politicalParty: r.politicalParty,
        suspectName: r.suspectName,
        otherPeople: r.otherPeople,
        newsArticleUrl: r.newsArticleUrl,
        videoEvidenceUrl: r.videoEvidenceUrl,
        audioEvidenceUrl: r.audioEvidenceUrl,
      })),
    };
  },
});

export const getByTrackingCode = query({
  args: { trackingCode: v.string() },
  handler: async (ctx, { trackingCode }) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_tracking_code", (q) =>
        q.eq("publicTrackingCode", trackingCode)
      )
      .unique();

    if (!report) return null;

    return {
      trackingCode: report.publicTrackingCode,
      status: report.workflowStatus,
      lastUpdatedAt: report.updatedAt
        ? new Date(report.updatedAt).toISOString()
        : new Date(report._creationTime).toISOString(),
    };
  },
});

export const list = query({
  args: {
    status: v.optional(v.string()),
    relationId: v.optional(v.number()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  // Auth enforced at Hono middleware layer
  handler: async (ctx, args) => {
    const allReports = args.status
      ? await ctx.db
          .query("reports")
          .withIndex("by_workflow_status", (idx) =>
            idx.eq("workflowStatus", args.status!)
          )
          .order("desc")
          .collect()
      : await ctx.db
          .query("reports")
          .order("desc")
          .collect();

    let filtered = allReports;
    if (args.relationId) {
      filtered = filtered.filter(
        (r) => r.selectedUpazilaRelationId === args.relationId
      );
    }

    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 50;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      meta: { page, pageSize, total: filtered.length },
      data: paged.map((r) => ({
  reportId: r._id,
  status: r.workflowStatus,
  submittedAt: new Date(r._creationTime).toISOString(),
  adminTag: r.adminTag,
  title: r.title,
  type: r.type,
  severity: r.severity,
  latitude: r.latitude,
  longitude: r.longitude,
  locationText: r.locationText,
  description: r.description,
  suspectName: r.suspectName,
  otherPeople: r.otherPeople,
  newsArticleUrl: r.newsArticleUrl,
  videoEvidenceUrl: r.videoEvidenceUrl,
  audioEvidenceUrl: r.audioEvidenceUrl,
  politicalParty: r.politicalParty,
  upazila: {
    relationId: r.selectedUpazilaRelationId,
    nameSnapshot: r.upazilaNameSnapshot,
  },
})),
    };
  },
});

export const getDetail = query({
  args: { reportId: v.id("reports") },
  // Auth enforced at Hono middleware layer
  handler: async (ctx, { reportId }) => {
    const report = await ctx.db.get(reportId);
    if (!report) throw new Error("Report not found");

    const attachments = await ctx.db
      .query("reportAttachments")
      .withIndex("by_report", (q) => q.eq("reportId", reportId))
      .collect();

    const flags = await ctx.db
      .query("adminFlags")
      .withIndex("by_report", (q) => q.eq("reportId", reportId))
      .collect();

    return { ...report, attachments, flags };
  },
});

export const approve = mutation({
  args: {
    reportId: v.id("reports"),
    notes: v.optional(v.string()),
    verifiedUpazilaRelationId: v.optional(v.number()),
  },
  // Auth enforced at Hono middleware layer
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.reportId, {
      workflowStatus: "APPROVED",
      adminNote: args.notes,
      verifiedUpazilaRelationId: args.verifiedUpazilaRelationId,
      reviewedAt: now,
      updatedAt: now,
    });

    return {
      reportId: args.reportId,
      status: "APPROVED",
      decidedAt: new Date(now).toISOString(),
    };
  },
});

export const reject = mutation({
  args: {
    reportId: v.id("reports"),
    reasonCode: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  // Auth enforced at Hono middleware layer
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.reportId, {
      workflowStatus: "REJECTED",
      adminNote: args.notes,
      reviewedAt: now,
      updatedAt: now,
    });

    return {
      reportId: args.reportId,
      status: "REJECTED",
      decidedAt: new Date(now).toISOString(),
    };
  },
});

export const remove = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, { reportId }) => {
    await ctx.db.delete(reportId);
    return { success: true };
  },
});

export const update = mutation({
  args: {
    reportId: v.id("reports"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    locationText: v.optional(v.string()),
    type: v.optional(v.string()),
    severity: v.optional(v.string()),
    workflowStatus: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    newsArticleUrl: v.optional(v.string()),
    videoEvidenceUrl: v.optional(v.string()),
    audioEvidenceUrl: v.optional(v.string()),
    suspectName: v.optional(v.string()),
    otherPeople: v.optional(v.string()),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { reportId, ...fields } = args;
    await ctx.db.patch(reportId, { ...fields, updatedAt: Date.now() });
    return { success: true };
  },
});

export const setPending = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, { reportId }) => {
    const now = Date.now();
    await ctx.db.patch(reportId, { workflowStatus: "PENDING", updatedAt: now });
    return { success: true };
  },
});

export const setTag = mutation({
  args: {
    reportId: v.id("reports"),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, { reportId, tag }) => {
    await ctx.db.patch(reportId, { adminTag: tag, updatedAt: Date.now() });
    return { success: true };
  },
});

export const logActivity = mutation({
  args: {
    action: v.string(),
    target: v.string(),
    detail: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      action: args.action,
      target: args.target,
      detail: args.detail,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const getActivityLog = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("activityLog")
      .order("desc")
      .take(50);
    return entries.map(e => ({
      id: e._id,
      action: e.action,
      target: e.target,
      detail: e.detail,
      timestamp: new Date(e.timestamp).toISOString(),
    }));
  },
});

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BD-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

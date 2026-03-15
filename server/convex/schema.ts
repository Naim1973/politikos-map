import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  reports: defineTable({
    publicTrackingCode: v.string(),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    locationText: v.optional(v.string()),
    selectedUpazilaRelationId: v.optional(v.number()),
    upazilaNameSnapshot: v.optional(v.string()),
    verifiedUpazilaRelationId: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    severity: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
    workflowStatus: v.string(),
    incidentStatus: v.optional(v.string()),
    reporterName: v.optional(v.string()),
    politicalParty: v.optional(v.string()),
    suspectName: v.optional(v.string()),
    otherPeople: v.optional(v.string()),
    newsArticleUrl: v.optional(v.string()),
    videoEvidenceUrl: v.optional(v.string()),
    audioEvidenceUrl: v.optional(v.string()),
    adminNote: v.optional(v.string()),
    adminTag: v.optional(v.string()),
    reviewedByAuthUserId: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_tracking_code", ["publicTrackingCode"])
    .index("by_workflow_status", ["workflowStatus"])
    .index("by_upazila", ["selectedUpazilaRelationId"])
    .index("by_status_and_upazila", ["workflowStatus", "selectedUpazilaRelationId"]),

  files: defineTable({
    storageKey: v.string(),
    originalFileName: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    uploadStatus: v.string(),
  }),

  reportAttachments: defineTable({
    reportId: v.id("reports"),
    fileId: v.id("files"),
    attachmentType: v.string(),
  })
    .index("by_report", ["reportId"])
    .index("by_file", ["fileId"]),

  adminFlags: defineTable({
    reportId: v.id("reports"),
    tag: v.string(),
    adminNote: v.optional(v.string()),
    flaggedAt: v.number(),
  }).index("by_report", ["reportId"]),

  activityLog: defineTable({
    action: v.string(),
    target: v.string(),
    detail: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

});

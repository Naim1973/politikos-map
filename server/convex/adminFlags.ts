import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    reportId: v.id("reports"),
    tag: v.string(),
    adminNote: v.optional(v.string()),
  },
  // Auth enforced at Hono middleware layer
  handler: async (ctx, args) => {
    return await ctx.db.insert("adminFlags", {
      reportId: args.reportId,
      tag: args.tag,
      adminNote: args.adminNote,
      flaggedAt: Date.now(),
    });
  },
});

export const listByReport = query({
  args: { reportId: v.id("reports") },
  // Auth enforced at Hono middleware layer
  handler: async (ctx, { reportId }) => {
    return await ctx.db
      .query("adminFlags")
      .withIndex("by_report", (q) => q.eq("reportId", reportId))
      .collect();
  },
});

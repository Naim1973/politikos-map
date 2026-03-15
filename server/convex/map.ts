import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUpazilaCounts = query({
  args: {
    status: v.optional(v.string()),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
    minCount: v.optional(v.number()),
    maxCount: v.optional(v.number()),
    category: v.optional(v.string()),
    includeZero: v.optional(v.boolean()),
    sort: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const status = args.status ?? "APPROVED";

    let reports;
    if (status === "ALL") {
      reports = await ctx.db.query("reports").collect();
    } else {
      reports = await ctx.db
        .query("reports")
        .withIndex("by_workflow_status", (q) => q.eq("workflowStatus", status))
        .collect();
    }

    // Apply time range filter
    if (args.from) {
      reports = reports.filter(
        (r) => r.occurredAt && r.occurredAt >= args.from!
      );
    }
    if (args.to) {
      reports = reports.filter(
        (r) => r.occurredAt && r.occurredAt <= args.to!
      );
    }

    // Apply category filter
    if (args.category) {
      const categories = args.category.split(",");
      reports = reports.filter((r) => categories.includes(r.type));
    }

    // Aggregate by upazila
    const counts = new Map<number, number>();
    for (const r of reports) {
      if (r.selectedUpazilaRelationId) {
        const current = counts.get(r.selectedUpazilaRelationId) ?? 0;
        counts.set(r.selectedUpazilaRelationId, current + 1);
      }
    }

    let data = Array.from(counts.entries()).map(([relationId, count]) => ({
      relationId,
      count,
    }));

    // Apply threshold filters
    if (args.minCount) {
      data = data.filter((d) => d.count >= args.minCount!);
    }
    if (args.maxCount) {
      data = data.filter((d) => d.count <= args.maxCount!);
    }

    // Sort
    if (args.sort === "count_asc") {
      data.sort((a, b) => a.count - b.count);
    } else {
      data.sort((a, b) => b.count - a.count);
    }

    return {
      meta: {
        status,
        from: args.from ? new Date(args.from).toISOString() : undefined,
        to: args.to ? new Date(args.to).toISOString() : undefined,
        minCount: args.minCount,
        totalMatchingReports: reports.length,
      },
      data,
    };
  },
});

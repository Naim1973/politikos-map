import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

// One-shot mutation to bootstrap the first super admin role.
// Run: npx convex run seedAdmin:setSuperAdmin '{"email":"superadmin@politikos.com"}'
// Delete this file after use.
export const setSuperAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "user",
        where: [{ field: "email", value: email }],
      }
    );

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    await ctx.runMutation(
      components.betterAuth.adapter.updateOne,
      {
        input: {
          model: "user",
          where: [{ field: "_id", value: user._id as string }],
          update: { role: "superAdmin" },
        },
      }
    );

    return { success: true, userId: user.id, role: "superAdmin" };
  },
});

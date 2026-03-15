import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createFileRecord = mutation({
  args: {
    originalFileName: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();

    const fileId = await ctx.db.insert("files", {
      storageKey: "",
      originalFileName: args.originalFileName,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      uploadStatus: "PENDING",
    });

    return { fileId, uploadUrl };
  },
});

export const markUploaded = mutation({
  args: {
    fileId: v.id("files"),
    storageId: v.string(),
  },
  handler: async (ctx, { fileId, storageId }) => {
    await ctx.db.patch(fileId, {
      storageKey: storageId,
      uploadStatus: "UPLOADED",
    });
  },
});

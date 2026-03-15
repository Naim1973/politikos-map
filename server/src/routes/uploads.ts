import { Hono } from "hono";
import { convex } from "../lib/convex";
import { api } from "../../convex/_generated/api";

const uploads = new Hono();

// POST /v1/uploads — Get presigned upload URL (public)
uploads.post("/", async (c) => {
  const body = await c.req.json();

  const result = await convex.mutation(api.files.createFileRecord, {
    originalFileName: body.fileName,
    mimeType: body.contentType,
    sizeBytes: body.sizeBytes,
  });

  return c.json({
    data: {
      fileId: result.fileId,
      uploadUrl: result.uploadUrl,
      expiresInSeconds: 900,
    },
  });
});

export default uploads;

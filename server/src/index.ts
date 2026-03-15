import { config } from "dotenv";
config({ path: ".env.local" });
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import osmRoutes from "./routes/osm";
import mapRoutes from "./routes/map";
import reportRoutes from "./routes/reports";
import uploadRoutes from "./routes/uploads";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import superAdminRoutes from "./routes/super-admin";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

app.route("/v1/osm", osmRoutes);
app.route("/v1/map", mapRoutes);
app.route("/v1/reports", reportRoutes);
app.route("/v1/uploads", uploadRoutes);
app.route("/v1/auth", authRoutes);
app.route("/v1/admin", adminRoutes);
app.route("/v1/super-admin", superAdminRoutes);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = parseInt(process.env.HONO_PORT ?? "3001");

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});

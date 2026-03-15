import { ConvexHttpClient } from "convex/browser";

let _convex: ConvexHttpClient;

export function getConvex() {
  if (!_convex) {
    const url = process.env.CONVEX_URL;
    if (!url) {
      throw new Error("CONVEX_URL environment variable is required");
    }
    _convex = new ConvexHttpClient(url);
  }
  return _convex;
}

export const convex = new Proxy({} as ConvexHttpClient, {
  get(_, prop) {
    return (getConvex() as any)[prop];
  },
});

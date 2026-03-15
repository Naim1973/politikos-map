import { Hono } from "hono";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const osm = new Hono();

// In-memory cache
const cache = new Map<string, { data: unknown; fetchedAt: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL) {
    return entry;
  }
  cache.delete(key);
  return null;
}

// GET /v1/osm/upazilas — Dropdown data: relation ids + names
osm.get("/upazilas", async (c) => {
  const adminLevel = c.req.query("adminLevel") ?? "6";
  const useCache = c.req.query("cache") !== "false";
  const cacheKey = `upazilas:${adminLevel}`;

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return c.json({
        meta: { source: "overpass", adminLevel, cached: true, fetchedAt: new Date(cached.fetchedAt).toISOString() },
        data: cached.data,
      });
    }
  }

  const query = `[out:json][timeout:60];
area["ISO3166-1"="BD"]->.bd;
relation(area.bd)["boundary"="administrative"]["admin_level"="${adminLevel}"];
out tags;`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) {
    return c.json({ error: "Overpass API error" }, 502);
  }

  const json = await res.json() as { elements: Array<{ id: number; tags: Record<string, string> }> };

  const data = json.elements.map((el) => ({
    relationId: el.id,
    name: el.tags.name ?? "",
    name_en: el.tags["name:en"] ?? "",
    name_bn: el.tags["name:bn"] ?? "",
  }));

  cache.set(cacheKey, { data, fetchedAt: Date.now() });

  return c.json({
    meta: { source: "overpass", adminLevel, cached: false, fetchedAt: new Date().toISOString() },
    data,
  });
});

// GET /v1/osm/upazilas/geojson — Batch GeoJSON by relation ids
osm.get("/upazilas/geojson", async (c) => {
  const ids = c.req.query("ids");
  if (!ids) {
    return c.json({ error: "ids query parameter is required" }, 400);
  }

  const relationIds = ids.split(",").map((id) => id.trim());
  const useCache = c.req.query("cache") !== "false";
  const cacheKey = `batch-geojson:${relationIds.sort().join(",")}`;

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return c.json({
        meta: { count: relationIds.length, simplified: true, cached: true },
        data: cached.data,
      });
    }
  }

  const idFilter = relationIds.map((id) => `rel(${id});`).join("");
  const query = `[out:json][timeout:120];
(${idFilter});
out geom;`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) {
    return c.json({ error: "Overpass API error" }, 502);
  }

  const json = await res.json() as { elements: Array<{ id: number; tags: Record<string, string>; members?: Array<{ type: string; geometry?: Array<{ lat: number; lon: number }> }> }> };
  const features = json.elements.map(elementToFeature);

  const featureCollection = { type: "FeatureCollection", features };
  cache.set(cacheKey, { data: featureCollection, fetchedAt: Date.now() });

  return c.json({
    meta: { count: features.length, simplified: true, cached: false },
    data: featureCollection,
  });
});

// GET /v1/osm/upazilas/:relationId/geojson — Single upazila GeoJSON
osm.get("/upazilas/:relationId/geojson", async (c) => {
  const relationId = c.req.param("relationId");
  const useCache = c.req.query("cache") !== "false";
  const cacheKey = `geojson:${relationId}`;

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return c.json({
        meta: { source: "overpass", relationId: parseInt(relationId), simplified: true, cached: true },
        data: cached.data,
      });
    }
  }

  const query = `[out:json][timeout:60];
rel(${relationId});
out geom;`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) {
    return c.json({ error: "Overpass API error" }, 502);
  }

  const json = await res.json() as { elements: Array<{ id: number; tags: Record<string, string>; members?: Array<{ type: string; geometry?: Array<{ lat: number; lon: number }> }> }> };
  const element = json.elements[0];

  if (!element) {
    return c.json({ error: "Relation not found" }, 404);
  }

  const feature = elementToFeature(element);
  cache.set(cacheKey, { data: feature, fetchedAt: Date.now() });

  return c.json({
    meta: { source: "overpass", relationId: parseInt(relationId), simplified: true, cached: false },
    data: feature,
  });
});

function elementToFeature(element: { id: number; tags: Record<string, string>; members?: Array<{ type: string; geometry?: Array<{ lat: number; lon: number }> }> }) {
  const outerRings: Array<Array<[number, number]>> = [];

  if (element.members) {
    for (const member of element.members) {
      if (member.type === "way" && member.geometry) {
        const coords = member.geometry.map(
          (pt) => [pt.lon, pt.lat] as [number, number]
        );
        outerRings.push(coords);
      }
    }
  }

  return {
    type: "Feature",
    properties: {
      relationId: element.id,
      name: element.tags?.name ?? "",
    },
    geometry: {
      type: outerRings.length > 1 ? "MultiPolygon" : "Polygon",
      coordinates:
        outerRings.length > 1
          ? outerRings.map((ring) => [ring])
          : [outerRings[0] ?? []],
    },
  };
}

export default osm;

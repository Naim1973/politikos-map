Data pipeline (accurate for Leaflet + OSM)
Fetch Upazila list (lightweight)
Overpass: out tags; → get relation id, name, name:en, etc.
Fetch boundary geometry only when needed
Overpass: rel(<id>); out geom; → returns relation + ways geometry
Convert to GeoJSON for Leaflet
Backend uses a converter (e.g., osmtogeojson) to produce a polygon/multipolygon Feature.
Leaflet rendering
Map: L.geoJSON(geojsonFeatureOrCollection, styleFn)
Style opacity based on counts from your /map/upazila-counts endpoint.

API List (Table)
Group
Method
Endpoint
Auth
Purpose
OSM Proxy
GET
/v1/osm/upazilas
Public
Dropdown data: relation ids + names (no geometry)
OSM Proxy
GET
/v1/osm/upazilas/{relationId}/geojson
Public
Leaflet-ready GeoJSON for one upazila
OSM Proxy
GET
/v1/osm/upazilas/geojson
Public
Batch GeoJSON by relation ids (recommended)
Map
GET
/v1/map/upazila-counts
Public
Counts per upazila with filters (time range, thresholds, status, etc.)
Reports
POST
/v1/reports
Public
Submit report (anonymous optional) → creates PENDING
Reports
GET
/v1/reports/status/{trackingCode}
Public
Check report status for anonymous users
Uploads
POST
/v1/uploads
Public
Get presigned upload URL + fileId
Auth
POST
/v1/auth/login
Public
Login (Admin / Super Admin / optional User)
Auth
POST
/v1/auth/refresh
Public
Refresh access token
Auth
POST
/v1/auth/logout
Auth
Logout / revoke refresh token
Admin
GET
/v1/admin/reports
Admin
List reports (filters + pagination)
Admin
GET
/v1/admin/reports/{reportId}
Admin
Report details (full form + attachments)
Admin
POST
/v1/admin/reports/{reportId}/approve
Admin
Approve after manual verification
Admin
POST
/v1/admin/reports/{reportId}/reject
Admin
Reject after manual verification
Super Admin
POST
/v1/super-admin/users
Super
Create accounts (no public signup)
Super Admin
PATCH
/v1/super-admin/users/{userId}
Super
Update role/scope (optional)
Super Admin
POST
/v1/super-admin/users/{userId}/disable
Super
Disable account


Endpoint Details
1) OSM Proxy APIs (Dynamic Upazila)
1.1 List Upazilas (for dropdown)
GET /v1/osm/upazilas
Query params
adminLevel (default: 6)
include = name,name:en,name:bn (optional)
cache = true|false (default true)
High-level behavior
Backend calls Overpass Interpreter with:
Bangladesh area
relation["boundary"="administrative"]["admin_level"="6"]
out tags;
Backend returns a normalized list.
Response (example)
{
  "meta": {
    "source": "overpass",
    "adminLevel": "6",
    "cached": true,
    "fetchedAt": "2026-03-02T22:00:00+06:00"
  },
  "data": [
    {
      "relationId": 123456,
      "name": "Savar Upazila",
      "name_en": "Savar Upazila",
      "name_bn": "সাভার উপজেলা"
    }
  ]
}


1.2 Get GeoJSON for one Upazila (Leaflet-ready)
GET /v1/osm/upazilas/{relationId}/geojson
Query params
simplified = true|false (default true)
tolerance = number (optional; used only if simplified=true)
cache = true|false (default true)
High-level behavior
Backend calls Overpass: rel(relationId); out geom;
Convert Overpass JSON → GeoJSON using osmtogeojson
Return Feature with MultiPolygon/Polygon
Ensure stable properties: relationId, name
Response
{
  "meta": {
    "source": "overpass",
    "relationId": 123456,
    "simplified": true,
    "cached": true
  },
  "data": {
    "type": "Feature",
    "properties": {
      "relationId": 123456,
      "name": "Savar Upazila"
    },
    "geometry": {
      "type": "MultiPolygon",
      "coordinates": []
    }
  }
}

This is directly usable in Leaflet: L.geoJSON(feature).addTo(map).

1.3 Batch GeoJSON
GET /v1/osm/upazilas/geojson?ids=123456,234567,345678
Query params
ids = comma list of relationIds (required)
simplified = true|false (default true)
cache = true|false (default true)
Response
{
  "meta": { "count": 3, "simplified": true },
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": { "relationId": 123456, "name": "Savar Upazila" },
        "geometry": { "type": "MultiPolygon", "coordinates": [] }
      }
    ]
  }
}


2) Map API (Counts + filters)
2.1 Upazila Counts with Filters
GET /v1/map/upazila-counts
Query params (filters)
Time range:
from = ISO datetime (optional)
to = ISO datetime (optional)
Verification:
status = APPROVED (default) | PENDING | REJECTED | ALL
Thresholds:
minCount (optional)
maxCount (optional)
Category:
category = comma list (optional)
Include:
includeZero = true|false (default false)
Sorting:
sort = count_desc|count_asc (default count_desc)
Important output rule
The key must match OSM: relationId (because you don’t store upazilas in DB).
Your reports table should store selectedUpazilaRelationId (and optionally a verified relationId).
Response
{
  "meta": {
    "status": "APPROVED",
    "from": "2026-02-01T00:00:00+06:00",
    "to": "2026-03-02T23:59:59+06:00",
    "minCount": 3,
    "totalMatchingReports": 1842
  },
  "data": [
    { "relationId": 123456, "count": 52 },
    { "relationId": 234567, "count": 7 }
  ]
}

Leaflet usage
Fetch counts → decide which relationIds to render → call batch geojson endpoint → apply style based on count.

3) Reports
3.1 Submit Report
POST /v1/reports
Request
{
  "anonymous": true,
  "upazila": {
    "relationId": 123456,
    "nameSnapshot": "Savar Upazila"
  },
  "category": "WATER_LOGGING",
  "title": "Road flooded near bazar",
  "description": "Water logging for 3 days.",
  "occurredAt": "2026-03-01T12:20:00+06:00",
  "location": { "lat": 23.8583, "lng": 90.2667 },
  "contact": { "name": null, "phone": null, "email": null },
  "attachments": [{ "type": "image", "fileId": "file_abc123" }],
  "consent": { "termsAccepted": true }
}

Response
{
  "data": {
    "reportId": "rpt_001",
    "status": "PENDING",
    "trackingCode": "BD-7K2F9A",
    "submittedAt": "2026-03-02T22:05:12+06:00"
  }
}

Note on “nameSnapshot”
OSM names can change. Storing a snapshot helps keep UI consistent in admin views.

3.2 Report Status Check
GET /v1/reports/status/{trackingCode}
Response
{
  "data": {
    "trackingCode": "BD-7K2F9A",
    "status": "PENDING",
    "lastUpdatedAt": "2026-03-02T22:05:12+06:00"
  }
}


4) Uploads
4.1 Create upload (presigned)
POST /v1/uploads
Request
{ "fileName": "photo.jpg", "contentType": "image/jpeg", "sizeBytes": 1839203 }

Response
{
  "data": {
    "fileId": "file_abc123",
    "uploadUrl": "https://storage.example.com/presigned...",
    "expiresInSeconds": 900
  }
}


5) Auth (No public signup)
5.1 Login
POST /v1/auth/login
Request
{ "email": "admin@example.com", "password": "********" }

Response
{
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "user": { "id": "usr_01", "name": "Admin", "email": "admin@example.com", "role": "ADMIN" }
  }
}

5.2 Refresh
POST /v1/auth/refresh
{ "refreshToken": "jwt..." }

5.3 Logout
POST /v1/auth/logout (Auth required)

6) Admin (Verification Workflow)
6.1 List Reports
GET /v1/admin/reports?status=PENDING&page=1&pageSize=50&relationId=123456&from=...&to=...
Response
{
  "meta": { "page": 1, "pageSize": 50, "total": 128 },
  "data": [
    {
      "reportId": "rpt_001",
      "status": "PENDING",
      "submittedAt": "2026-03-02T22:05:12+06:00",
      "upazila": { "relationId": 123456, "nameSnapshot": "Savar Upazila" },
      "title": "Road flooded near bazar",
      "submittedBy": { "type": "ANONYMOUS" }
    }
  ]
}

6.2 Report Detail
GET /v1/admin/reports/{reportId}
Response
{
  "data": {
    "reportId": "rpt_001",
    "status": "PENDING",
    "upazila": { "relationId": 123456, "nameSnapshot": "Savar Upazila" },
    "form": { "...fullFormData": true },
    "attachments": [{ "fileId": "file_abc123", "url": "https://..." }],
    "audit": [{ "at": "2026-03-02T22:05:12+06:00", "action": "SUBMITTED", "by": "SYSTEM" }]
  }
}

6.3 Approve
POST /v1/admin/reports/{reportId}/approve
Request
{
  "notes": "Verified by call and photo evidence.",
  "verifiedUpazilaRelationId": 123456
}

Response
{
  "data": { "reportId": "rpt_001", "status": "APPROVED", "decidedAt": "2026-03-02T23:00:00+06:00" }
}

6.4 Reject
POST /v1/admin/reports/{reportId}/reject
Request
{ "reasonCode": "INSUFFICIENT_EVIDENCE", "notes": "Duplicate/unclear report." }

Response
{
  "data": { "reportId": "rpt_001", "status": "REJECTED", "decidedAt": "2026-03-02T23:01:00+06:00" }
}


7) Super Admin (Account Provisioning)
7.1 Create Account
POST /v1/super-admin/users
Request
{
  "name": "Verifier Admin",
  "email": "verifier@example.com",
  "role": "ADMIN",
  "temporaryPassword": "Temp@1234"
}

Response
{
  "data": { "userId": "usr_100", "role": "ADMIN", "status": "ACTIVE", "createdAt": "2026-03-02T21:30:00+06:00" }
}

(And the optional update/disable/reset endpoints as listed in the table.)



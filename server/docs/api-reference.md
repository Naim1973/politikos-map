# API Reference

Base URL: `http://localhost:3001`

---

## Endpoint Summary

| Group       | Method | Endpoint                                    | Auth       | Description                              |
|-------------|--------|---------------------------------------------|------------|------------------------------------------|
| Health      | GET    | `/health`                                   | Public     | Server health check                      |
| OSM Proxy   | GET    | `/v1/osm/upazilas`                          | Public     | List upazilas (dropdown data)            |
| OSM Proxy   | GET    | `/v1/osm/upazilas/{relationId}/geojson`      | Public     | GeoJSON for one upazila                  |
| OSM Proxy   | GET    | `/v1/osm/upazilas/geojson`                   | Public     | Batch GeoJSON by relation IDs            |
| Map         | GET    | `/v1/map/upazila-counts`                     | Public     | Report counts per upazila                |
| Reports     | POST   | `/v1/reports`                                | Public     | Submit a report                          |
| Reports     | GET    | `/v1/reports/status/{trackingCode}`          | Public     | Check report status                      |
| Uploads     | POST   | `/v1/uploads`                                | Public     | Get presigned upload URL                 |
| Auth        | POST   | `/v1/auth/sign-in/email`                     | Public     | Login                                    |
| Auth        | POST   | `/v1/auth/sign-out`                          | Session    | Logout                                   |
| Admin       | GET    | `/v1/admin/reports`                          | Admin      | List reports (filters + pagination)      |
| Admin       | GET    | `/v1/admin/reports/{reportId}`               | Admin      | Report detail with attachments and flags |
| Admin       | POST   | `/v1/admin/reports/{reportId}/approve`       | Admin      | Approve a report                         |
| Admin       | POST   | `/v1/admin/reports/{reportId}/reject`        | Admin      | Reject a report                          |
| Super Admin | POST   | `/v1/super-admin/users`                      | SuperAdmin | Create admin account                     |
| Super Admin | PATCH  | `/v1/super-admin/users/{userId}`             | SuperAdmin | Update user role                         |
| Super Admin | POST   | `/v1/super-admin/users/{userId}/disable`     | SuperAdmin | Disable account                          |

### Auth Levels

| Level      | Required Headers                                                                 |
|------------|----------------------------------------------------------------------------------|
| Public     | None                                                                             |
| Session    | `Cookie: better-auth.session_token=<token>`                                      |
| Admin      | `Cookie: better-auth.session_token=<token>` (user role: `admin` or `superAdmin`) |
| SuperAdmin | `Cookie: better-auth.session_token=<token>` (user role: `superAdmin`)            |

All authenticated requests must also include `Origin: http://localhost:3001`.

---

## 1. Health

### `GET /health`

Server health check.

**Request**
```
GET /health
```

**Response** `200`
```json
{
  "status": "ok"
}
```

---

## 2. OSM Proxy

These endpoints proxy to the Overpass API and return upazila data for Bangladesh. Results are cached server-side for 1 hour. First calls may take 10-30 seconds.

### `GET /v1/osm/upazilas`

Returns a list of upazilas with relation IDs and names. Used for dropdowns.

**Query Parameters**

| Param      | Type   | Default | Description              |
|------------|--------|---------|--------------------------|
| adminLevel | string | `"6"`   | OSM admin level          |
| cache      | string | `"true"`| Enable server-side cache |

**Request**
```
GET /v1/osm/upazilas
```

**Response** `200`
```json
{
  "meta": {
    "source": "overpass",
    "adminLevel": "6",
    "cached": false,
    "fetchedAt": "2026-03-07T22:11:21.505Z"
  },
  "data": [
    {
      "relationId": 4624636,
      "name": "কাউখালী উপজেলা",
      "name_en": "Kawkhali Subdistrict",
      "name_bn": ""
    },
    {
      "relationId": 4628009,
      "name": "পিরোজপুর সদর উপজেলা",
      "name_en": "Pirojpur Sadar Subdistrict",
      "name_bn": ""
    }
  ]
}
```

---

### `GET /v1/osm/upazilas/{relationId}/geojson`

Returns Leaflet-ready GeoJSON for a single upazila boundary.

**Path Parameters**

| Param      | Type   | Description          |
|------------|--------|----------------------|
| relationId | number | OSM relation ID      |

**Query Parameters**

| Param | Type   | Default  | Description              |
|-------|--------|----------|--------------------------|
| cache | string | `"true"` | Enable server-side cache |

**Request**
```
GET /v1/osm/upazilas/4624636/geojson
```

**Response** `200`
```json
{
  "meta": {
    "source": "overpass",
    "relationId": 4624636,
    "simplified": true,
    "cached": false
  },
  "data": {
    "type": "Feature",
    "properties": {
      "relationId": 4624636,
      "name": "কাউখালী উপজেলা"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[90.0, 22.0], [90.1, 22.0], [90.1, 22.1], [90.0, 22.0]]]
    }
  }
}
```

**Error** `404` — Relation not found.

---

### `GET /v1/osm/upazilas/geojson`

Returns GeoJSON FeatureCollection for multiple upazilas in a single request.

**Query Parameters**

| Param | Type   | Required | Description                          |
|-------|--------|----------|--------------------------------------|
| ids   | string | Yes      | Comma-separated list of relation IDs |
| cache | string | No       | `"true"` (default) or `"false"`      |

**Request**
```
GET /v1/osm/upazilas/geojson?ids=4624636,4628009
```

**Response** `200`
```json
{
  "meta": {
    "count": 2,
    "simplified": true,
    "cached": false
  },
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": { "relationId": 4624636, "name": "কাউখালী উপজেলা" },
        "geometry": { "type": "Polygon", "coordinates": [] }
      },
      {
        "type": "Feature",
        "properties": { "relationId": 4628009, "name": "পিরোজপুর সদর উপজেলা" },
        "geometry": { "type": "Polygon", "coordinates": [] }
      }
    ]
  }
}
```

**Error** `400` — Missing `ids` parameter.

---

## 3. Map

### `GET /v1/map/upazila-counts`

Returns report counts grouped by upazila. Used to drive the choropleth map.

**Query Parameters**

| Param       | Type    | Default      | Description                                |
|-------------|---------|--------------|--------------------------------------------|
| status      | string  | `"APPROVED"` | `APPROVED`, `PENDING`, `REJECTED`, or `ALL`|
| from        | string  | -            | ISO 8601 datetime (start of range)         |
| to          | string  | -            | ISO 8601 datetime (end of range)           |
| minCount    | number  | -            | Minimum report count to include            |
| maxCount    | number  | -            | Maximum report count to include            |
| category    | string  | -            | Comma-separated category filter            |
| includeZero | boolean | `false`      | Include upazilas with 0 reports            |
| sort        | string  | `"count_desc"` | `count_desc` or `count_asc`              |

**Request**
```
GET /v1/map/upazila-counts?status=APPROVED&minCount=1
```

**Response** `200`
```json
{
  "meta": {
    "status": "APPROVED",
    "minCount": 1,
    "totalMatchingReports": 1
  },
  "data": [
    { "relationId": 123456, "count": 1 }
  ]
}
```

---

## 4. Reports

### `POST /v1/reports`

Submit a new report. Reports start with status `PENDING` and are assigned a public tracking code.

**Headers**
```
Content-Type: application/json
```

**Request Body**

| Field                  | Type     | Required | Description                       |
|------------------------|----------|----------|-----------------------------------|
| category               | string   | Yes      | Report type (e.g. `WATER_LOGGING`)|
| title                  | string   | Yes      | Short title                       |
| description            | string   | Yes      | Full description                  |
| upazila.relationId     | number   | No       | OSM relation ID of upazila        |
| upazila.nameSnapshot   | string   | No       | Upazila name at time of report    |
| location.lat           | number   | No       | Latitude                          |
| location.lng           | number   | No       | Longitude                         |
| severity               | string   | No       | `LOW`, `MEDIUM`, `HIGH`           |
| occurredAt             | string   | No       | ISO 8601 datetime                 |
| contact.name           | string   | No       | Reporter name (optional)          |
| politicalParty         | string   | No       | Political party involved          |
| suspectName            | string   | No       | Suspect name                      |
| otherPeople            | string   | No       | Other people involved             |
| newsArticleUrl         | string   | No       | Link to news article              |
| videoEvidenceUrl       | string   | No       | Link to video evidence            |
| audioEvidenceUrl       | string   | No       | Link to audio evidence            |
| attachments            | array    | No       | `[{ "type": "image", "fileId": "<id>" }]` |

**Request**
```json
{
  "category": "WATER_LOGGING",
  "title": "Road flooded near bazar",
  "description": "Water logging for 3 days.",
  "upazila": {
    "relationId": 123456,
    "nameSnapshot": "Savar Upazila"
  },
  "location": { "lat": 23.8583, "lng": 90.2667 },
  "severity": "HIGH",
  "occurredAt": "2026-03-01T12:20:00+06:00",
  "contact": { "name": "Anonymous" },
  "attachments": [
    { "type": "image", "fileId": "jh780xhzfbkv..." }
  ]
}
```

**Response** `201`
```json
{
  "data": {
    "reportId": "jd789vawytgv0s54wca1e5qexd82eweh",
    "status": "PENDING",
    "trackingCode": "BD-EAVHPA",
    "submittedAt": "2026-03-07T22:03:37.339Z"
  }
}
```

---

### `GET /v1/reports/status/{trackingCode}`

Check the current status of a submitted report using its tracking code. Intended for anonymous reporters.

**Path Parameters**

| Param        | Type   | Description              |
|--------------|--------|--------------------------|
| trackingCode | string | e.g. `BD-EAVHPA`        |

**Request**
```
GET /v1/reports/status/BD-EAVHPA
```

**Response** `200`
```json
{
  "data": {
    "trackingCode": "BD-EAVHPA",
    "status": "APPROVED",
    "lastUpdatedAt": "2026-03-07T22:10:47.148Z"
  }
}
```

**Error** `404` — Tracking code not found.

---

## 5. Uploads

### `POST /v1/uploads`

Request a presigned URL for file upload. The client uploads the file directly to the returned URL, then includes the `fileId` when submitting a report.

**Headers**
```
Content-Type: application/json
```

**Request Body**

| Field       | Type   | Required | Description            |
|-------------|--------|----------|------------------------|
| fileName    | string | Yes      | Original file name     |
| contentType | string | Yes      | MIME type              |
| sizeBytes   | number | Yes      | File size in bytes     |

**Request**
```json
{
  "fileName": "photo.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 1839203
}
```

**Response** `200`
```json
{
  "data": {
    "fileId": "jh780xhzfbkvwjpn93rfbfyhn182ecef",
    "uploadUrl": "https://<deployment>.convex.cloud/api/storage/upload?token=...",
    "expiresInSeconds": 900
  }
}
```

**Upload Flow:**
1. Call `POST /v1/uploads` to get `fileId` + `uploadUrl`
2. Upload the file directly to `uploadUrl` via `PUT` with the file body and `Content-Type` header
3. Include the `fileId` in the report submission attachments array

---

## 6. Auth

### `POST /v1/auth/sign-in/email`

Login with email and password. Returns user data and sets an HTTP-only session cookie.

**Headers**
```
Content-Type: application/json
Origin: http://localhost:3001
```

**Request Body**

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| email    | string | Yes      | User email  |
| password | string | Yes      | Password    |

**Request**
```json
{
  "email": "superadmin@politikos.com",
  "password": "ChangeMe!2026"
}
```

**Response** `200`
```json
{
  "token": "NT106lq0k2gUuQYbW4hdMKEzfPbdSLEh",
  "user": {
    "id": "jd74bpcvv2fja9yvp8w19vd4ax82f5ee",
    "name": "Super Admin",
    "email": "superadmin@politikos.com",
    "emailVerified": false,
    "role": "superAdmin",
    "banned": false,
    "createdAt": "2026-03-07T21:50:02.638Z",
    "updatedAt": "2026-03-07T21:50:02.638Z"
  }
}
```

**Response Headers**
```
set-cookie: better-auth.session_token=<token>; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
```

Save the cookie value for use in authenticated requests.

---

### `POST /v1/auth/sign-out`

Logout and invalidate the session.

**Headers**
```
Content-Type: application/json
Origin: http://localhost:3001
Cookie: better-auth.session_token=<token>
```

**Request Body**: Empty `{}` or no body.

**Response** `200`
```json
{
  "success": true
}
```

---

## 7. Admin

All admin endpoints require a valid session cookie from a user with role `admin` or `superAdmin`.

**Required Headers for all Admin endpoints:**
```
Cookie: better-auth.session_token=<token>
Origin: http://localhost:3001
```

### `GET /v1/admin/reports`

List reports with optional filters and pagination.

**Query Parameters**

| Param    | Type   | Default | Description                    |
|----------|--------|---------|--------------------------------|
| status   | string | -       | `PENDING`, `APPROVED`, `REJECTED` |
| relationId | number | -     | Filter by upazila relation ID  |
| page     | number | `1`     | Page number                    |
| pageSize | number | `50`    | Items per page                 |

**Request**
```
GET /v1/admin/reports?status=PENDING&page=1&pageSize=50
```

**Response** `200`
```json
{
  "meta": { "page": 1, "pageSize": 50, "total": 1 },
  "data": [
    {
      "reportId": "jd789vawytgv0s54wca1e5qexd82eweh",
      "status": "PENDING",
      "submittedAt": "2026-03-07T22:03:37.339Z",
      "upazila": {
        "relationId": 123456,
        "nameSnapshot": "Savar Upazila"
      },
      "title": "Road flooded near bazar",
      "type": "WATER_LOGGING"
    }
  ]
}
```

---

### `GET /v1/admin/reports/{reportId}`

Full report detail including all fields, attachments, and admin flags.

**Path Parameters**

| Param    | Type   | Description            |
|----------|--------|------------------------|
| reportId | string | Convex document ID     |

**Request**
```
GET /v1/admin/reports/jd789vawytgv0s54wca1e5qexd82eweh
```

**Response** `200`
```json
{
  "data": {
    "_id": "jd789vawytgv0s54wca1e5qexd82eweh",
    "_creationTime": 1772921017339.1145,
    "publicTrackingCode": "BD-EAVHPA",
    "type": "WATER_LOGGING",
    "title": "Road flooded near bazar",
    "description": "Water logging for 3 days.",
    "selectedUpazilaRelationId": 123456,
    "upazilaNameSnapshot": "Savar Upazila",
    "latitude": 23.8583,
    "longitude": 90.2667,
    "workflowStatus": "PENDING",
    "updatedAt": 1772921017339,
    "attachments": [],
    "flags": []
  }
}
```

---

### `POST /v1/admin/reports/{reportId}/approve`

Approve a report after manual verification.

**Headers**
```
Content-Type: application/json
Cookie: better-auth.session_token=<token>
Origin: http://localhost:3001
```

**Request Body**

| Field                      | Type   | Required | Description                       |
|----------------------------|--------|----------|-----------------------------------|
| notes                      | string | No       | Admin notes about the decision    |
| verifiedUpazilaRelationId  | number | No       | Confirmed upazila relation ID     |

**Request**
```json
{
  "notes": "Verified by call and photo evidence.",
  "verifiedUpazilaRelationId": 123456
}
```

**Response** `200`
```json
{
  "data": {
    "reportId": "jd789vawytgv0s54wca1e5qexd82eweh",
    "status": "APPROVED",
    "decidedAt": "2026-03-07T23:00:00.000Z"
  }
}
```

---

### `POST /v1/admin/reports/{reportId}/reject`

Reject a report after manual verification.

**Headers**
```
Content-Type: application/json
Cookie: better-auth.session_token=<token>
Origin: http://localhost:3001
```

**Request Body**

| Field      | Type   | Required | Description                          |
|------------|--------|----------|--------------------------------------|
| reasonCode | string | No       | e.g. `INSUFFICIENT_EVIDENCE`, `DUPLICATE` |
| notes      | string | No       | Admin notes about the decision       |

**Request**
```json
{
  "reasonCode": "INSUFFICIENT_EVIDENCE",
  "notes": "Duplicate/unclear report."
}
```

**Response** `200`
```json
{
  "data": {
    "reportId": "jd789vawytgv0s54wca1e5qexd82eweh",
    "status": "REJECTED",
    "decidedAt": "2026-03-07T23:01:00.000Z"
  }
}
```

---

## 8. Super Admin

All super admin endpoints require a valid session cookie from a user with role `superAdmin`. There is no public signup — accounts are provisioned by a super admin.

**Required Headers for all Super Admin endpoints:**
```
Content-Type: application/json
Cookie: better-auth.session_token=<token>
Origin: http://localhost:3001
```

### `POST /v1/super-admin/users`

Create a new admin or user account.

**Request Body**

| Field             | Type   | Required | Description                   |
|-------------------|--------|----------|-------------------------------|
| name              | string | Yes      | Display name                  |
| email             | string | Yes      | Email address                 |
| temporaryPassword | string | Yes      | Initial password              |
| role              | string | No       | `admin` (default) or `user`   |

**Request**
```json
{
  "name": "Verifier Admin",
  "email": "verifier@example.com",
  "role": "admin",
  "temporaryPassword": "Temp@1234"
}
```

**Response** `201`
```json
{
  "data": {
    "user": {
      "id": "jd74bpcvv2fj...",
      "name": "Verifier Admin",
      "email": "verifier@example.com",
      "role": "admin",
      "createdAt": "2026-03-07T23:30:00.000Z"
    }
  }
}
```

---

### `PATCH /v1/super-admin/users/{userId}`

Update a user's role.

**Path Parameters**

| Param  | Type   | Description                |
|--------|--------|----------------------------|
| userId | string | Better Auth user ID        |

**Request Body**

| Field | Type   | Required | Description                         |
|-------|--------|----------|-------------------------------------|
| role  | string | Yes      | New role: `admin`, `user`, `superAdmin` |

**Request**
```json
{
  "role": "admin"
}
```

**Response** `200`
```json
{
  "data": {
    "user": {
      "id": "jd74bpcvv2fj...",
      "role": "admin"
    }
  }
}
```

---

### `POST /v1/super-admin/users/{userId}/disable`

Ban/disable a user account. The user will no longer be able to log in.

**Path Parameters**

| Param  | Type   | Description                |
|--------|--------|----------------------------|
| userId | string | Better Auth user ID        |

**Request**: No body required.

**Response** `200`
```json
{
  "data": {
    "user": {
      "id": "jd74bpcvv2fj...",
      "banned": true
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

| Status | Meaning                                        |
|--------|------------------------------------------------|
| 400    | Bad request (missing required params)          |
| 401    | Unauthorized (missing or invalid session)      |
| 403    | Forbidden (insufficient role for this action)  |
| 404    | Resource not found                             |
| 500    | Internal server error                          |
| 502    | Upstream error (Overpass API unreachable)       |

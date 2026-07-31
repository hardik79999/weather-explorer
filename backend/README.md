# ⚡ Weather Explorer — Backend API Service (FastAPI)

Production-ready FastAPI backend for InRisk Labs Weather Explorer.

## 🌐 Live Production API
- **Render Live URL**: [https://weather-backend-ck3x.onrender.com](https://weather-backend-ck3x.onrender.com)
- **API Status Check**: [https://weather-backend-ck3x.onrender.com/](https://weather-backend-ck3x.onrender.com/)

---

## 🛠️ Endpoints Specification

### 1. `POST /store-weather-data`
Fetches historical daily weather data from Open-Meteo API and stores the raw JSON dataset in AWS S3, GCS, or Local Mock Storage.

**Request Body:**
```json
{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "start_date": "2026-07-24",
  "end_date": "2026-07-30"
}
```

**Success Response (HTTP 200):**
```json
{
  "status": "ok",
  "file": "weather_23.0225_72.5714_2026-07-24_2026-07-30_1704110400.json"
}
```

### 2. `GET /list-weather-files`
Lists all saved weather dataset objects with metadata.

**Success Response (HTTP 200):**
```json
{
  "files": [
    {
      "name": "weather_23.0225_72.5714_2026-07-24_2026-07-30_1704110400.json",
      "size": 1127,
      "created_at": "2026-07-31T15:25:17.000000+00:00"
    }
  ]
}
```

### 3. `GET /weather-file-content/{file_name}`
Retrieves JSON content of a specific weather dataset file.

**404 Error Response (HTTP 404):**
```json
{
  "status": "error",
  "message": "not found"
}
```

---

## 🔒 Security & Architecture
- **Pydantic Validation**: Strict type checking with `extra="forbid"` and `allow_inf_nan=False`.
- **Path Traversal Guard**: Prevents relative directory navigation attacks using `os.path.commonpath()`.
- **IP Rate Limiter**: 5 requests per minute per IP address.
- **Payload Guard**: 1MB max upload size limit.
- **Storage Engine**: Multi-cloud driver supporting AWS S3 (`boto3`), Google Cloud Storage (`google-cloud-storage`), and Local Mock Storage (`mock_bucket/`).

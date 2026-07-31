# ⚙️ Weather Explorer — Backend Service

Python FastAPI backend for the Weather Explorer platform. Provides secure APIs to fetch, validate, and store historical climate data from the Open-Meteo archive service into local bucket storage.

---

## 📂 Backend Architecture

```
backend/
├── main.py                     # FastAPI application entry point, CORS, Rate Limiting & Security Middlewares
├── schemas.py                  # Strict Pydantic models (NaN/Inf rejection, date bounds, extra="forbid")
├── storage.py                  # Local storage layer with Path Traversal protection
├── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic, httpx, python-dotenv)
├── .env.example                # Template environment file
├── .env                        # Local environment variables (Ignored by Git)
└── mock_bucket/                # Local directory for JSON dataset files
```

---

## 🔒 Security Implementations

- **Path Traversal Protection**: File paths checked with `os.path.commonpath()` to enforce sandbox boundaries.
- **IP Rate Limiting**: Max 5 requests per minute per IP address (`HTTP 429`).
- **Payload Guard**: Max 1MB payload size enforcement (`HTTP 413`).
- **Input Guard**: Pydantic models reject Infinity, NaN, extra fields, and dates older than 1940 or spanning > 31 days.

---

## 🚀 Running Backend Locally

```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Install requirements
pip install -r requirements.txt

# 4. Start Uvicorn development server
uvicorn main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`

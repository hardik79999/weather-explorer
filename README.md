# 🌤️ Weather Explorer — Full-Stack Climate Intelligence Engine

A modern, production-grade full-stack web application built with **FastAPI (Python)** and **React + Tailwind CSS + Recharts (Vite)**. The application allows users to query real-world historical weather metrics for location presets (including all 31 Gujarat cities, 28 Indian States & UTs, and Global Metros) or custom coordinates, stores datasets securely in local storage, and visualizes daily temperature trends with interactive charts and paginated data tables.

---

## 📂 Managed Project Folder Structure

```
weather-explorer/
├── .gitignore                      # Root gitignore for Python & Node artifacts
├── README.md                       # Comprehensive Full-Stack Documentation
│
├── backend/                        # Python FastAPI Backend
│   ├── main.py                     # FastAPI server, CORS, Rate Limiter (5 req/min), Security Middlewares
│   ├── schemas.py                  # Pydantic validation models (strict type checking, forbidden extra fields)
│   ├── storage.py                  # Storage layer with Path Traversal protection & auto bucket creation
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic, httpx)
│   ├── mock_bucket/                # Local bucket directory storing fetched weather JSON datasets
│   └── venv/                       # Python Virtual Environment
│
└── frontend/                       # React + Vite + Tailwind CSS Frontend
    ├── index.html                  # HTML entry point loading Inter & Outfit Google Fonts
    ├── package.json                # React dependencies (lucide-react, recharts, axios, tailwindcss)
    ├── vite.config.js              # Vite bundler configuration
    ├── tailwind.config.js          # Tailwind CSS layout configuration
    └── src/
        ├── App.jsx                 # Top bar, live clock, segmented theme switcher (Dark/Light mode)
        ├── main.jsx                # React DOM root renderer
        ├── index.css               # Design system & dark/light theme CSS tokens
        └── components/
            ├── InputPanel.jsx      # Location filters, smart fuzzy search combobox, lat/lon inputs
            ├── FileList.jsx        # Searchable list of saved dataset files with sizes & dates
            ├── Visualization.jsx   # Recharts Line/Area charts, KPI summary cards & paginated record table
            └── LoadingSpinner.jsx  # Glassmorphic loading spinner component
```

---

## 🚀 Quick Setup & Execution Guide

### 1. Backend Setup (FastAPI)
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Launch development server
uvicorn main:app --reload --port 8000
```
Backend API server will run at: `http://127.0.0.1:8000`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
# Install node packages
npm install
# Launch frontend dev server
npm run dev
```
Frontend web application will run at: `http://localhost:5173`

---

## 🔒 Security & Enterprise Features

1. **Path Traversal Protection**: All file storage and retrieval paths are validated using `os.path.commonpath()` to strictly prevent relative path traversal (`../`).
2. **IP Rate Limiting**: In-memory rate limiter restricts API clients to **5 requests per minute per IP address** (`HTTP 429 Too Many Requests`).
3. **Payload Size Guard**: Middleware automatically rejects payloads over **1MB** (`HTTP 413 Payload Too Large`).
4. **Security Headers**: Standard headers added: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.
5. **Strict Pydantic Validation**:
   - `extra="forbid"` rejects undeclared JSON attributes.
   - `allow_inf_nan=False` prevents Infinity or NaN injections.
   - Date span is constrained between year 1940 and maximum 31 days range.

---

## 🛠️ API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/store-weather-data` | Accepts lat/lon and date range, fetches Open-Meteo archive data, and saves JSON dataset to `mock_bucket`. |
| `GET` | `/list-weather-files` | Returns list of stored dataset files with file names, sizes in bytes, and creation timestamps. |
| `GET` | `/weather-file-content/{file_name}` | Returns full JSON contents of a specified dataset file for chart & table visualization. |

---

## 🎨 UI Features

- **Cascading Location Filter**: Country ➔ State / Region ➔ City dropdown filters.
- **31 Gujarat Cities**: Full coverage of all 31 major cities/districts in Gujarat.
- **All 28 Indian States & UTs**: Full coverage of every state in India + Global Metros.
- **Smart Keyboard Search**: Up/Down Arrow & Enter key navigation for fast city searching.
- **Segmented Theme Switcher**: 100% OLED Pitch Black Dark Mode & Clean Light Mode switch.
- **Interactive Analytics**: Recharts Area & Line chart views, 4 KPI summary cards, and paginated records table.

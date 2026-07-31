import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import httpx
import time
from collections import defaultdict

# Import backend schemas and storage helper
from schemas import WeatherRequest
from storage import save_json_file, list_all_files, read_json_file

# Read environment variables with secure defaults
OPEN_METEO_API_URL = os.getenv("OPEN_METEO_API_URL", "https://archive-api.open-meteo.com/v1/archive")
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",")]

# Initialize FastAPI application
app = FastAPI(title="Weather Explorer API")

# --- SECURITY MIDDLEWARES ---

# 1. Middleware: Rejects requests with payload size larger than 1MB
class LimitUploadSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        MAX_PAYLOAD_SIZE = 1048576  # 1MB in bytes
        if "content-length" in request.headers:
            if int(request.headers["content-length"]) > MAX_PAYLOAD_SIZE:
                return JSONResponse(
                    status_code=413, 
                    content={"detail": "Request payload is too large. Max 1MB allowed."}
                )
        return await call_next(request)

# 2. Middleware: Adds HTTP security headers to every response
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

app.add_middleware(LimitUploadSizeMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Enable CORS (Cross-Origin Resource Sharing) reading allowed origins from .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- RATE LIMITER ---
rate_limit_records = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 5
RATE_LIMIT_WINDOW_SECONDS = 60

def check_rate_limit(ip_address: str):
    current_time = time.time()
    rate_limit_records[ip_address] = [
        t for t in rate_limit_records[ip_address] 
        if current_time - t < RATE_LIMIT_WINDOW_SECONDS
    ]
    
    if len(rate_limit_records[ip_address]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
        
    rate_limit_records[ip_address].append(current_time)
    return True

# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Weather Explorer API is running securely"}

@app.post("/store-weather-data")
async def store_weather_data(request: WeatherRequest, req: Request):
    
    client_ip = req.client.host if req.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait 1 minute.")
        
    params = {
        "latitude": request.latitude,
        "longitude": request.longitude,
        "start_date": request.start_date.isoformat(),
        "end_date": request.end_date.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min",
        "timezone": "auto"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OPEN_METEO_API_URL, params=params)
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch data from Open-Meteo API")
                
            weather_data = response.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503, 
            detail=f"Unable to connect to Open-Meteo API: {str(exc)}"
        )
        
    timestamp = int(time.time())
    file_name = f"weather_{request.latitude}_{request.longitude}_{request.start_date}_{request.end_date}_{timestamp}.json"
    
    success = save_json_file(file_name, weather_data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save file to storage")
        
    return {"status": "ok", "file": file_name}

@app.get("/list-weather-files")
def list_weather_files():
    files = list_all_files()
    return {"files": files}

@app.get("/weather-file-content/{file_name}")
def get_weather_file_content(file_name: str):
    content = read_json_file(file_name)
    
    if content is None:
        return JSONResponse(status_code=404, content={"status": "error", "message": "not found"})
        
    return content

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.endpoints import interview, report



app = FastAPI(title="InterVueX AI API", version="0.1.0")

# Set up CORS - Mandatory for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "InterVueX AI Backend is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print(f"[ERROR] Global Error: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend Error: {str(exc)}", "type": type(exc).__name__}
    )

# Explicitly include routers with trailing slash handling
# Include both with and without api/v1 for maximum compatibility during deployment
app.include_router(interview.router, prefix="/api/v1/interview")
app.include_router(report.router, prefix="/api/v1/report")

# Fallback for those who might omit /api/v1 in their environment variables
app.include_router(interview.router, prefix="/interview")
app.include_router(report.router, prefix="/report")

@app.middleware("http")
async def add_process_time_header(request, call_next):
    import time
    start_time = time.time()
    print(f"[API] {request.method} {request.url}")
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"[API] {request.method} {request.url} - {response.status_code} ({process_time:.2f}s)")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

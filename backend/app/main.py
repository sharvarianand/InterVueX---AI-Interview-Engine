from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.endpoints import interview, report



app = FastAPI(title="InterVueX AI API", version="0.1.0")

# Set up CORS - Be very permissive for the hackathon to avoid blocking
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

# Health check for HF
@app.get("/health")
async def health():
    return {"status": "ok"}

# Explicitly include routers with trailing slash handling
app.include_router(interview.router, prefix="/api/v1/interview")
app.include_router(report.router, prefix="/api/v1/report")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

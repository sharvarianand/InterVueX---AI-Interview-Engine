from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import interview, report

app = FastAPI(title="InterVueX AI API", version="0.1.0")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to InterVueX AI Backend"}

app.include_router(interview.router, prefix="/api/v1/interview", tags=["interview"])
app.include_router(report.router, prefix="/api/v1/report", tags=["report"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.api import router as api_router
from backend.services.ml_service import ml_service

app = FastAPI(
    title="CAREER AI® Pro Enterprise Backend",
    description="High-performance ML Career Intelligence, Salary Estimation, Multi-Factor Job Recommendation, and Resume Parser Engine.",
    version="2.0.0"
)

# Enable CORS for Next.js frontend (localhost:3000, 3001, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "platform": "CAREER AI® Pro API",
        "version": "2.0.0",
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": {
            "india_salary_model": ml_service.model_india is not None,
            "us_salary_model": ml_service.model_us is not None,
            "jobs_database_count": len(ml_service.jobs_df)
        }
    }

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

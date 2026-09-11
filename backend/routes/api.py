from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from backend.models_schemas import (
    SalaryPredictionRequest, SalaryPredictionResponse,
    JobRecommendRequest, JobRecommendResponse,
    SkillGapRequest, SkillGapResponse,
    RoadmapResponse, ResumeParseResponse
)
from backend.services.ml_service import ml_service
from backend.services.resume_service import resume_service

router = APIRouter(prefix="/api", tags=["Career AI Core API"])

@router.get("/metadata")
def get_metadata():
    return ml_service.get_metadata()

@router.post("/salary/predict", response_model=SalaryPredictionResponse)
def predict_salary(payload: SalaryPredictionRequest):
    try:
        result = ml_service.predict_salary(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Salary prediction error: {str(e)}")

@router.post("/jobs/recommend", response_model=JobRecommendResponse)
def recommend_jobs(payload: JobRecommendRequest):
    try:
        result = ml_service.recommend_jobs(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job recommendation error: {str(e)}")

@router.post("/skills/gap-analysis", response_model=SkillGapResponse)
def analyze_skill_gap(payload: SkillGapRequest):
    try:
        result = ml_service.analyze_skill_gap(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap analysis error: {str(e)}")

@router.post("/roadmap/generate", response_model=RoadmapResponse)
def generate_roadmap(payload: SkillGapRequest):
    try:
        result = ml_service.generate_roadmap(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation error: {str(e)}")

@router.post("/resume/parse", response_model=ResumeParseResponse)
async def parse_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    try:
        extracted_text = ""
        if file is not None:
            content = await file.read()
            if file.filename.lower().endswith(".pdf"):
                extracted_text = resume_service.extract_text_from_pdf(content)
            else:
                extracted_text = content.decode("utf-8", errors="ignore")
        elif raw_text:
            extracted_text = raw_text
        else:
            raise HTTPException(status_code=400, detail="Please upload a PDF/text file or provide raw text.")

        parsed_data = resume_service.parse_resume_content(extracted_text)
        return parsed_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing error: {str(e)}")

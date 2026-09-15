from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from backend.models_schemas import (
    SalaryPredictionRequest, SalaryPredictionResponse,
    JobRecommendRequest, JobRecommendResponse,
    SkillGapRequest, SkillGapResponse,
    RoadmapResponse, ResumeParseResponse,
    ResumeAnalyzeResponse
)
from backend.services.ml_service import ml_service
from backend.services.resume_service import resume_service

router = APIRouter(prefix="/api", tags=["Career AI Core API"])

@router.get("/metadata")
def get_metadata():
    """Retrieve all project metadata, skills, job roles, locations, education tiers, and personas."""
    return ml_service.get_metadata()

@router.post("/salary/predict", response_model=SalaryPredictionResponse)
def predict_salary(payload: SalaryPredictionRequest):
    """Predict annual compensation with ML regression and market percentiles."""
    try:
        result = ml_service.predict_salary(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Salary prediction error: {str(e)}"
        )

@router.post("/jobs/recommend", response_model=JobRecommendResponse)
def recommend_jobs(payload: JobRecommendRequest):
    """Recommend top career opportunities matching candidate skills using TF-IDF & Cosine Similarity."""
    try:
        result = ml_service.recommend_jobs(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job recommendation error: {str(e)}"
        )

@router.post("/skills/gap-analysis", response_model=SkillGapResponse)
def analyze_skill_gap(payload: SkillGapRequest):
    """Analyze missing skills, candidate readiness index, and curated learning resources."""
    try:
        result = ml_service.analyze_skill_gap(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Skill gap analysis error: {str(e)}"
        )

@router.post("/roadmap/generate", response_model=RoadmapResponse)
def generate_roadmap(payload: SkillGapRequest):
    """Generate a step-by-step 90-day milestone career roadmap."""
    try:
        result = ml_service.generate_roadmap(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Roadmap generation error: {str(e)}"
        )

@router.post(
    "/resume/analyze",
    response_model=ResumeAnalyzeResponse,
    summary="Upload and analyze a PDF resume into a structured candidate profile."
)
async def analyze_resume(
    file: Optional[UploadFile] = File(None, description="PDF or text resume file"),
    raw_text: Optional[str] = Form(None, description="Raw resume text")
):
    """
    Complete Resume Analyzer endpoint.
    Extracts candidate name, email, phone, current role, target role, experience,
    education level, location, technical skills, soft skills, and certifications.
    """
    try:
        if file is not None:
            filename = file.filename or "resume.pdf"
            content = await file.read()
            if len(content) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded resume file is empty."
                )
            if len(content) > 12 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File size exceeds the 12MB limit."
                )

            analysis = resume_service.analyze_resume(content, filename)
            if not analysis["success"]:
                # Scanned / Image-based PDF detected
                return analysis
            return analysis

        elif raw_text and raw_text.strip():
            content = raw_text.encode("utf-8")
            analysis = resume_service.analyze_resume(content, "resume.txt")
            return analysis
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please upload a PDF resume file or provide resume text."
            )
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume analysis failed: {str(e)}"
        )

@router.post("/resume/parse", response_model=ResumeParseResponse)
async def parse_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """Legacy resume parsing endpoint for backwards compatibility."""
    try:
        extracted_text = ""
        if file is not None:
            content = await file.read()
            if not content or len(content) == 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is empty.")
            if file.filename and file.filename.lower().endswith(".pdf"):
                text, _, is_scanned = resume_service.extract_text_from_pdf(content)
                if is_scanned:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="This resume appears to be image-based or scanned. Please upload a text-based PDF."
                    )
                extracted_text = text
            else:
                extracted_text = content.decode("utf-8", errors="ignore")
        elif raw_text:
            extracted_text = raw_text
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a PDF/text file or provide raw text.")

        parsed_data = resume_service.parse_resume_content(extracted_text)
        return parsed_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Resume parsing error: {str(e)}")

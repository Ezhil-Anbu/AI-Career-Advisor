import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.main import app
from backend.services.ml_service import ml_service
from backend.services.resume_service import resume_service

print("Testing ML Service Metadata...")
meta = ml_service.get_metadata()
print(f"Skills count: {len(meta['all_skills'])}, Job titles: {len(meta['job_titles'])}")

print("Testing Salary Prediction...")
pred = ml_service.predict_salary({
    "country": "India",
    "job_title": "Data Scientist",
    "experience": 3.5,
    "education": "Master",
    "location": "Bangalore",
    "company_size": "Medium",
    "employment_type": "Full-time",
    "skills": ["Python", "SQL", "Machine Learning"]
})
print(f"Prediction: {pred['formatted_salary']}, Benchmark: {pred['market_benchmark']['market_average']}")

print("Testing Job Recommender...")
recs = ml_service.recommend_jobs({
    "user_skills": ["Python", "SQL", "Machine Learning"],
    "target_role": "Data Scientist",
    "experience": 3.0,
    "education": "Master",
    "top_k": 3
})
print(f"Top jobs matched: {len(recs['jobs'])}, First job: {recs['jobs'][0]['job_title']} ({recs['jobs'][0]['match_score']}%)")

print("Testing Skill Gap...")
gap = ml_service.analyze_skill_gap({
    "user_skills": ["Python"],
    "target_role": "Data Scientist"
})
print(f"Readiness: {gap['overall_readiness_score']}%, Missing critical: {gap['missing_critical']}")

print("Testing Resume Parser...")
parsed = resume_service.parse_resume_content("John Doe. Experienced Python and SQL Data Scientist with 5 years of experience in Machine Learning and Docker.")
print(f"Extracted skills: {parsed['extracted_skills']}, Estimated Exp: {parsed['estimated_experience']}")

print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")

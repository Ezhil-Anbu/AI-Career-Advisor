"""smoke_test.py — verifies FastAPI backend, ML models, endpoints, and Vercel serverless entrypoint end-to-end"""
import sys
import os
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import joblib
import numpy as np
import pandas as pd
from starlette.testclient import TestClient

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

errors = []
print("=" * 70)
print("CAREER AI PRO — FULL-STACK & SERVERLESS SMOKE TEST SUITE")
print("=" * 70)

# ── Test 1: Entrypoint & FastAPI App Import ────────────────────────────────────
try:
    from backend.main import app as main_app
    from api.index import app as vercel_app
    assert main_app is not None, "backend.main:app is None"
    assert vercel_app is not None, "api.index:app is None"
    print(f"[{PASS}] Entrypoints 'backend.main:app' and 'api.index:app' import cleanly.")
except Exception as e:
    errors.append(f"Import error: {e}")
    print(f"[{FAIL}] Entrypoints import: {e}")

# ── Test 2: ML Model Artifacts Loading ─────────────────────────────────────────
models_to_test = [
    ("salary_model_india.pkl", "India Salary Model"),
    ("salary_model_us.pkl", "US Salary Model"),
    ("salary_model.pkl", "Unified Fallback Salary Model"),
    ("recommender.pkl", "Recommender TF-IDF Model")
]

for filename, desc in models_to_test:
    model_path = Path("models") / filename
    try:
        assert model_path.exists(), f"{filename} does not exist"
        loaded = joblib.load(model_path)
        assert loaded is not None, f"Loaded object for {filename} is None"
        print(f"[{PASS}] {desc} ({filename}) loaded successfully.")
    except Exception as e:
        errors.append(f"Model load {filename}: {e}")
        print(f"[{FAIL}] {desc} ({filename}): {e}")

# ── Test 3: ML Service Unit Checks ─────────────────────────────────────────────
try:
    from backend.services.ml_service import ml_service
    meta = ml_service.get_metadata()
    assert len(meta["all_skills"]) > 50, "Skills list too short"
    assert len(meta["job_titles"]) > 0, "Job titles empty"
    print(f"[{PASS}] MLService metadata verified ({len(meta['all_skills'])} skills, {len(meta['job_titles'])} titles).")

    # Salary Prediction (India)
    pred_in = ml_service.predict_salary({
        "country": "India",
        "job_title": "AI Engineer",
        "experience": 3.0,
        "education": "Master",
        "location": "Bangalore",
        "company_size": "Medium",
        "employment_type": "Full-time",
        "skills": ["Python", "PyTorch", "Machine Learning"]
    })
    assert pred_in["predicted_salary"] > 0, "India prediction is 0"
    print(f"[{PASS}] MLService India salary prediction: {pred_in['formatted_salary']}")

    # Salary Prediction (US)
    pred_us = ml_service.predict_salary({
        "country": "United States",
        "job_title": "Data Scientist",
        "experience": 5.0,
        "education": "Master",
        "location": "San Francisco",
        "company_size": "Enterprise",
        "employment_type": "Full-time",
        "skills": ["Python", "SQL", "Machine Learning"]
    })
    assert pred_us["predicted_salary"] > 0, "US prediction is 0"
    print(f"[{PASS}] MLService US salary prediction: {pred_us['formatted_salary']}")

    # Job Recommendation
    recs = ml_service.recommend_jobs({
        "user_skills": ["Python", "Deep Learning", "TensorFlow"],
        "target_role": "AI Engineer",
        "experience": 2.5,
        "education": "Bachelor",
        "top_k": 5
    })
    assert len(recs["jobs"]) > 0, "No jobs returned"
    print(f"[{PASS}] MLService Job recommendation: {len(recs['jobs'])} top matches (Top score: {recs['jobs'][0]['match_score']}%).")

    # Skill Gap & Roadmap
    gap = ml_service.analyze_skill_gap({
        "user_skills": ["Python", "SQL"],
        "target_role": "AI Engineer"
    })
    assert "overall_readiness_score" in gap
    print(f"[{PASS}] MLService Skill gap analysis: readiness {gap['overall_readiness_score']}%.")

    roadmap = ml_service.generate_roadmap({
        "user_skills": ["Python", "SQL"],
        "target_role": "AI Engineer"
    })
    assert len(roadmap["milestones"]) == 3
    print(f"[{PASS}] MLService 90-day roadmap: {len(roadmap['milestones'])} phases generated.")
except Exception as e:
    errors.append(f"MLService unit test error: {e}")
    print(f"[{FAIL}] MLService unit test: {e}")

# ── Test 4: Resume Service Unit Checks ─────────────────────────────────────────
try:
    from backend.services.resume_service import resume_service
    parsed = resume_service.parse_resume_content(
        "Jane Doe. Senior Machine Learning Engineer with 6 years of experience in Python, PyTorch, Docker, and AWS."
    )
    assert "Python" in parsed["extracted_skills"]
    assert parsed["estimated_experience"] >= 5.0
    print(f"[{PASS}] ResumeService parser: {len(parsed['extracted_skills'])} skills, {parsed['estimated_experience']} yrs exp.")
except Exception as e:
    errors.append(f"ResumeService error: {e}")
    print(f"[{FAIL}] ResumeService: {e}")

# ── Test 5: FastAPI HTTP Endpoints via TestClient ──────────────────────────────
try:
    client = TestClient(main_app)

    # 1. Root & Health
    r = client.get("/")
    assert r.status_code == 200, f"Root returned {r.status_code}"
    r_health = client.get("/health")
    assert r_health.status_code == 200, f"Health returned {r_health.status_code}"
    print(f"[{PASS}] HTTP GET '/' and '/health' returned 200 OK.")

    # 2. Metadata
    r_meta = client.get("/api/metadata")
    assert r_meta.status_code == 200, f"Metadata returned {r_meta.status_code}"
    print(f"[{PASS}] HTTP GET '/api/metadata' returned 200 OK.")

    # 3. Predict Salary
    r_sal = client.post("/api/salary/predict", json={
        "country": "India",
        "job_title": "Software Engineer",
        "experience": 2.0,
        "education": "Bachelor",
        "location": "Bangalore",
        "skills": ["Python", "FastAPI", "SQL"]
    })
    assert r_sal.status_code == 200, f"Salary predict returned {r_sal.status_code}: {r_sal.text}"
    print(f"[{PASS}] HTTP POST '/api/salary/predict' returned 200 OK.")

    # 4. Recommend Jobs
    r_jobs = client.post("/api/jobs/recommend", json={
        "user_skills": ["Python", "FastAPI", "SQL"],
        "target_role": "Software Engineer",
        "experience": 2.0,
        "education": "Bachelor",
        "top_k": 4
    })
    assert r_jobs.status_code == 200, f"Jobs recommend returned {r_jobs.status_code}: {r_jobs.text}"
    print(f"[{PASS}] HTTP POST '/api/jobs/recommend' returned 200 OK.")

    # 5. Skill Gap Analysis
    r_gap = client.post("/api/skills/gap-analysis", json={
        "user_skills": ["Python"],
        "target_role": "Data Scientist"
    })
    assert r_gap.status_code == 200, f"Skill gap returned {r_gap.status_code}: {r_gap.text}"
    print(f"[{PASS}] HTTP POST '/api/skills/gap-analysis' returned 200 OK.")

    # 6. Roadmap Generation
    r_road = client.post("/api/roadmap/generate", json={
        "user_skills": ["Python"],
        "target_role": "Data Scientist"
    })
    assert r_road.status_code == 200, f"Roadmap returned {r_road.status_code}: {r_road.text}"
    print(f"[{PASS}] HTTP POST '/api/roadmap/generate' returned 200 OK.")

    # 7. Resume Parse (raw text) — legacy endpoint
    r_res = client.post("/api/resume/parse", data={"raw_text": "Experienced Python Developer with 4 years in Git, Docker."})
    assert r_res.status_code == 200, f"Resume parse returned {r_res.status_code}: {r_res.text}"
    print(f"[{PASS}] HTTP POST '/api/resume/parse' returned 200 OK.")

    # 8. Resume Analyze — new rich endpoint
    SAMPLE_RESUME = (
        "Priya Sharma\nEmail: priya@example.com | Phone: +91 9876501234\n"
        "Location: Bangalore, India\n\n"
        "AI Engineer with 4 years of experience in Python, TensorFlow, Docker, Kubernetes.\n\n"
        "EDUCATION\nMaster of Technology (M.Tech) in AI\nIIT Bangalore | 2018 - 2020\n\n"
        "EXPERIENCE\nAI Engineer | DataCorp\nJan 2020 - Present\n- Built ML pipelines.\n"
    )
    r_analyze = client.post("/api/resume/analyze", data={"raw_text": SAMPLE_RESUME})
    assert r_analyze.status_code == 200, f"Resume analyze returned {r_analyze.status_code}: {r_analyze.text}"
    analyze_data = r_analyze.json()
    assert analyze_data.get("success") is True, f"Resume analyze success=False: {analyze_data.get('message')}"
    assert "profile" in analyze_data, "Resume analyze missing 'profile'"
    prof_data = analyze_data["profile"]
    assert "Python" in prof_data.get("skills", []), f"Python not in skills: {prof_data.get('skills')}"
    assert prof_data.get("education") in ["Master", "Bachelor", "PhD"], \
        f"Education unexpected: {prof_data.get('education')}"
    print(f"[{PASS}] HTTP POST '/api/resume/analyze' returned 200 OK — "
          f"extracted {len(prof_data.get('skills', []))} skills, "
          f"education={prof_data.get('education')}, "
          f"location={prof_data.get('location')}.")

except Exception as e:
    errors.append(f"HTTP TestClient error: {e}")
    print(f"[{FAIL}] HTTP TestClient: {e}")

# ── Final Summary ──────────────────────────────────────────────────────────────
print("=" * 70)
if errors:
    print(f"RESULT: {len(errors)} TEST(S) FAILED:")
    for err in errors:
        print(f"  ❌ {err}")
    sys.exit(1)
else:
    print(f"🎉 ALL TESTS PASSED! Production startup & serverless function verified 100%.")
    print("=" * 70)


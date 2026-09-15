import io
import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.services.resume_service import resume_service
from backend.services.ml_service import ml_service

PASS_MARK = "[PASS]"
FAIL_MARK = "[FAIL]"
failures = []

def check(condition: bool, label: str, detail: str = "") -> None:
    if condition:
        print(f"  {PASS_MARK} {label}")
    else:
        msg = f"{label}" + (f": {detail}" if detail else "")
        print(f"  {FAIL_MARK} {msg}")
        failures.append(msg)


def section(title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ─── Test 1: Full Candidate Profile — Arun Kumar ─────────────────────────────
section("Test 1: Full Candidate Profile Extraction (Arun Kumar)")

ARUN_RESUME = """
Arun Kumar
Email: arun.kumar@example.com | Phone: +91 9876543210
Location: Chennai, India
LinkedIn: linkedin.com/in/arunkumar-ai

PROFESSIONAL SUMMARY
Innovative AI Engineer with 3 years of experience developing machine learning models
and deploying scalable FastAPI services in production environments.

CORE SKILLS
- Languages: Python, SQL, JavaScript
- Machine Learning: Machine Learning, Deep Learning, Pandas, TensorFlow, Scikit-learn, PyTorch
- DevOps & Tools: Git, Docker, Kubernetes, FastAPI, REST API, Linux
- Soft Skills: Leadership, Communication, Problem Solving

PROFESSIONAL EXPERIENCE
AI Engineer | FinTech Labs, Chennai
Jan 2021 - Present
- Architected NLP recommendation engine utilizing Transformers and BERT.
- Containerized ML services with Docker and orchestrated deployments on Kubernetes.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science & Engineering
Anna University, Chennai | 2016 - 2020

CERTIFICATIONS
- AWS Certified Solutions Architect
- TensorFlow Developer Certificate

PROJECTS
- AI Resume Intelligence: Built NLP parser in Python and FastAPI with 95% accuracy.
"""

res = resume_service.analyze_resume(ARUN_RESUME.encode("utf-8"), "resume.txt")
check(res["success"] is True, "Analysis succeeded")

prof = res["profile"]
print(f"    Extracted Name       : {prof['name']}")
print(f"    Extracted Email      : {prof['email']}")
print(f"    Extracted Phone      : {prof['phone']}")
print(f"    Extracted Role       : {prof['role']} (conf={prof['role_confidence']})")
print(f"    Extracted Experience : {prof['experience_years']} Years")
print(f"    Extracted Education  : {prof['education']}")
print(f"    Extracted Location   : {prof['location']}, {prof['country']}")
print(f"    Extracted Skills ({len(prof['skills'])}): {prof['skills']}")
print(f"    Soft Skills          : {prof['soft_skills']}")
print(f"    Certifications       : {prof['certifications']}")

check(prof["name"] == "Arun Kumar",          "Name == 'Arun Kumar'",       str(prof["name"]))
check(prof["email"] == "arun.kumar@example.com", "Email correct",           str(prof["email"]))
check(prof["phone"] is not None and "+91" in prof["phone"], "Phone has +91", str(prof["phone"]))
check(prof["role"] == "AI Engineer",         "Role == 'AI Engineer'",       str(prof["role"]))
check(prof["experience_years"] == 3.0,       "Experience == 3.0 years",     str(prof["experience_years"]))
check(prof["education"] == "Bachelor",       "Education == 'Bachelor'",     str(prof["education"]))
check(prof["location"] == "Chennai",         "Location == 'Chennai'",       str(prof["location"]))
check("Python" in prof["skills"],            "Skills includes Python")
check("TensorFlow" in prof["skills"],        "Skills includes TensorFlow")
check("SQL" in prof["skills"],               "Skills includes SQL")
check("FastAPI" in prof["skills"],           "Skills includes FastAPI (own skill, not REST API)")
check("Leadership" in prof["soft_skills"],   "Soft Skills includes Leadership")
check(len(prof["certifications"]) > 0,       "Certifications extracted")


# ─── Test 2: Indian Degree Normalization ─────────────────────────────────────
section("Test 2: Indian Degree Normalization")

cases = [
    ("Graduated with M.Tech in Artificial Intelligence", "Master"),
    ("Completed MCA from NIT Trichy", "Master"),
    ("Holds a Ph.D. in Computer Vision", "PhD"),
    ("Completed B.E. Electronics and Communication", "Bachelor"),
    ("Diploma in Polytechnic Engineering", "Associate"),
    ("Bachelor of Technology Computer Science", "Bachelor"),
    ("Master of Science in Data Science", "Master"),
]
for text, expected in cases:
    result = resume_service.extract_education(text)
    check(result == expected, f"'{text[:40]}...' → {expected}", f"got {result}")


# ─── Test 3: Location Aliases ─────────────────────────────────────────────────
section("Test 3: Location Aliases & Normalization")

loc_cases = [
    ("Currently living in Bengaluru, Karnataka", "Bangalore", "India"),
    ("Working in Silicon Valley / SF Bay Area", "San Francisco", "United States"),
    ("Based in Cyber City, Gurgaon", "Gurgaon", "India"),
    ("Office in Bombay, Maharashtra", "Mumbai", "India"),
    ("Located in Ahmedabad, Gujarat", "Ahmedabad", "India"),  # Fixed: was wrongly → Bangalore
    ("Working remotely from New Delhi", "Delhi", "India"),
]
for text, expected_city, expected_country in loc_cases:
    city, country = resume_service.extract_location(text)
    check(city == expected_city and country == expected_country,
          f"'{text[:40]}' → {expected_city}, {expected_country}",
          f"got ({city}, {country})")


# ─── Test 4: Skill Aliases ────────────────────────────────────────────────────
section("Test 4: Skill Aliases (K8s, ML, DL, TS, JS, TF, FastAPI, Flask...)")

alias_text = "Proficient in K8s, ML, DL, TS, JS, Postgres, Mongo, TF, FastAPI, Flask, Django, and AWS."
extracted_s = resume_service.extract_skills(alias_text)
print(f"    Extracted: {extracted_s}")

check("Kubernetes" in extracted_s,       "K8s → Kubernetes")
check("Machine Learning" in extracted_s, "ML → Machine Learning")
check("Deep Learning" in extracted_s,    "DL → Deep Learning")
check("TypeScript" in extracted_s,       "TS → TypeScript")
check("JavaScript" in extracted_s,       "JS → JavaScript")
check("PostgreSQL" in extracted_s,       "Postgres → PostgreSQL")
check("MongoDB" in extracted_s,          "Mongo → MongoDB")
check("TensorFlow" in extracted_s,       "TF → TensorFlow")
check("AWS" in extracted_s,              "AWS → AWS")
check("FastAPI" in extracted_s,          "FastAPI → FastAPI (own skill)")
check("Flask" in extracted_s,            "Flask → Flask (own skill)")
check("Django" in extracted_s,           "Django → Django (own skill)")


# ─── Test 5: Scanned / Empty PDF Detection ────────────────────────────────────
section("Test 5: Scanned / Empty / Blank Text Detection")

# Empty .txt — must return dict (not raise), success=False
empty_res = resume_service.analyze_resume(b"", "empty.txt")
check(empty_res["success"] is False,                     "Empty .txt → success=False")
check(empty_res["error_code"] == "NO_EXTRACTABLE_TEXT",  "Empty .txt → NO_EXTRACTABLE_TEXT")

# Whitespace-only .txt
whitespace_res = resume_service.analyze_resume(b"     \n\n   \t  ", "scanned.txt")
check(whitespace_res["success"] is False,                "Whitespace-only → success=False")
check(whitespace_res["error_code"] == "NO_EXTRACTABLE_TEXT", "Whitespace-only → NO_EXTRACTABLE_TEXT")

print(f"    Scanned message: {whitespace_res['message']}")


# ─── Test 6: Experience Extraction — No Education Date Double-Counting ────────
section("Test 6: Experience — Education Dates Excluded from Calculation")

exp_text = """
Software Engineer | TechCorp
Jan 2022 - Present

Education
Bachelor of Technology
2018 - 2022
"""
years, evidence = resume_service.extract_experience(exp_text)
print(f"    Extracted experience: {years} years | Evidence: {evidence}")
# Education dates 2018-2022 must NOT be counted; only 2022-present (employment)
# So result should be about 3-4 years (current year 2026 - 2022 = ~4)
check(years is not None and years <= 6,
      f"Experience {years} ≤ 6 (education dates not double-counted)")
check(years is not None and years >= 2,
      f"Experience {years} ≥ 2 (employment period counted)")


# ─── Test 7: Multi-field Resume Without Location ──────────────────────────────
section("Test 7: Resume Without Location Returns None")

no_loc_text = """
Jane Smith
jane@example.com | +91 9988776655

Senior Data Scientist with 6 years of experience in Python, SQL, Machine Learning.

EDUCATION
Master of Science in Data Science
IIT Madras, 2018
"""
res7 = resume_service.analyze_resume(no_loc_text.encode("utf-8"), "jane.txt")
check(res7["success"] is True,           "Analysis succeeded")
check(res7["profile"]["location"] is None, "No location → None (not guessed)")
check(res7["profile"]["name"] == "Jane Smith", "Name extracted correctly")
print(f"    Detected education: {res7['profile']['education']}")
check(res7["profile"]["education"] == "Master", "IIT Madras MSc → 'Master'")


# ─── Test 8: Target Role Extraction ──────────────────────────────────────────
section("Test 8: Target Role Extraction")

target_text = "Seeking a Machine Learning Engineer position in a fast-paced AI startup."
target_role = resume_service.extract_target_role(target_text)
check(target_role == "Machine Learning Engineer",
      "Target role extracted correctly", str(target_role))


# ─── Test 9: End-to-End Pipeline with Salary & Job Recommendation ────────────
section("Test 9: Integration — Salary Prediction & Job Recommendation")

sal_pred = ml_service.predict_salary({
    "country": prof["country"],
    "job_title": prof["role"],
    "experience": prof["experience_years"],
    "education": prof["education"],
    "location": prof["location"],
    "company_size": "Medium",
    "employment_type": "Full-time",
    "skills": prof["skills"]
})
check(sal_pred["predicted_salary"] > 0,  "Salary prediction > 0")
print(f"    Predicted Salary: {sal_pred['formatted_salary']} (conf={sal_pred['confidence_score']}%)")

job_recs = ml_service.recommend_jobs({
    "user_skills": prof["skills"],
    "target_role": prof["role"],
    "experience": prof["experience_years"],
    "education": prof["education"],
    "location": prof["location"],
    "country": prof["country"],
    "top_k": 3
})
check(len(job_recs["jobs"]) > 0,  "Job recommendations returned")
if job_recs["jobs"]:
    top = job_recs["jobs"][0]
    print(f"    Top Job: {top['job_title']} at {top['company']} ({top['match_score']}% match)")


# ─── Test 10: Skill Gap with Extracted Profile ────────────────────────────────
section("Test 10: Skill Gap Analysis Using Extracted Profile")

gap = ml_service.analyze_skill_gap({
    "user_skills": prof["skills"],
    "target_role": "AI Engineer",
    "experience": prof["experience_years"]
})
check("overall_readiness_score" in gap,  "Skill gap readiness score returned")
print(f"    Readiness: {gap['overall_readiness_score']}%")
print(f"    Matched skills: {gap['matched_skills'][:5]}")
print(f"    Missing critical: {gap['missing_critical']}")


# ─── Final Summary ────────────────────────────────────────────────────────────
print()
print("=" * 60)
if failures:
    print(f"RESULT: {len(failures)} TEST(S) FAILED:")
    for f in failures:
        print(f"  FAIL  {f}")
    sys.exit(1)
else:
    print(f"ALL {10} RESUME ANALYZER TESTS PASSED (100%)!")
    print("=" * 60)

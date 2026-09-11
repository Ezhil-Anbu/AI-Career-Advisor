"""smoke_test.py — verifies multi-market saved models and recommendation engine end-to-end"""
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics.pairwise import cosine_similarity

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

errors = []

# ── Test 1: India salary model loads & predicts ────────────────────────────────
try:
    bundle_in = joblib.load("models/salary_model_india.pkl")
    assert "pipeline" in bundle_in, "Pipeline missing in bundle_in"
    pipe_in = bundle_in["pipeline"]
    print(f"[{PASS}] salary_model_india.pkl loads correctly")
    print(f"       Best model : {bundle_in['best_model_name']}")
    r_in = bundle_in["results"][bundle_in["best_model_name"]]
    print(f"       MAE=Rs {r_in['MAE']:,.0f}  RMSE=Rs {r_in['RMSE']:,.0f}  R2={r_in['R²']:.4f}")

    sample_in = pd.DataFrame([{
        "Experience": 0, "Education": "Bachelor",
        "Location": "Chennai", "Job Title": "AI Engineer",
        "Company Size": "Medium", "Employment Type": "Full-time",
        "Skills": "Python, Machine Learning, SQL"
    }])
    pred_in = float(pipe_in.predict(sample_in)[0])
    assert 500000 <= pred_in <= 1500000, f"Unrealistic India prediction: {pred_in}"
    print(f"[{PASS}] India Salary prediction: Rs {pred_in:,.0f} ({pred_in/100000:.2f} LPA)")
except Exception as e:
    errors.append(f"India salary model: {e}")
    print(f"[{FAIL}] India salary model: {e}")

# ── Test 2: US salary model loads & predicts ──────────────────────────────────
try:
    bundle_us = joblib.load("models/salary_model_us.pkl")
    assert "pipeline" in bundle_us, "Pipeline missing in bundle_us"
    pipe_us = bundle_us["pipeline"]
    print(f"[{PASS}] salary_model_us.pkl loads correctly")
    print(f"       Best model : {bundle_us['best_model_name']}")
    r_us = bundle_us["results"][bundle_us["best_model_name"]]
    print(f"       MAE=${r_us['MAE']:,.0f}  RMSE=${r_us['RMSE']:,.0f}  R2={r_us['R²']:.4f}")

    sample_us = pd.DataFrame([{
        "Experience": 5, "Education": "Master",
        "Location": "New York", "Job Title": "Data Scientist",
        "Company Size": "Large", "Employment Type": "Full-time",
        "Skills": "Python, Machine Learning, SQL"
    }])
    pred_us = float(pipe_us.predict(sample_us)[0])
    assert 100000 <= pred_us <= 300000, f"Unrealistic US prediction: {pred_us}"
    print(f"[{PASS}] US Salary prediction: ${pred_us:,.0f}")
except Exception as e:
    errors.append(f"US salary model: {e}")
    print(f"[{FAIL}] US salary model: {e}")

# ── Test 3: recommender model loads ──────────────────────────────────────────
try:
    rec = joblib.load("models/recommender.pkl")
    assert "vectorizer" in rec and "matrix" in rec and "titles" in rec
    print(f"[{PASS}] recommender.pkl loads correctly")
    print(f"       Precision@5 : {rec['precision5']:.3f}")
    print(f"       Unique roles : {len(set(rec['titles']))}")
except Exception as e:
    errors.append(f"recommender load: {e}")
    print(f"[{FAIL}] recommender.pkl: {e}")

# ── Test 4: job recommendation ────────────────────────────────────────────────
try:
    vec     = rec["vectorizer"]
    matrix  = rec["matrix"]
    titles  = rec["titles"]
    jobs_df = rec["jobs_df"]

    q    = vec.transform(["Python Machine Learning SQL TensorFlow Deep Learning"])
    sims = cosine_similarity(q, matrix).flatten()
    title_scores = {}
    for i, t in enumerate(titles):
        title_scores.setdefault(t, []).append(sims[i])
    avg   = {t: np.mean(v) for t, v in title_scores.items()}
    top5  = sorted(avg.items(), key=lambda x: x[1], reverse=True)[:5]
    max_s = top5[0][1]
    shown = [(t, min(s / max(max_s, 1e-6) * 94 + 6, 99)) for t, s in top5]
    assert len(shown) >= 3, "Less than 3 recommendations"
    print(f"[{PASS}] Job recommendations returned:")
    for t, p in shown:
        print(f"       {p:.1f}%  {t}")
except Exception as e:
    errors.append(f"job recommendation: {e}")
    print(f"[{FAIL}] Job recommendation: {e}")

# ── Test 5: skill gap analysis ────────────────────────────────────────────────
try:
    top_job     = shown[0][0]
    user_skills = {"Python", "SQL", "Machine Learning"}
    job_rows    = jobs_df[jobs_df["Job Title"] == top_job]
    req_raw     = ",".join(job_rows["Skills"].dropna().values)
    req_set     = set([s.strip() for s in req_raw.split(",") if s.strip()])
    matched     = sorted(user_skills & req_set)
    missing     = sorted(req_set - user_skills)
    assert len(req_set) > 0, "No required skills found"
    print(f"[{PASS}] Skill gap for '{top_job}':")
    print(f"       Matched ({len(matched)}): {matched[:5]}")
    print(f"       Missing ({len(missing)}): {missing[:5]}")
except Exception as e:
    errors.append(f"skill gap: {e}")
    print(f"[{FAIL}] Skill gap: {e}")

# ── Test 6: data files exist and correct columns ──────────────────────────────
try:
    sal = pd.read_csv("data/salary.csv")
    assert set(["Country", "Location", "Job Title", "Experience", "Education",
                "Company Size", "Employment Type", "Skills", "Salary", "Currency"]).issubset(sal.columns)
    jbs = pd.read_csv("data/jobs.csv")
    assert set(["Job Title", "Skills", "Experience", "Degree", "Industry", "Location"]).issubset(jbs.columns)
    print(f"[{PASS}] Data files: salary.csv={sal.shape}  jobs.csv={jbs.shape}")
except Exception as e:
    errors.append(f"data files: {e}")
    print(f"[{FAIL}] Data files: {e}")

# ── Summary ───────────────────────────────────────────────────────────────────
print()
if errors:
    print(f"RESULT: {len(errors)} test(s) FAILED:")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)
else:
    print("ALL TESTS PASSED - app.py is ready to launch!")
    print("Run: streamlit run app.py")

"""
train_models.py
Trains salary prediction models and job recommendation systems with strict zero data leakage.
Data preprocessing pipelines (StandardScaler, OneHotEncoder, TfidfVectorizer) are fitted strictly on X_train.
"""
import os
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, median_absolute_error
from sklearn.metrics.pairwise import cosine_similarity

try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

os.makedirs("models", exist_ok=True)
os.makedirs("images", exist_ok=True)

print("=" * 60)
print("Loading datasets...")

df_india = pd.read_csv("data/salary_india.csv")
df_us    = pd.read_csv("data/salary_us.csv")
jobs_df  = pd.read_csv("data/jobs.csv")

print(f"  salary_india.csv : {df_india.shape} (Target: INR)")
print(f"  salary_us.csv    : {df_us.shape} (Target: USD)")
print(f"  jobs.csv         : {jobs_df.shape}")

# ─── MODULE 1: LEAKAGE-FREE PIPELINE TRAINING ──────────────────────────────────
CATEGORICAL_COLS = ["Education", "Location", "Job Title", "Company Size", "Employment Type"]
NUMERICAL_COLS   = ["Experience"]
TEXT_COL         = "Skills"
FEATURE_COLS     = NUMERICAL_COLS + CATEGORICAL_COLS + [TEXT_COL]
TARGET_COL       = "Salary"

def build_preprocessor():
    """Builds an isolated preprocessing transformer fitted strictly on training subsets."""
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_COLS),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS),
            ("text", TfidfVectorizer(max_features=50), TEXT_COL),
        ],
        remainder="drop"
    )

def train_market_model(df, market_name, currency_symbol):
    print("\n" + "=" * 60)
    print(f"TRAINING SALARY PIPELINE: {market_name} ({currency_symbol})")
    print("=" * 60)

    # 1. SPLIT FIRST (Zero Preprocessing Leakage)
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples (unseen)")

    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree":     DecisionTreeRegressor(max_depth=10, random_state=42),
        "Random Forest":     RandomForestRegressor(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1),
    }
    if HAS_XGB:
        candidate_models["XGBoost"] = XGBRegressor(
            n_estimators=150, learning_rate=0.1, max_depth=6,
            random_state=42, verbosity=0, n_jobs=-1
        )

    results = {}
    fitted_pipelines = {}
    best_r2, best_name, best_pipeline = -np.inf, None, None

    print(f"\n{'Algorithm':<22} {'CV R² (5-fold)':>14} {'Test R²':>10} {'Test MAE':>14} {'Test RMSE':>14} {'MedAE':>14}")
    print("-" * 92)

    for name, regressor in candidate_models.items():
        preprocessor = build_preprocessor()
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", regressor)
        ])

        # 5-fold cross-validation strictly on training data
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="r2")
        cv_r2_mean = cv_scores.mean()

        # Fit strictly on X_train
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)

        mae  = mean_absolute_error(y_test, preds)
        mse  = mean_squared_error(y_test, preds)
        rmse = np.sqrt(mse)
        r2   = r2_score(y_test, preds)
        med_ae = median_absolute_error(y_test, preds)

        results[name] = {
            "CV_R2": cv_r2_mean,
            "R²": r2,
            "MAE": mae,
            "MSE": mse,
            "RMSE": rmse,
            "MedAE": med_ae,
        }
        fitted_pipelines[name] = pipe

        print(f"{name:<22} {cv_r2_mean:>14.4f} {r2:>10.4f} {currency_symbol}{mae:>13,.0f} {currency_symbol}{rmse:>13,.0f} {currency_symbol}{med_ae:>13,.0f}")

        if r2 > best_r2:
            best_r2, best_name, best_pipeline = r2, name, pipe

    print(f"\nBest Selected Model for {market_name}: {best_name} (Test R² = {best_r2:.4f})")

    bundle = {
        "pipeline":        best_pipeline,
        "best_model_name": best_name,
        "results":         results,
        "market":          market_name,
        "currency":        currency_symbol,
        "feature_cols":    FEATURE_COLS,
        "categorical_cols": CATEGORICAL_COLS,
        "numerical_cols":  NUMERICAL_COLS,
        "text_col":        TEXT_COL,
        "X_test":          X_test,
        "y_test":          y_test,
    }
    return bundle

# Train both market pipelines
bundle_india = train_market_model(df_india, "India", "Rs ")
bundle_us    = train_market_model(df_us, "United States", "$")

# Save dedicated market bundles
joblib.dump(bundle_india, "models/salary_model_india.pkl")
joblib.dump(bundle_us, "models/salary_model_us.pkl")

# Save combined backward-compatible bundle
unified_bundle = {
    "pipeline_india":  bundle_india["pipeline"],
    "pipeline_us":     bundle_us["pipeline"],
    "pipeline":        bundle_india["pipeline"],
    "best_model_name": bundle_india["best_model_name"],
    "results_india":   bundle_india["results"],
    "results_us":      bundle_us["results"],
    "results":         bundle_india["results"],
    "bundle_india":    bundle_india,
    "bundle_us":       bundle_us,
    "model":           bundle_india["pipeline"].named_steps["regressor"],
    "cat_enc":         bundle_india["pipeline"].named_steps["preprocessor"].named_transformers_["cat"],
    "num_scaler":      bundle_india["pipeline"].named_steps["preprocessor"].named_transformers_["num"],
    "skill_tfidf":     bundle_india["pipeline"].named_steps["preprocessor"].named_transformers_["text"],
    "categorical":     CATEGORICAL_COLS,
    "numeric":         NUMERICAL_COLS,
}
joblib.dump(unified_bundle, "models/salary_model.pkl")
print("\nSaved -> models/salary_model_india.pkl")
print("Saved -> models/salary_model_us.pkl")
print("Saved -> models/salary_model.pkl (Unified multi-market bundle)")

# ─── MODULE 2: JOB RECOMMENDATION ENGINE ───────────────────────────────────────
print("\n" + "=" * 60)
print("MODULE 2 -- Job Recommendation Engine")
print("=" * 60)

jobs_df["Skills"] = jobs_df["Skills"].fillna("")
rec_tfidf = TfidfVectorizer(max_features=200, ngram_range=(1, 2))
job_matrix = rec_tfidf.fit_transform(jobs_df["Skills"])

test_size = min(50, len(jobs_df) // 5)
test_idx  = np.random.choice(len(jobs_df), test_size, replace=False)
hits = 0
for idx in test_idx:
    query_vec = job_matrix[idx]
    sims = cosine_similarity(query_vec, job_matrix).flatten()
    top5 = np.argsort(sims)[::-1][1:6]
    true_title = jobs_df.iloc[idx]["Job Title"]
    if any(jobs_df.iloc[t]["Job Title"] == true_title for t in top5):
        hits += 1
prec5 = hits / test_size
print(f"  Recommender Precision@5 = {prec5:.3f} (tested on {test_size} queries)")

rec_bundle = {
    "vectorizer": rec_tfidf,
    "matrix":     job_matrix,
    "titles":     jobs_df["Job Title"].values,
    "jobs_df":    jobs_df,
    "precision5": prec5,
}
joblib.dump(rec_bundle, "models/recommender.pkl")
print("Saved -> models/recommender.pkl")

# ─── MODULE 3: EDA CHARTS GENERATION ───────────────────────────────────────────
print("\n" + "=" * 60)
print("Generating updated EDA visualizations...")
plt.style.use("seaborn-v0_8-whitegrid")

# 1 — Salary Distribution (India vs US)
fig, ax = plt.subplots(figsize=(10, 5))
ax.hist(df_india["Salary"] / 100000, bins=35, color="#6366f1", edgecolor="white", alpha=0.85)
ax.set_title("India Salary Distribution (LPA)", fontsize=14, fontweight="bold")
ax.set_xlabel("Salary in Lakhs per Annum (₹ LPA)"); ax.set_ylabel("Count")
plt.tight_layout(); plt.savefig("images/salary_distribution.png", dpi=120); plt.close()

# 2 — Salary vs Experience
fig, ax = plt.subplots(figsize=(10, 5))
ax.scatter(df_india["Experience"], df_india["Salary"] / 100000, alpha=0.35, color="#e06c75", s=18)
ax.set_title("India Salary vs. Experience", fontsize=14, fontweight="bold")
ax.set_xlabel("Years of Experience"); ax.set_ylabel("Salary in ₹ LPA")
plt.tight_layout(); plt.savefig("images/salary_vs_experience.png", dpi=120); plt.close()

# 3 — Top Job Roles
top_roles = df_india["Job Title"].value_counts().head(15)
fig, ax = plt.subplots(figsize=(12, 5))
ax.barh(top_roles.index[::-1], top_roles.values[::-1], color="#56b6c2")
ax.set_title("Top 15 Job Roles", fontsize=14, fontweight="bold")
ax.set_xlabel("Count")
plt.tight_layout(); plt.savefig("images/top_job_roles.png", dpi=120); plt.close()

# 4 — Most Common Skills
all_skills = ",".join(df_india["Skills"].dropna()).split(",")
from collections import Counter
skill_count = Counter([s.strip() for s in all_skills if s.strip()])
top_skills = pd.Series(dict(skill_count.most_common(20)))
fig, ax = plt.subplots(figsize=(12, 5))
ax.barh(top_skills.index[::-1], top_skills.values[::-1], color="#98c379")
ax.set_title("Top 20 Most Common Skills", fontsize=14, fontweight="bold")
ax.set_xlabel("Frequency")
plt.tight_layout(); plt.savefig("images/top_skills.png", dpi=120); plt.close()

# 5 — Education vs Salary
edu_order = ["High School", "Associate", "Bachelor", "Master", "PhD"]
fig, ax = plt.subplots(figsize=(10, 5))
sns.boxplot(data=df_india, x="Education", y=df_india["Salary"]/100000, order=edu_order, ax=ax, palette="Blues")
ax.set_title("Education Level vs. Salary (India)", fontsize=14, fontweight="bold")
ax.set_xlabel("Education Level"); ax.set_ylabel("Salary in ₹ LPA")
plt.tight_layout(); plt.savefig("images/education_vs_salary.png", dpi=120); plt.close()

# 6 — Correlation heatmap
num_for_corr = df_india[["Experience", "Salary"]].copy()
num_for_corr["Education_Enc"] = pd.Categorical(df_india["Education"], categories=edu_order).codes
num_for_corr["CompSize_Enc"]  = pd.Categorical(df_india["Company Size"], categories=["Startup","Small","Medium","Large","Enterprise"]).codes
corr = num_for_corr.corr()
fig, ax = plt.subplots(figsize=(7, 5))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax, square=True, linewidths=0.5)
ax.set_title("Correlation Heatmap", fontsize=14, fontweight="bold")
plt.tight_layout(); plt.savefig("images/correlation_heatmap.png", dpi=120); plt.close()

print("All charts updated in images/")
print("\n[SUCCESS] Preprocessing leakage fixed and models trained successfully!")

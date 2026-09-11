import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

df_in = pd.read_csv("data/salary_india.csv")
df_us = pd.read_csv("data/salary_us.csv")

feat_cols = ["Experience", "Education", "Location", "Job Title", "Company Size", "Employment Type", "Skills"]
cat_cols = ["Education", "Location", "Job Title", "Company Size", "Employment Type"]
num_cols = ["Experience"]
text_col = "Skills"

def train_and_save(df, market, curr, out_path):
    X = df[feat_cols]
    y = df["Salary"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
            ("text", TfidfVectorizer(max_features=50), text_col),
        ]
    )
    
    models = {
        "GradientBoosting": GradientBoostingRegressor(n_estimators=180, learning_rate=0.1, max_depth=5, random_state=42),
        "RandomForest": RandomForestRegressor(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1),
        "Ridge": Ridge(alpha=1.0)
    }
    
    best_r2, best_name, best_pipe = -1, None, None
    for name, reg in models.items():
        pipe = Pipeline([("preprocessor", preprocessor), ("regressor", reg)])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        r2 = r2_score(y_test, preds)
        mae = mean_absolute_error(y_test, preds)
        print(f"{market} - {name}: R2={r2:.4f}, MAE={curr}{mae:,.0f}")
        if r2 > best_r2:
            best_r2, best_name, best_pipe = r2, name, pipe
            
    bundle = {
        "pipeline": best_pipe,
        "best_model_name": best_name,
        "market": market,
        "currency": curr,
        "feature_cols": feat_cols,
        "categorical_cols": cat_cols,
        "numerical_cols": num_cols,
        "text_col": text_col
    }
    joblib.dump(bundle, out_path)
    print(f"Saved {market} model ({best_name}, R2={best_r2:.4f}) to {out_path}\n")

train_and_save(df_in, "India", "Rs ", "models/salary_model_india.pkl")
train_and_save(df_us, "United States", "$", "models/salary_model_us.pkl")
print("SUCCESSFULLY RETRAINED WITH PURE SCIKIT-LEARN!")

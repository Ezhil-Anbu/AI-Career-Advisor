# AI Career Advisor 🎯

An **ML-powered Career Intelligence Platform** built with Python and Streamlit. It predicts your expected salary, recommends suitable job roles, analyses skill gaps, and provides a personalised learning roadmap — all in one interactive web app.

---

## 📁 Project Structure

```
AI-Career-Advisor/
├── data/
│   ├── salary.csv          # Synthetic salary dataset (1500 rows)
│   └── jobs.csv            # Synthetic job-role dataset (~1000 rows)
├── notebooks/
│   ├── eda.ipynb           # Exploratory Data Analysis
│   ├── salary_model.ipynb  # Salary regression training & evaluation
│   └── recommendation.ipynb# Job recommender training & evaluation
├── models/
│   ├── salary_model.pkl    # Best salary regression model (Random Forest)
│   └── recommender.pkl     # TF-IDF + Cosine Similarity recommender
├── images/                 # EDA charts saved here
├── app.py                  # Streamlit web application
├── generate_data.py        # Synthetic data generator script
├── train_models.py         # Model training + EDA chart script
├── requirements.txt        # Python dependencies (pinned)
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & install dependencies
```bash
git clone <your-repo-url>
cd AI-Career-Advisor
pip install -r requirements.txt
```

### 2. Generate synthetic datasets
```bash
python generate_data.py
```
This creates `data/salary.csv` and `data/jobs.csv`.

### 3. Train models & generate EDA charts
```bash
python train_models.py
```
This trains all models, evaluates them, saves them to `models/`, and saves charts to `images/`.

### 4. Launch the Streamlit app
```bash
streamlit run app.py
```
Open `http://localhost:8501` in your browser.

---

## 📓 Running the Notebooks

Start Jupyter:
```bash
jupyter notebook
```
Run in this order:
1. `notebooks/eda.ipynb` — EDA and visualisations
2. `notebooks/salary_model.ipynb` — Salary model training
3. `notebooks/recommendation.ipynb` — Recommender training

Each notebook runs top-to-bottom without errors and regenerates the saved model artifacts.

---

## 📊 Model Performance Summary

### Module 1 — Salary Prediction (Regression)

| Model | MAE (USD) | RMSE (USD) | R² |
|---|---|---|---|
| Linear Regression | ~$14,000 | ~$18,000 | ~0.75 |
| Decision Tree | ~$10,000 | ~$14,000 | ~0.88 |
| **Random Forest** ✅ | **~$7,000** | **~$10,000** | **~0.95** |
| XGBoost | ~$8,000 | ~$11,000 | ~0.94 |

> **Selected model**: Random Forest Regressor (best R²). Saved as `models/salary_model.pkl`.

### Module 2 — Job Recommendation

| Metric | Value |
|---|---|
| Algorithm | TF-IDF Vectorizer + Cosine Similarity |
| Vocabulary | 200 n-grams (unigrams + bigrams) |
| Precision@5 | ~0.90+ |

> Saved as `models/recommender.pkl`.

---

## 🧩 Modules

| Module | Description |
|---|---|
| **Salary Prediction** | Random Forest regression on experience, education, location, skills. Returns annual salary + ±15% range. |
| **Job Recommendation** | TF-IDF skill vectorisation + cosine similarity. Returns Top-N jobs with match percentages (0–99%). |
| **Skill Gap Analysis** | Set difference between user skills and required skills for the top recommended job. |
| **Learning Roadmap** | Curated resource map for each missing skill (official docs, Coursera, YouTube, free books). |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| ML | Scikit-learn, XGBoost |
| NLP | TF-IDF Vectorizer (Scikit-learn) |
| Data | Pandas, NumPy |
| Visualisation | Matplotlib, Seaborn |
| Model Persistence | Joblib |
| Web App | Streamlit |
| Notebooks | Jupyter, nbformat |

---

## 📝 Notes

- All data is **synthetic** and generated with realistic distributions (salary correlated with experience/education, skills clustered by job role).
- The app gracefully handles missing/invalid inputs with warnings.
- Session state is used to pass top recommended job to the Skill Gap page automatically.

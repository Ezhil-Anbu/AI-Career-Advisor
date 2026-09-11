"""
generate_data.py
Creates realistic multi-market synthetic datasets for India (INR) and United States (USD).
Outputs:
  - data/salary_india.csv (5,000 rows, INR)
  - data/salary_us.csv    (5,000 rows, USD)
  - data/salary.csv       (10,000 combined rows with Country & Currency metadata)
  - data/jobs.csv         (Job roles, skills, experience, locations)
"""
import os
import numpy as np
import pandas as pd

np.random.seed(42)
os.makedirs("data", exist_ok=True)

# ─── 1. Shared Vocabulary & Role Skills ─────────────────────────────────────────
ROLE_SKILLS = {
    "Data Scientist":          ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistics", "Pandas", "NumPy", "Scikit-learn", "Deep Learning", "Data Visualization"],
    "Data Analyst":            ["SQL", "Excel", "Python", "Power BI", "Tableau", "Statistics", "Data Visualization", "Pandas", "R"],
    "Machine Learning Engineer":["Python", "Machine Learning", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "Scikit-learn", "Deep Learning", "MLflow", "AWS"],
    "Software Engineer":       ["Python", "Java", "SQL", "Git", "REST API", "Docker", "Agile", "JavaScript", "System Design", "Linux"],
    "Backend Developer":       ["Python", "Java", "SQL", "REST API", "Docker", "Kubernetes", "PostgreSQL", "Redis", "Microservices", "Git"],
    "Frontend Developer":      ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Git", "REST API", "Redux", "Node.js", "Webpack"],
    "Full Stack Developer":    ["JavaScript", "React", "Python", "SQL", "Docker", "Git", "Node.js", "REST API", "MongoDB", "TypeScript"],
    "DevOps Engineer":         ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Jenkins", "Git", "Python", "Ansible"],
    "Cloud Architect":         ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Networking", "Security", "Linux", "Python"],
    "Cybersecurity Analyst":   ["Network Security", "Python", "Linux", "Penetration Testing", "SIEM", "Firewalls", "Encryption", "Risk Analysis", "Compliance", "Incident Response"],
    "Business Analyst":        ["SQL", "Excel", "Power BI", "Tableau", "Requirements Gathering", "Agile", "Stakeholder Management", "Data Visualization", "Process Mapping", "Jira"],
    "Product Manager":         ["Product Strategy", "Agile", "Jira", "Stakeholder Management", "Data Analysis", "Roadmapping", "A/B Testing", "SQL", "Communication", "UX Research"],
    "UX Designer":             ["Figma", "UX Research", "Wireframing", "Prototyping", "User Testing", "Adobe XD", "Sketch", "HTML", "CSS", "Communication"],
    "Data Engineer":           ["Python", "SQL", "Spark", "Hadoop", "Kafka", "Airflow", "AWS", "ETL", "PostgreSQL", "Scala"],
    "NLP Engineer":            ["Python", "NLP", "TensorFlow", "PyTorch", "Transformers", "BERT", "Scikit-learn", "Machine Learning", "Deep Learning", "Hugging Face"],
    "Computer Vision Engineer":["Python", "OpenCV", "TensorFlow", "PyTorch", "Deep Learning", "YOLO", "Scikit-learn", "Image Processing", "Machine Learning", "NumPy"],
    "Research Scientist":      ["Python", "Statistics", "Machine Learning", "Deep Learning", "TensorFlow", "Research", "Publication", "NumPy", "Scikit-learn", "PyTorch"],
    "Blockchain Developer":    ["Solidity", "Ethereum", "JavaScript", "Python", "Smart Contracts", "Web3.js", "Docker", "Git", "Cryptography", "Node.js"],
    "Database Administrator":  ["SQL", "PostgreSQL", "MySQL", "Oracle", "Performance Tuning", "Backup Recovery", "Linux", "Python", "MongoDB", "Security"],
    "AI Engineer":             ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Docker", "AWS", "MLflow"],
    "Mobile Developer":        ["Swift", "Kotlin", "React Native", "Flutter", "Java", "REST API", "Git", "Firebase", "Android", "iOS"],
    "QA Engineer":             ["Selenium", "Python", "Java", "Test Automation", "Manual Testing", "Jira", "Git", "REST API", "JUnit", "Agile"],
    "IT Manager":              ["Project Management", "ITIL", "Budgeting", "Communication", "Vendor Management", "Risk Management", "Agile", "SQL", "Cloud", "Leadership"],
    "Network Engineer":        ["Networking", "Cisco", "Linux", "Security", "Routing", "Switching", "Firewall", "VPN", "TCP/IP", "Python"],
    "Systems Analyst":         ["SQL", "Python", "System Design", "Requirements Gathering", "UML", "Process Mapping", "Agile", "Communication", "Excel", "Documentation"],
    "Scrum Master":            ["Agile", "Scrum", "Jira", "Communication", "Facilitation", "Coaching", "Risk Management", "Stakeholder Management", "Kanban", "Leadership"],
    "Data Architect":          ["SQL", "Python", "Data Modeling", "ETL", "AWS", "Azure", "Spark", "PostgreSQL", "Kafka", "Architecture"],
    "Solutions Architect":     ["AWS", "Azure", "System Design", "Docker", "Kubernetes", "REST API", "Python", "Networking", "Security", "Microservices"],
    "Prompt Engineer":         ["Python", "NLP", "Machine Learning", "ChatGPT", "LangChain", "Transformers", "API Integration", "Prompt Design", "Communication", "Research"],
    "MLOps Engineer":          ["Python", "Docker", "Kubernetes", "MLflow", "Airflow", "AWS", "CI/CD", "Machine Learning", "Git", "Monitoring"],
}

ROLES = list(ROLE_SKILLS.keys())

INDUSTRY_MAP = {
    "Data Scientist": "Technology", "Data Analyst": "Finance",
    "Machine Learning Engineer": "Technology", "Software Engineer": "Technology",
    "Backend Developer": "Technology", "Frontend Developer": "Technology",
    "Full Stack Developer": "Technology", "DevOps Engineer": "Technology",
    "Cloud Architect": "Technology", "Cybersecurity Analyst": "Security",
    "Business Analyst": "Consulting", "Product Manager": "Technology",
    "UX Designer": "Design", "Data Engineer": "Technology",
    "NLP Engineer": "Technology", "Computer Vision Engineer": "Technology",
    "Research Scientist": "Research", "Blockchain Developer": "Finance",
    "Database Administrator": "Technology", "AI Engineer": "Technology",
    "Mobile Developer": "Technology", "QA Engineer": "Technology",
    "IT Manager": "IT Services", "Network Engineer": "Telecommunications",
    "Systems Analyst": "IT Services", "Scrum Master": "Consulting",
    "Data Architect": "Technology", "Solutions Architect": "Technology",
    "Prompt Engineer": "Technology", "MLOps Engineer": "Technology",
}

DEGREE_MAP = {
    "Data Scientist": "Master", "Data Analyst": "Bachelor",
    "Machine Learning Engineer": "Master", "Software Engineer": "Bachelor",
    "Backend Developer": "Bachelor", "Frontend Developer": "Bachelor",
    "Full Stack Developer": "Bachelor", "DevOps Engineer": "Bachelor",
    "Cloud Architect": "Master", "Cybersecurity Analyst": "Bachelor",
    "Business Analyst": "Bachelor", "Product Manager": "Master",
    "UX Designer": "Bachelor", "Data Engineer": "Bachelor",
    "NLP Engineer": "Master", "Computer Vision Engineer": "Master",
    "Research Scientist": "PhD", "Blockchain Developer": "Bachelor",
    "Database Administrator": "Bachelor", "AI Engineer": "Master",
    "Mobile Developer": "Bachelor", "QA Engineer": "Bachelor",
    "IT Manager": "Master", "Network Engineer": "Bachelor",
    "Systems Analyst": "Bachelor", "Scrum Master": "Bachelor",
    "Data Architect": "Master", "Solutions Architect": "Master",
    "Prompt Engineer": "Bachelor", "MLOps Engineer": "Master",
}

EDUCATION  = ["High School", "Associate", "Bachelor", "Master", "PhD"]
EDU_WEIGHT = [0.03, 0.07, 0.55, 0.28, 0.07]
COMP_SIZE  = ["Startup", "Small", "Medium", "Large", "Enterprise"]
EMP_TYPE   = ["Full-time", "Contract", "Part-time", "Internship"]
EMP_WEIGHT = [0.72, 0.13, 0.08, 0.07]

# ─── 2. Market-Specific Configurations ────────────────────────────────────────
LOCATIONS_INDIA = ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi",
                   "Gurgaon", "Noida", "Chennai", "Coimbatore", "Kolkata"]
LOC_MULT_INDIA = {
    "Bangalore": 1.22, "Gurgaon": 1.18, "Mumbai": 1.18, "Hyderabad": 1.14,
    "Delhi": 1.12, "Pune": 1.08, "Noida": 1.08, "Chennai": 1.04,
    "Kolkata": 0.88, "Coimbatore": 0.85
}

BASE_SALARY_INDIA = {
    "Data Scientist": 850000, "Data Analyst": 520000,
    "Machine Learning Engineer": 920000, "Software Engineer": 720000,
    "Backend Developer": 700000, "Frontend Developer": 620000,
    "Full Stack Developer": 720000, "DevOps Engineer": 820000,
    "Cloud Architect": 1150000, "Cybersecurity Analyst": 750000,
    "Business Analyst": 600000, "Product Manager": 950000,
    "UX Designer": 580000, "Data Engineer": 850000,
    "NLP Engineer": 920000, "Computer Vision Engineer": 920000,
    "Research Scientist": 980000, "Blockchain Developer": 880000,
    "Database Administrator": 650000, "AI Engineer": 950000,
    "Mobile Developer": 680000, "QA Engineer": 520000,
    "IT Manager": 820000, "Network Engineer": 580000,
    "Systems Analyst": 600000, "Scrum Master": 750000,
    "Data Architect": 1150000, "Solutions Architect": 1250000,
    "Prompt Engineer": 720000, "MLOps Engineer": 920000,
}

EDU_BONUS_INDIA = {"High School": -80000, "Associate": -40000, "Bachelor": 0, "Master": 120000, "PhD": 250000}
SIZE_BONUS_INDIA = {"Startup": -50000, "Small": -25000, "Medium": 0, "Large": 75000, "Enterprise": 160000}

LOCATIONS_US = ["San Francisco", "New York", "Seattle", "Austin", "Boston",
                "Los Angeles", "Chicago", "Denver", "Atlanta", "Remote"]
LOC_MULT_US = {
    "San Francisco": 1.40, "New York": 1.30, "Seattle": 1.25, "Boston": 1.18,
    "Los Angeles": 1.18, "Austin": 1.08, "Chicago": 1.08, "Denver": 1.04,
    "Remote": 1.05, "Atlanta": 0.98
}

BASE_SALARY_US = {
    "Data Scientist": 110000, "Data Analyst": 75000,
    "Machine Learning Engineer": 130000, "Software Engineer": 105000,
    "Backend Developer": 100000, "Frontend Developer": 90000,
    "Full Stack Developer": 100000, "DevOps Engineer": 115000,
    "Cloud Architect": 140000, "Cybersecurity Analyst": 105000,
    "Business Analyst": 80000, "Product Manager": 120000,
    "UX Designer": 85000, "Data Engineer": 115000,
    "NLP Engineer": 125000, "Computer Vision Engineer": 125000,
    "Research Scientist": 135000, "Blockchain Developer": 120000,
    "Database Administrator": 95000, "AI Engineer": 130000,
    "Mobile Developer": 100000, "QA Engineer": 80000,
    "IT Manager": 110000, "Network Engineer": 90000,
    "Systems Analyst": 85000, "Scrum Master": 95000,
    "Data Architect": 130000, "Solutions Architect": 145000,
    "Prompt Engineer": 100000, "MLOps Engineer": 125000,
}

EDU_BONUS_US = {"High School": -15000, "Associate": -8000, "Bachelor": 0, "Master": 14000, "PhD": 28000}
SIZE_BONUS_US = {"Startup": -8000, "Small": -4000, "Medium": 0, "Large": 9000, "Enterprise": 18000}

# ─── 3. Skill Sampler ─────────────────────────────────────────────────────────
def sample_skills(role, n_skills=5):
    pool = ROLE_SKILLS[role]
    k = np.random.randint(max(3, n_skills - 2), min(len(pool), n_skills + 3) + 1)
    return ",".join(np.random.choice(pool, min(k, len(pool)), replace=False))

# ─── 4. Generator Helper ──────────────────────────────────────────────────────
def generate_market_data(country, n_samples=5000):
    is_india = (country == "India")
    locations_pool = LOCATIONS_INDIA if is_india else LOCATIONS_US
    loc_mult_map   = LOC_MULT_INDIA if is_india else LOC_MULT_US
    base_sal_map   = BASE_SALARY_INDIA if is_india else BASE_SALARY_US
    edu_bonus_map  = EDU_BONUS_INDIA if is_india else EDU_BONUS_US
    size_bonus_map = SIZE_BONUS_INDIA if is_india else SIZE_BONUS_US
    currency       = "INR" if is_india else "USD"

    roles        = np.random.choice(ROLES, n_samples)
    experience   = np.clip(np.random.exponential(4.5, n_samples), 0, 30).astype(int)
    education    = np.random.choice(EDUCATION, n_samples, p=EDU_WEIGHT)
    locations    = np.random.choice(locations_pool, n_samples)
    comp_sizes   = np.random.choice(COMP_SIZE, n_samples)
    emp_types    = np.random.choice(EMP_TYPE, n_samples, p=EMP_WEIGHT)
    skills_col   = [sample_skills(r) for r in roles]

    salaries = []
    for i in range(n_samples):
        r = roles[i]
        exp = experience[i]
        edu = education[i]
        loc = locations[i]
        size = comp_sizes[i]
        etype = emp_types[i]

        base = base_sal_map[r]
        # Realistic experience scaling curve (sub-linear power law growth)
        if is_india:
            exp_growth = (exp ** 0.85) * 175000
            sal = (base + exp_growth + edu_bonus_map[edu] + size_bonus_map[size]) * loc_mult_map[loc]
            
            # Employment type adjustment
            if etype == "Internship":
                sal = min(sal * 0.40, 500000)
            elif etype == "Part-time":
                sal *= 0.60
            elif etype == "Contract":
                sal *= 1.10
            
            # Skill bonus variance
            s_count = len(skills_col[i].split(","))
            sal *= (1.0 + (s_count - 4) * 0.015)
            sal += np.random.normal(0, 45000)
            sal = max(250000, round(sal, -3))
        else:
            exp_growth = (exp ** 0.86) * 11500
            sal = (base + exp_growth + edu_bonus_map[edu] + size_bonus_map[size]) * loc_mult_map[loc]
            
            if etype == "Internship":
                sal = min(sal * 0.45, 55000)
            elif etype == "Part-time":
                sal *= 0.60
            elif etype == "Contract":
                sal *= 1.10
            
            s_count = len(skills_col[i].split(","))
            sal *= (1.0 + (s_count - 4) * 0.012)
            sal += np.random.normal(0, 6500)
            sal = max(30000, round(sal, -2))

        salaries.append(sal)

    df = pd.DataFrame({
        "Country":          country,
        "Location":         locations,
        "Job Title":        roles,
        "Experience":       experience,
        "Education":        education,
        "Company Size":     comp_sizes,
        "Employment Type":  emp_types,
        "Skills":           skills_col,
        "Salary":           salaries,
        "Currency":         currency,
    })
    return df

# ─── 5. Generate & Save Datasets ──────────────────────────────────────────────
print("=" * 60)
print("Generating multi-market datasets...")

df_india = generate_market_data("India", n_samples=5000)
df_us    = generate_market_data("United States", n_samples=5000)
df_all   = pd.concat([df_india, df_us], ignore_index=True)

df_india.to_csv("data/salary_india.csv", index=False)
df_us.to_csv("data/salary_us.csv", index=False)
df_all.to_csv("data/salary.csv", index=False)

print("Saved -> data/salary_india.csv (5,000 rows, INR)")
print("Saved -> data/salary_us.csv    (5,000 rows, USD)")
print("Saved -> data/salary.csv       (10,000 rows combined)")

# ─── 6. Generate jobs.csv (Recommender dataset with IN & US locations) ─────────
all_locs = LOCATIONS_INDIA + LOCATIONS_US
job_rows = []
for role in ROLES:
    skill_pool = ROLE_SKILLS[role]
    industry   = INDUSTRY_MAP[role]
    degree     = DEGREE_MAP[role]
    n_rows = np.random.randint(45, 75)
    for _ in range(n_rows):
        exp_min = np.random.randint(0, 7)
        loc = np.random.choice(all_locs)
        k = np.random.randint(5, len(skill_pool) + 1)
        s = ",".join(np.random.choice(skill_pool, k, replace=False))
        job_rows.append({
            "Job Title":  role,
            "Skills":     s,
            "Experience": exp_min,
            "Degree":     degree,
            "Industry":   industry,
            "Location":   loc,
        })

jobs_df = pd.DataFrame(job_rows)
jobs_df.to_csv("data/jobs.csv", index=False)
print(f"Saved -> data/jobs.csv ({jobs_df.shape[0]} rows)")

# ─── 7. Validation & Statistics Printout ───────────────────────────────────────
print("\n" + "=" * 60)
print("DATASET VALIDATION & SUMMARY STATISTICS")
print("=" * 60)
print(f"Total Rows Generated : {len(df_all)}")
print(f"Columns              : {df_all.columns.tolist()}")
print(f"Countries            : {df_all['Country'].unique().tolist()}")
print(f"Job Titles Count     : {df_all['Job Title'].nunique()}")

print("\n--- INDIA (INR) STATISTICS ---")
sal_in = df_india["Salary"]
print(f"Count   : {len(sal_in):,}")
print(f"Min     : Rs {sal_in.min():,.0f}")
print(f"25th %  : Rs {sal_in.quantile(0.25):,.0f}")
print(f"Median  : Rs {sal_in.median():,.0f}")
print(f"Mean    : Rs {sal_in.mean():,.0f}")
print(f"75th %  : Rs {sal_in.quantile(0.75):,.0f}")
print(f"Max     : Rs {sal_in.max():,.0f}")

print("\n--- UNITED STATES (USD) STATISTICS ---")
sal_us = df_us["Salary"]
print(f"Count   : {len(sal_us):,}")
print(f"Min     : ${sal_us.min():,.0f}")
print(f"25th %  : ${sal_us.quantile(0.25):,.0f}")
print(f"Median  : ${sal_us.median():,.0f}")
print(f"Mean    : ${sal_us.mean():,.0f}")
print(f"75th %  : ${sal_us.quantile(0.75):,.0f}")
print(f"Max     : ${sal_us.max():,.0f}")

print("\n--- SALARY BY EXPERIENCE (INDIA, INR) ---")
exp_in = df_india[df_india["Employment Type"] == "Full-time"].groupby("Experience")["Salary"].agg(["count", "median", "mean"])
print(exp_in.loc[[0, 2, 5, 10, 15, 20]].apply(lambda row: row.apply(lambda x: f"Rs {x:,.0f}" if x > 100 else f"{int(x)}"), axis=1))

print("\n--- SALARY BY EXPERIENCE (US, USD) ---")
exp_us = df_us[df_us["Employment Type"] == "Full-time"].groupby("Experience")["Salary"].agg(["count", "median", "mean"])
print(exp_us.loc[[0, 2, 5, 10, 15, 20]].apply(lambda row: row.apply(lambda x: f"${x:,.0f}" if x > 100 else f"{int(x)}"), axis=1))

print("\n--- SALARY BY INDIAN LOCATION (INR) ---")
loc_in = df_india.groupby("Location")["Salary"].agg(["median", "mean", "min", "max"])
print(loc_in.apply(lambda row: row.apply(lambda x: f"Rs {x:,.0f}"), axis=1))

print("\n--- SALARY RANGES BY SELECTED JOB TITLES (INDIA, INR) ---")
sample_roles = ["AI Engineer", "Software Engineer", "Data Scientist", "Data Analyst", "Solutions Architect", "QA Engineer"]
role_in = df_india[df_india["Job Title"].isin(sample_roles)].groupby("Job Title")["Salary"].agg(["median", "mean", "min", "max"])
print(role_in.apply(lambda row: row.apply(lambda x: f"Rs {x:,.0f}"), axis=1))

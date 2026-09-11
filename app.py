"""
app.py — CAREER AI® Pro: Enterprise Career Intelligence Platform
Glassmorphism Edition — Frosted Ambient Glass with Polished Iconographic Interactive Sidebar
"""
import os
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
from collections import Counter
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from sklearn.metrics.pairwise import cosine_similarity

# ─── 1. Page Configuration ───────────────────────────────────────────────────
st.set_page_config(
    page_title="CAREER AI® | Glassmorphism Career Intelligence",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── 2. Glassmorphism Design System CSS ───────────────────────────────────────
st.html("""
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
  
  :root {
    --bg-base: #07090e;
    --glass-fill: rgba(255, 255, 255, 0.065);
    --glass-fill-hover: rgba(255, 255, 255, 0.095);
    --glass-fill-card: rgba(255, 255, 255, 0.055);
    --glass-border: rgba(255, 255, 255, 0.13);
    --glass-border-focus: rgba(255, 107, 107, 0.55);
    --glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.12);
    --glass-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    --text-primary: #f4f2ee;
    --text-secondary: rgba(244, 242, 238, 0.68);
    --text-muted: rgba(244, 242, 238, 0.42);
    --accent-gradient: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #f97316 100%);
    --accent-glow: 0 8px 25px rgba(249, 115, 22, 0.35);
    --accent-coral: #ff6b6b;
    --accent-orange: #f97316;
    --success: #10b981;
    --danger: #f43f5e;
  }

  /* Global Reset & Base */
  html, body, [data-testid="stAppViewContainer"], [data-testid="stHeader"] {
    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif !important;
    background-color: var(--bg-base) !important;
    color: var(--text-primary) !important;
  }

  /* Ambient Multi-Color Light Blobs (Coral/Orange, Purple, Teal) */
  body::before {
    content: '';
    position: fixed;
    top: -12%;
    left: 8%;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(255, 107, 107, 0.18) 0%, rgba(249, 115, 22, 0.08) 45%, transparent 70%);
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: '';
    position: fixed;
    top: 35%;
    right: 4%;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.17) 0%, rgba(139, 92, 246, 0.08) 45%, transparent 70%);
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  [data-testid="stAppViewContainer"]::before {
    content: '';
    position: fixed;
    bottom: -8%;
    left: 22%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, rgba(6, 182, 212, 0.06) 45%, transparent 70%);
    filter: blur(95px);
    pointer-events: none;
    z-index: 0;
  }
  
  [data-testid="stHeader"] {
    background-color: rgba(7, 9, 14, 0.65) !important;
    backdrop-filter: blur(24px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
    border-bottom: 1px solid var(--glass-border) !important;
  }

  .main .block-container {
    max-width: 1320px !important;
    padding-top: 1.8rem !important;
    padding-bottom: 5rem !important;
    padding-left: 2rem !important;
    padding-right: 2rem !important;
    position: relative;
    z-index: 1;
  }

  /* Frosted Glass Sidebar */
  [data-testid="stSidebar"] {
    background-color: rgba(10, 14, 22, 0.65) !important;
    backdrop-filter: blur(28px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(160%) !important;
    border-right: 1px solid var(--glass-border) !important;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.3) !important;
  }

  /* Interactive Glass Navigation Items */
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 11px 14px;
    margin-bottom: 3px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: rgba(244, 242, 238, 0.65);
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #ffffff;
    transform: translateX(2px);
  }
  .nav-btn:hover .nav-icon {
    color: #ffffff;
  }
  .nav-btn:active {
    transform: scale(0.98);
  }
  .nav-btn.active {
    background: linear-gradient(90deg, rgba(255, 107, 107, 0.16) 0%, rgba(249, 115, 22, 0.06) 100%);
    border: 1px solid rgba(255, 107, 107, 0.38);
    border-left: 4px solid #ff8e53;
    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-weight: 600;
  }
  .nav-btn.active .nav-icon {
    color: #ff8e53;
    text-shadow: 0 0 12px rgba(255, 142, 83, 0.6);
  }
  .nav-icon {
    width: 22px;
    font-size: 1rem;
    color: rgba(244, 242, 238, 0.45);
    margin-right: 10px;
    transition: all 0.2s ease;
  }
  .nav-badge-pill {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(244, 242, 238, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }
  .nav-btn.active .nav-badge-pill {
    background: var(--accent-gradient);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
  }

  /* Radio Overrides to match Custom Nav */
  div[data-testid="stRadio"] > div {
    gap: 3px !important;
    display: flex !important;
    flex-direction: column !important;
  }
  div[data-testid="stRadio"] label {
    background: transparent !important;
    border: 1px solid transparent !important;
    border-radius: 10px !important;
    padding: 10px 14px !important;
    margin: 0 !important;
    color: rgba(244, 242, 238, 0.65) !important;
    font-size: 0.92rem !important;
    font-weight: 500 !important;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
  }
  div[data-testid="stRadio"] label:hover {
    background: rgba(255, 255, 255, 0.07) !important;
    color: #ffffff !important;
    transform: translateX(2px) !important;
  }
  div[data-testid="stRadio"] label:active {
    transform: scale(0.98) !important;
  }
  div[data-testid="stRadio"] label > div:first-child {
    display: none !important;
  }
  div[data-testid="stRadio"] label:has(input:checked) {
    background: linear-gradient(90deg, rgba(255, 107, 107, 0.16) 0%, rgba(249, 115, 22, 0.06) 100%) !important;
    border: 1px solid rgba(255, 107, 107, 0.38) !important;
    border-left: 4px solid #ff8e53 !important;
    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    font-weight: 600 !important;
  }

  /* Secondary Sidebar Info Cards */
  .sidebar-info-card {
    background: rgba(255, 255, 255, 0.045);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 1rem;
    box-shadow: var(--glass-highlight);
    transition: all 0.2s ease;
  }
  .sidebar-info-card:hover {
    background: rgba(255, 255, 255, 0.075);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .sidebar-info-card .info-icon {
    font-size: 0.95rem;
    color: rgba(244, 242, 238, 0.5);
    transition: all 0.2s ease;
  }
  .sidebar-info-card:hover .info-icon {
    color: #ff8e53;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary) !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
  }
  p, label, span, div {
    color: var(--text-secondary);
  }

  /* Hero Frosted Glass Banner */
  .glass-hero {
    background: var(--glass-fill);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-radius: 22px;
    padding: 3rem 2.8rem;
    margin-bottom: 2rem;
    box-shadow: var(--glass-highlight), var(--glass-shadow);
    position: relative;
    overflow: hidden;
  }
  .glass-hero::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  }
  .hero-title-glass {
    font-size: 2.85rem;
    font-weight: 800;
    line-height: 1.15;
    background: linear-gradient(135deg, #ffffff 40%, #ff8e53 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.8rem;
  }

  /* Glass Cards */
  .glass-card {
    background: var(--glass-fill-card);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-radius: 18px;
    padding: 1.6rem;
    margin-bottom: 1.25rem;
    box-shadow: var(--glass-highlight), 0 12px 35px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .glass-card:hover {
    background: var(--glass-fill-hover);
    border-color: rgba(255, 107, 107, 0.35);
    box-shadow: var(--glass-highlight), 0 16px 40px rgba(255, 107, 107, 0.12);
    transform: translateY(-2px);
  }

  /* KPI Box */
  .glass-kpi {
    background: var(--glass-fill);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-radius: 18px;
    padding: 1.5rem 1.2rem;
    text-align: center;
    box-shadow: var(--glass-highlight), 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  .glass-kpi-value {
    font-size: 2.15rem;
    font-weight: 800;
    color: #ffffff;
    background: linear-gradient(135deg, #ffffff 30%, #ff8e53 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .glass-kpi-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 0.35rem;
  }

  /* Badges & Tags */
  .badge-coral {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 700;
    background: rgba(255, 107, 107, 0.15);
    color: #ff8e53;
    border: 1px solid rgba(255, 107, 107, 0.35);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
  }
  .tag-matched-glass {
    display: inline-block;
    background: rgba(16, 185, 129, 0.12);
    backdrop-filter: blur(12px);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 20px;
    padding: 0.35rem 0.9rem;
    margin: 0.25rem;
    font-size: 0.82rem;
    font-weight: 600;
  }
  .tag-missing-glass {
    display: inline-block;
    background: rgba(244, 63, 94, 0.12);
    backdrop-filter: blur(12px);
    color: #fb7185;
    border: 1px solid rgba(244, 63, 94, 0.3);
    border-radius: 20px;
    padding: 0.35rem 0.9rem;
    margin: 0.25rem;
    font-size: 0.82rem;
    font-weight: 600;
  }
  .badge-sub-glass {
    display: inline-block;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    color: rgba(244, 242, 238, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 0.25rem 0.65rem;
    border-radius: 8px;
    font-size: 0.76rem;
    font-weight: 600;
    margin-right: 0.35rem;
    margin-bottom: 0.35rem;
  }

  /* Translucent Inputs with Blur */
  .stTextInput input, div[data-baseweb="select"] > div, .stNumberInput input {
    background: rgba(255, 255, 255, 0.055) !important;
    backdrop-filter: blur(18px) saturate(150%) !important;
    -webkit-backdrop-filter: blur(18px) saturate(150%) !important;
    border: 1px solid var(--glass-border) !important;
    color: #ffffff !important;
    border-radius: 12px !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  }
  .stTextInput input:focus, div[data-baseweb="select"]:focus-within {
    border-color: var(--accent-coral) !important;
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.25) !important;
  }

  /* Multiselect Tags */
  span[data-baseweb="tag"] {
    background: rgba(255, 107, 107, 0.18) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 107, 107, 0.35) !important;
    border-radius: 8px !important;
    color: #ffffff !important;
  }

  /* Warm Coral-to-Orange Gradient CTA Button with Glow */
  .stButton > button, div.stFormSubmitButton > button {
    background: var(--accent-gradient) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 99px !important;
    padding: 0.75rem 2rem !important;
    font-weight: 700 !important;
    font-size: 0.95rem !important;
    box-shadow: var(--accent-glow) !important;
    transition: all 0.25s ease !important;
    width: 100% !important;
  }
  .stButton > button:hover, div.stFormSubmitButton > button:hover {
    transform: translateY(-2px) !important;
    filter: brightness(1.12) !important;
    box-shadow: 0 12px 35px rgba(249, 115, 22, 0.5) !important;
  }

  /* Timeline Card */
  .timeline-glass {
    position: relative;
    padding: 1.5rem;
    background: var(--glass-fill-card);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    margin-bottom: 1.2rem;
    box-shadow: var(--glass-highlight);
  }

  /* Footer */
  .glass-footer {
    border-top: 1px solid var(--glass-border);
    margin-top: 5rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
  }
</style>
""")

# ─── 3. Multi-Factor Recommender Constants & Weights ──────────────────────────
MATCH_WEIGHTS = {
    "skill": 0.50,
    "role": 0.20,
    "experience": 0.15,
    "education": 0.10,
    "location": 0.05
}

SKILL_SYNONYMS = {
    "ml": "machine learning", "machine learning": "machine learning",
    "deep learning": "deep learning", "dl": "deep learning",
    "ai": "artificial intelligence", "nlp": "nlp",
    "natural language processing": "nlp", "cv": "computer vision",
    "computer vision": "computer vision", "js": "javascript",
    "javascript": "javascript", "ts": "typescript",
    "typescript": "typescript", "py": "python", "python": "python",
    "aws": "aws", "amazon web services": "aws", "gcp": "gcp",
    "google cloud": "gcp", "azure": "azure", "k8s": "kubernetes",
    "kubernetes": "kubernetes", "docker": "docker",
    "postgres": "postgresql", "postgresql": "postgresql",
    "tf": "tensorflow", "tensorflow": "tensorflow",
    "pytorch": "pytorch", "torch": "pytorch",
    "scikit": "scikit-learn", "scikit-learn": "scikit-learn", "sklearn": "scikit-learn",
    "bi": "power bi", "power bi": "power bi", "powerbi": "power bi",
    "sql": "sql", "stats": "statistics", "statistics": "statistics",
    "git": "git", "github": "git", "rest": "rest api", "rest api": "rest api"
}

DEGREE_HIERARCHY = {
    "High School": 1,
    "Associate": 2,
    "Bachelor": 3,
    "Master": 4,
    "PhD": 5
}

ROLE_SIMILARITY_MAP = {
    ("AI Engineer", "Machine Learning Engineer"): 0.90,
    ("AI Engineer", "Data Scientist"): 0.82,
    ("AI Engineer", "NLP Engineer"): 0.85,
    ("AI Engineer", "Computer Vision Engineer"): 0.85,
    ("AI Engineer", "Research Scientist"): 0.78,
    ("AI Engineer", "Data Engineer"): 0.65,
    ("AI Engineer", "MLOps Engineer"): 0.80,
    ("AI Engineer", "Software Engineer"): 0.60,
    ("Software Engineer", "Backend Developer"): 0.92,
    ("Software Engineer", "Full Stack Developer"): 0.88,
    ("Software Engineer", "Frontend Developer"): 0.78,
    ("Software Engineer", "DevOps Engineer"): 0.70,
    ("Software Engineer", "Mobile Developer"): 0.80,
    ("Data Scientist", "Machine Learning Engineer"): 0.88,
    ("Data Scientist", "Data Analyst"): 0.80,
    ("Data Scientist", "Data Engineer"): 0.75,
    ("Data Scientist", "Research Scientist"): 0.85,
    ("Data Analyst", "Business Analyst"): 0.82,
    ("Data Analyst", "Data Engineer"): 0.70,
    ("Cloud Architect", "Solutions Architect"): 0.90,
    ("Cloud Architect", "DevOps Engineer"): 0.82,
}

ALL_SKILLS = sorted([
    "Python", "Machine Learning", "SQL", "TensorFlow", "Statistics", "Pandas",
    "NumPy", "Scikit-learn", "Deep Learning", "Data Visualization", "Excel",
    "Power BI", "Tableau", "R", "PyTorch", "Docker", "Kubernetes", "MLflow",
    "Java", "Git", "REST API", "Agile", "JavaScript", "System Design", "Linux",
    "PostgreSQL", "Redis", "Microservices", "React", "HTML", "CSS", "TypeScript",
    "Node.js", "Webpack", "MongoDB", "AWS", "Azure", "GCP", "Terraform",
    "Jenkins", "Ansible", "CI/CD", "Network Security", "Penetration Testing",
    "SIEM", "Firewalls", "Encryption", "Risk Analysis", "Compliance",
    "Requirements Gathering", "Stakeholder Management", "Process Mapping", "Jira",
    "Product Strategy", "Roadmapping", "A/B Testing", "UX Research", "Figma",
    "Wireframing", "Prototyping", "Adobe XD", "Spark", "Hadoop", "Kafka",
    "Airflow", "ETL", "Scala", "NLP", "Transformers", "BERT", "Hugging Face",
    "OpenCV", "YOLO", "Image Processing", "Research", "Publication", "Solidity",
    "Ethereum", "Smart Contracts", "Web3.js", "Cryptography", "MySQL", "Oracle",
    "Performance Tuning", "Swift", "Kotlin", "React Native", "Flutter", "Firebase",
    "Selenium", "Test Automation", "Manual Testing", "JUnit", "ITIL", "Budgeting",
    "Vendor Management", "Leadership", "Cisco", "Routing", "Switching", "Firewall",
    "VPN", "TCP/IP", "UML", "Documentation", "Scrum", "Facilitation", "Coaching",
    "Kanban", "Data Modeling", "Architecture", "ChatGPT", "LangChain",
    "Prompt Design", "Monitoring", "Communication", "Security", "Networking",
    "Project Management"
])

LEARNING_MAP = {
    "TensorFlow":       ("TensorFlow Developer Certificate", "Master deep learning models & neural networks", "fa-solid fa-graduation-cap", "https://www.tensorflow.org/learn"),
    "PyTorch":          ("Deep Learning with PyTorch", "Build cutting-edge neural networks with PyTorch", "fa-solid fa-fire", "https://pytorch.org/tutorials/"),
    "Docker":           ("Docker & Containerization Mastery", "Learn container orchestration and deployment", "fa-solid fa-box", "https://docs.docker.com/get-started/"),
    "Kubernetes":       ("Kubernetes Certified Administrator", "Scale cloud native applications seamlessly", "fa-solid fa-dharmachakra", "https://kubernetes.io/docs/tutorials/"),
    "AWS":              ("AWS Certified Solutions Architect", "Design and deploy scalable systems on AWS", "fa-solid fa-cloud", "https://aws.amazon.com/training/"),
    "Azure":            ("Azure Fundamentals & Cloud Architecture", "Master cloud solutions with Microsoft Azure", "fa-solid fa-cloud-sun", "https://learn.microsoft.com/azure/"),
    "GCP":              ("Google Cloud Engineer Course", "Develop data pipelines and infrastructure on GCP", "fa-solid fa-cloud-bolt", "https://cloud.google.com/training"),
    "Spark":            ("Apache Spark for Big Data Analytics", "Process large-scale distributed datasets", "fa-solid fa-bolt", "https://spark.apache.org/docs/latest/"),
    "Kafka":            ("Event Streaming with Apache Kafka", "Real-time event processing and streaming", "fa-solid fa-layer-group", "https://developer.confluent.io/"),
    "Airflow":          ("Data Pipeline Orchestration with Airflow", "Schedule and monitor complex ETL workflows", "fa-solid fa-wind", "https://airflow.apache.org/docs/"),
    "Terraform":        ("Infrastructure as Code with Terraform", "Automate cloud provisioning across providers", "fa-solid fa-cubes", "https://developer.hashicorp.com/terraform"),
    "React":            ("Modern React & Redux Toolkit", "Build interactive frontend web interfaces", "fa-brands fa-react", "https://react.dev/learn"),
    "TypeScript":       ("TypeScript Essentials for Developers", "Add type safety to modern JavaScript applications", "fa-solid fa-code", "https://www.typescriptlang.org/docs/"),
    "NLP":              ("Natural Language Processing Specialization", "Build sentiment models, chatbots, and summarizers", "fa-solid fa-comment-dots", "https://huggingface.co/learn"),
    "BERT":             ("Transformer Models & BERT Fine-Tuning", "Deep dive into state-of-the-art NLP models", "fa-solid fa-brain", "https://huggingface.co/docs/transformers"),
    "Transformers":     ("Hugging Face Transformers Masterclass", "Fine-tune pretrained foundation models", "fa-solid fa-robot", "https://huggingface.co/course"),
    "Hugging Face":     ("Hugging Face NLP & Vision Fundamentals", "Deploy AI models using the Hugging Face Hub", "fa-solid fa-face-smile", "https://huggingface.co/learn"),
    "MLflow":           ("MLOps & ML Experiment Tracking", "Manage ML lifecycles, metrics, and models", "fa-solid fa-chart-line", "https://mlflow.org/docs/latest/index.html"),
    "Statistics":       ("Applied Statistics for Data Science", "Master probability, hypothesis testing, and inference", "fa-solid fa-square-root-variable", "https://www.coursera.org/learn/stanford-statistics"),
    "Power BI":         ("Power BI Data Visualization Professional", "Create executive dashboards and DAX metrics", "fa-solid fa-chart-column", "https://learn.microsoft.com/power-bi/"),
    "Tableau":          ("Tableau Desktop & Business Analytics", "Transform raw data into interactive visual insights", "fa-solid fa-chart-pie", "https://www.tableau.com/learn"),
    "SQL":              ("Advanced SQL for Data Engineering", "Complex queries, window functions, and indexing", "fa-solid fa-database", "https://mode.com/sql-tutorial/"),
    "Machine Learning": ("Machine Learning Specialization by Andrew Ng", "Supervised, unsupervised learning, and best practices", "fa-solid fa-microchip", "https://www.coursera.org/specializations/machine-learning-introduction"),
    "Deep Learning":    ("Practical Deep Learning for Coders", "Hands-on neural network training and computer vision", "fa-solid fa-network-wired", "https://www.fast.ai/"),
    "Scikit-learn":     ("Scikit-learn Machine Learning Toolkit", "Classification, regression, and model evaluation", "fa-solid fa-gears", "https://scikit-learn.org/stable/user_guide.html"),
    "OpenCV":           ("Computer Vision with OpenCV & Python", "Image processing, object detection, and feature extraction", "fa-solid fa-eye", "https://docs.opencv.org/"),
    "Figma":            ("UI/UX Design Systems in Figma", "Prototype responsive interfaces and component libraries", "fa-brands fa-figma", "https://help.figma.com/hc/en-us"),
    "Agile":            ("Agile Software Development & Scrum", "Iterative project delivery and team dynamics", "fa-solid fa-arrows-rotate", "https://www.scrum.org/resources"),
    "Git":              ("Git & GitHub Version Control Mastery", "Branching strategies, pull requests, and CI/CD", "fa-brands fa-git-alt", "https://git-scm.com/doc"),
    "Linux":            ("Linux System Administration & Shell", "Command line proficiency and server management", "fa-brands fa-linux", "https://training.linuxfoundation.org/"),
    "Security":         ("CompTIA Security+ Certification", "Cybersecurity fundamentals, threats, and defense", "fa-solid fa-shield-halved", "https://www.cybrary.it/"),
    "System Design":    ("Grokking the System Design Architecture", "Scalable microservices, caching, and load balancing", "fa-solid fa-server", "https://github.com/donnemartin/system-design-primer"),
}

COUNTRIES       = ["India", "United States"]
LOCATIONS_INDIA = ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi",
                   "Gurgaon", "Noida", "Chennai", "Coimbatore", "Kolkata"]
LOCATIONS_US    = ["San Francisco", "New York", "Seattle", "Austin", "Boston",
                   "Los Angeles", "Chicago", "Denver", "Atlanta", "Remote"]
EDUCATION       = ["High School", "Associate", "Bachelor", "Master", "PhD"]
COMP_SIZE       = ["Startup", "Small", "Medium", "Large", "Enterprise"]
EMP_TYPE        = ["Full-time", "Contract", "Part-time", "Internship"]

JOB_TITLES = sorted([
    "Data Scientist", "Data Analyst", "Machine Learning Engineer", "Software Engineer",
    "Backend Developer", "Frontend Developer", "Full Stack Developer", "DevOps Engineer",
    "Cloud Architect", "Cybersecurity Analyst", "Business Analyst", "Product Manager",
    "UX Designer", "Data Engineer", "NLP Engineer", "Computer Vision Engineer",
    "Research Scientist", "Blockchain Developer", "Database Administrator", "AI Engineer",
    "Mobile Developer", "QA Engineer", "IT Manager", "Network Engineer",
    "Systems Analyst", "Scrum Master", "Data Architect", "Solutions Architect",
    "Prompt Engineer", "MLOps Engineer"
])
DOMAINS = ["Technology", "Finance", "Healthcare", "Consulting", "Research",
           "Design", "IT Services", "Telecommunications", "Security", "Any"]

ROLE_MEDIANS_INDIA = {
    "Data Scientist": 1392000, "Data Analyst": 1022000, "Machine Learning Engineer": 1420000,
    "Software Engineer": 1180000, "Backend Developer": 1100000, "Frontend Developer": 980000,
    "Full Stack Developer": 1150000, "DevOps Engineer": 1300000, "Cloud Architect": 1820000,
    "Cybersecurity Analyst": 1180000, "Business Analyst": 950000, "Product Manager": 1500000,
    "UX Designer": 920000, "Data Engineer": 1350000, "NLP Engineer": 1450000,
    "Computer Vision Engineer": 1450000, "Research Scientist": 1550000, "Blockchain Developer": 1380000,
    "Database Administrator": 1020000, "AI Engineer": 1371500, "Mobile Developer": 1080000,
    "QA Engineer": 1043500, "IT Manager": 1300000, "Network Engineer": 920000,
    "Systems Analyst": 950000, "Scrum Master": 1180000, "Data Architect": 1820000,
    "Solutions Architect": 1966000, "Prompt Engineer": 1150000, "MLOps Engineer": 1450000
}

ROLE_MEDIANS_US = {
    "Data Scientist": 125000, "Data Analyst": 82000, "Machine Learning Engineer": 140000,
    "Software Engineer": 115000, "Backend Developer": 110000, "Frontend Developer": 98000,
    "Full Stack Developer": 112000, "DevOps Engineer": 128000, "Cloud Architect": 155000,
    "Cybersecurity Analyst": 112000, "Business Analyst": 88000, "Product Manager": 132000,
    "UX Designer": 95000, "Data Engineer": 130000, "NLP Engineer": 145000,
    "Computer Vision Engineer": 142000, "Research Scientist": 150000, "Blockchain Developer": 135000,
    "Database Administrator": 96000, "AI Engineer": 148000, "Mobile Developer": 105000,
    "QA Engineer": 85000, "IT Manager": 125000, "Network Engineer": 92000,
    "Systems Analyst": 86000, "Scrum Master": 102000, "Data Architect": 148000,
    "Solutions Architect": 152000, "Prompt Engineer": 120000, "MLOps Engineer": 138000
}

# ─── 4. Helper Functions & Model Loaders ──────────────────────────────────────
@st.cache_resource
def load_salary_model_india():
    if not os.path.exists("models/salary_model_india.pkl"):
        st.error("India salary model missing at models/salary_model_india.pkl")
        st.stop()
    return joblib.load("models/salary_model_india.pkl")

@st.cache_resource
def load_salary_model_us():
    if not os.path.exists("models/salary_model_us.pkl"):
        st.error("US salary model missing at models/salary_model_us.pkl")
        st.stop()
    return joblib.load("models/salary_model_us.pkl")

@st.cache_resource
def load_recommender():
    if not os.path.exists("models/recommender.pkl"):
        st.error("Recommender model missing at models/recommender.pkl")
        st.stop()
    return joblib.load("models/recommender.pkl")

@st.cache_data
def load_jobs_data():
    return load_recommender()["jobs_df"]

def format_inr_lpa(value: float) -> str:
    return f"₹{value / 100000.0:.2f} LPA"

def format_inr_annual(value: float) -> str:
    return f"₹{value:,.0f} / year"

def format_inr_monthly(value: float) -> str:
    return f"₹{value / 12.0:,.0f} / month"

def format_usd_annual(value: float) -> str:
    return f"${value:,.0f} / year"

def format_usd_monthly(value: float) -> str:
    return f"${value / 12.0:,.0f} / month"

def normalize_skill(s):
    cleaned = str(s).strip().lower()
    return SKILL_SYNONYMS.get(cleaned, cleaned)

def get_role_skills(jobs_df, job_title):
    rows = jobs_df[jobs_df["Job Title"] == job_title]
    raw = ",".join(rows["Skills"].dropna().astype(str).values)
    return sorted({skill.strip() for skill in raw.split(",") if skill.strip()})

def predict_salary(bundle, experience, education, location, job_role, company_size, employment_type, skills):
    row = pd.DataFrame([{
        "Experience": experience,
        "Education": education,
        "Location": location,
        "Job Title": job_role,
        "Company Size": company_size,
        "Employment Type": employment_type,
        "Skills": ", ".join(skills) if isinstance(skills, (list, set)) else str(skills),
    }])
    return float(bundle["pipeline"].predict(row)[0])

def calc_skill_score(cand_skills, job_skills):
    cand_norm = {normalize_skill(s) for s in cand_skills if str(s).strip()}
    if not job_skills:
        return 50.0, [], []
    matched = [s for s in job_skills if normalize_skill(s) in cand_norm]
    missing = [s for s in job_skills if normalize_skill(s) not in cand_norm]
    score = (len(matched) / len(job_skills)) * 100.0
    return score, matched, missing

def calc_experience_score(cand_exp, job_exp):
    diff = cand_exp - job_exp
    if diff >= 0:
        score = 100.0 - min(diff * 2.5, 15.0)
    else:
        score = max(20.0, 100.0 - abs(diff) * 16.0)
    return float(np.clip(score, 0.0, 100.0))

def calc_education_score(cand_edu, job_edu):
    cand_lvl = DEGREE_HIERARCHY.get(cand_edu, 3)
    job_lvl = DEGREE_HIERARCHY.get(job_edu, 3)
    diff = cand_lvl - job_lvl
    if diff >= 0:
        return 100.0
    elif diff == -1:
        return 75.0
    elif diff == -2:
        return 50.0
    else:
        return 25.0

def calc_location_score(cand_loc, job_loc):
    if not cand_loc or not job_loc:
        return 70.0
    if cand_loc.lower() == job_loc.lower():
        return 100.0
    if cand_loc.lower() == "remote" or job_loc.lower() == "remote":
        return 95.0
    is_cand_in = cand_loc in LOCATIONS_INDIA
    is_job_in  = job_loc in LOCATIONS_INDIA
    is_cand_us = cand_loc in LOCATIONS_US
    is_job_us  = job_loc in LOCATIONS_US
    if (is_cand_in and is_job_in) or (is_cand_us and is_job_us):
        return 75.0
    return 35.0

def calc_role_score(target_role, job_title):
    if not target_role or not job_title:
        return 60.0
    if target_role.strip().lower() == job_title.strip().lower():
        return 100.0
    pair1 = (target_role, job_title)
    pair2 = (job_title, target_role)
    if pair1 in ROLE_SIMILARITY_MAP:
        return ROLE_SIMILARITY_MAP[pair1] * 100.0
    if pair2 in ROLE_SIMILARITY_MAP:
        return ROLE_SIMILARITY_MAP[pair2] * 100.0
    tokens_target = set(target_role.lower().split())
    tokens_job = set(job_title.lower().split())
    overlap = tokens_target & tokens_job
    if overlap:
        return 50.0 + len(overlap) * 15.0
    return 35.0

def generate_explanation(matched_count, req_count, skill_score, exp_score, edu_score, loc_score):
    reasons = []
    if skill_score >= 70:
        reasons.append(f"Strong skill alignment with {matched_count}/{req_count} skills present")
    elif skill_score >= 40:
        reasons.append(f"Moderate skill overlap ({matched_count}/{req_count} skills present)")
    else:
        reasons.append(f"Emerging skill match ({matched_count}/{req_count} skills)")
    
    if exp_score >= 90:
        reasons.append("experience level aligns directly with role requirements")
    elif exp_score < 60:
        reasons.append("role typically targets higher experience")
        
    if edu_score >= 95:
        reasons.append("degree credentials satisfy criteria")
    return ". ".join(reasons).capitalize() + "."

def multi_factor_recommend(jobs_df, cand_skills, target_role, cand_exp, cand_edu, cand_loc, domain="Any", top_n=5):
    if domain != "Any":
        filtered_df = jobs_df[jobs_df["Industry"] == domain]
        if filtered_df.empty:
            filtered_df = jobs_df
    else:
        filtered_df = jobs_df

    unique_titles = filtered_df["Job Title"].unique()
    role_results = []

    for title in unique_titles:
        title_rows = filtered_df[filtered_df["Job Title"] == title]
        all_role_skills_raw = ",".join(title_rows["Skills"].dropna().astype(str).values)
        skill_counts = Counter([s.strip() for s in all_role_skills_raw.split(",") if s.strip()])
        top_role_skills = [s for s, _ in skill_counts.most_common(7)]
        
        median_exp = title_rows["Experience"].median()
        deg = title_rows["Degree"].mode()[0] if not title_rows["Degree"].empty else "Bachelor"
        ind = title_rows["Industry"].mode()[0] if not title_rows["Industry"].empty else "Technology"
        
        loc_scores = [calc_location_score(cand_loc, l) for l in title_rows["Location"].dropna()]
        best_loc_score = max(loc_scores) if loc_scores else 60.0

        s_score, matched, missing = calc_skill_score(cand_skills, top_role_skills)
        r_score = calc_role_score(target_role, title)
        e_score = calc_experience_score(cand_exp, median_exp)
        edu_score = calc_education_score(cand_edu, deg)

        final_score = (
            MATCH_WEIGHTS["skill"] * s_score +
            MATCH_WEIGHTS["role"] * r_score +
            MATCH_WEIGHTS["experience"] * e_score +
            MATCH_WEIGHTS["education"] * edu_score +
            MATCH_WEIGHTS["location"] * best_loc_score
        )
        final_score = float(np.clip(final_score, 10.0, 99.0))
        readiness_index = int(np.clip(0.60 * s_score + 0.25 * e_score + 0.15 * edu_score, 5, 100))
        explanation = generate_explanation(len(matched), len(top_role_skills), s_score, e_score, edu_score, best_loc_score)

        role_results.append({
            "Job Title": title,
            "Match Score": round(final_score, 1),
            "Readiness Index": readiness_index,
            "Industry": ind,
            "Degree Requirement": deg,
            "Experience Requirement": int(median_exp),
            "Matched Skills": matched,
            "Missing Skills": missing,
            "Required Skills": top_role_skills,
            "Skill Score": round(s_score, 1),
            "Role Score": round(r_score, 1),
            "Experience Score": round(e_score, 1),
            "Education Score": round(edu_score, 1),
            "Location Score": round(best_loc_score, 1),
            "Explanation": explanation,
        })

    role_results.sort(key=lambda x: x["Match Score"], reverse=True)
    return role_results[:top_n]

def render_glass_ai_insight(title: str, text: str):
    st.markdown(f"""
    <div style="background: rgba(255, 107, 107, 0.08); backdrop-filter: blur(24px) saturate(160%); -webkit-backdrop-filter: blur(24px) saturate(160%); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 16px; padding: 1.3rem 1.6rem; margin: 1.2rem 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 30px rgba(0,0,0,0.3);">
      <div style="font-weight: 700; color: #ffffff; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
        <i class="fa-solid fa-sparkles" style="color: #ff8e53;"></i> {title}
      </div>
      <div style="font-size: 0.9rem; color: rgba(244, 242, 238, 0.8); line-height: 1.6;">
        {text}
      </div>
    </div>
    """, unsafe_allow_html=True)

# ─── 5. Upgraded Iconographic Glassmorphic Sidebar ────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style='padding: 0.8rem 0 1.2rem; text-align: left;'>
      <div style='font-size: 1.45rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.6rem;'>
        <i class="fa-solid fa-wand-magic-sparkles" style="color: #ff8e53;"></i> CAREER AI
      </div>
      <div style='font-size: 0.82rem; color: rgba(244, 242, 238, 0.6); margin-top: 0.25rem;'>
        Ambient Career Intelligence Platform
      </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    NAV_ITEMS = [
        ("Dashboard", "fa-solid fa-compass", None),
        ("Salary intelligence", "fa-solid fa-calculator", None),
        ("Job matches", "fa-solid fa-bullseye", "30"),
        ("Skill gap analysis", "fa-solid fa-sliders", None),
        ("Career roadmap", "fa-solid fa-route", None),
        ("Model observability", "fa-solid fa-chart-line", None),
    ]

    if "current_nav" not in st.session_state:
        st.session_state["current_nav"] = "Dashboard"

    # Radio for native Streamlit accessibility with iconographic visual injection
    nav_labels = [
        f"{'🧭' if name=='Dashboard' else ('🧮' if name=='Salary intelligence' else ('🎯' if name=='Job matches' else ('🎚️' if name=='Skill gap analysis' else ('🗺️' if name=='Career roadmap' else '📈'))))}  {name}{'  [30]' if name=='Job matches' else ''}"
        for name, icon, count in NAV_ITEMS
    ]

    selected_raw = st.radio(
        "Navigation Menu",
        nav_labels,
        index=0,
        label_visibility="collapsed"
    )

    if "Dashboard" in selected_raw:
        nav_selection = "Dashboard"
    elif "Salary" in selected_raw:
        nav_selection = "Salary intelligence"
    elif "Job matches" in selected_raw:
        nav_selection = "Job matches"
    elif "Skill gap" in selected_raw:
        nav_selection = "Skill gap analysis"
    elif "Roadmap" in selected_raw:
        nav_selection = "Career roadmap"
    else:
        nav_selection = "Model observability"

    st.markdown("---")
    
    # Secondary Info Blocks with Iconography & Muted-to-Bright State
    st.markdown("""
    <div class="sidebar-info-card" style="margin-bottom: 0.8rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.6rem; color: #34d399; font-weight: 700; font-size: 0.86rem;">
          <i class="fa-solid fa-circle-check info-icon" style="color: #34d399;"></i> Dual ML Online
        </div>
        <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: rgba(52, 211, 153, 0.12); color: #34d399; font-weight: 700;">v3.3</span>
      </div>
      <div style="font-size: 0.78rem; color: rgba(244, 242, 238, 0.6); margin-top: 0.4rem; line-height: 1.5;">
        • <strong>India Pipeline:</strong> XGBoost (R²=98.0%)<br>
        • <strong>US Pipeline:</strong> XGBoost (R²=96.5%)
      </div>
    </div>

    <div class="sidebar-info-card">
      <div style="display: flex; align-items: center; gap: 0.6rem; color: #ffffff; font-weight: 600; font-size: 0.86rem;">
        <i class="fa-solid fa-paper-plane info-icon"></i> Direct Support
      </div>
      <div style="font-size: 0.78rem; color: rgba(244, 242, 238, 0.6); margin-top: 0.25rem;">
        contact@careerai.studio
      </div>
      <div style="font-size: 0.74rem; color: rgba(244, 242, 238, 0.4); margin-top: 0.4rem;">
        <i class="fa-solid fa-location-dot"></i> Hubs: Bangalore • SF • New York
      </div>
    </div>
    """, unsafe_allow_html=True)
    st.caption("CAREER AI® Pro Glass • © 2026")

# ═════════════════════════════════════════════════════════════════════════════
# 1. DASHBOARD & GLASS HERO
# ═════════════════════════════════════════════════════════════════════════════
if nav_selection == "Dashboard":
    st.markdown("""
    <div class="glass-hero">
      <span class="badge-coral"><i class="fa-solid fa-sparkles"></i> AI Career Intelligence Platform</span>
      <h1 class="hero-title-glass" style="margin-top: 0.8rem;">Build a Smarter Career.</h1>
      <p style="color: rgba(244, 242, 238, 0.75); font-size: 1.125rem; line-height: 1.65; max-width: 720px; margin-bottom: 0;">
        AI-powered salary intelligence, multi-factor job matching, skill-gap diagnostics, and personalized career roadmaps designed for modern engineering talent.
      </p>
    </div>
    """, unsafe_allow_html=True)

    # 4 Frosted KPI Glass Cards
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">₹9.38 LPA</div>
          <div class="glass-kpi-label">Predicted Market Salary</div>
        </div>
        """, unsafe_allow_html=True)
    with k2:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">78.6%</div>
          <div class="glass-kpi-label">Top Role Match</div>
        </div>
        """, unsafe_allow_html=True)
    with k3:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">74%</div>
          <div class="glass-kpi-label">Skill Readiness Index</div>
        </div>
        """, unsafe_allow_html=True)
    with k4:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">+32%</div>
          <div class="glass-kpi-label">Career Growth Potential</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    render_glass_ai_insight(
        "Executive Market Overview",
        "Demand for high-leverage engineering roles (AI Engineers, MLOps, Solutions Architects) is accelerating across Indian tech hubs (Bangalore, Chennai, Hyderabad) and US markets. Candidates with core software fundamentals and cloud orchestration (Docker, AWS) command a 25–35% compensation premium."
    )

    st.subheader("Core Capabilities")
    f1, f2, f3 = st.columns(3)
    with f1:
        st.markdown("""
        <div class="glass-card">
          <div style="font-size: 1.8rem; color: #ff8e53; margin-bottom: 0.8rem;"><i class="fa-solid fa-calculator"></i></div>
          <h4 style="margin: 0 0 0.5rem 0;">Salary Intelligence</h4>
          <p style="font-size: 0.9rem; margin: 0; color: rgba(244, 242, 238, 0.65);">
            High-precision compensation modeling in native currencies (INR LPA for India and USD $ for US) with tenure curves and geographic multipliers.
          </p>
        </div>
        """, unsafe_allow_html=True)
    with f2:
        st.markdown("""
        <div class="glass-card">
          <div style="font-size: 1.8rem; color: #c084fc; margin-bottom: 0.8rem;"><i class="fa-solid fa-bullseye"></i></div>
          <h4 style="margin: 0 0 0.5rem 0;">Multi-Factor Role Matcher</h4>
          <p style="font-size: 0.9rem; margin: 0; color: rgba(244, 242, 238, 0.65);">
            Weighted 5-pillar candidate scoring: Skills (50%), Target Role (20%), Experience (15%), Education (10%), and Location (5%).
          </p>
        </div>
        """, unsafe_allow_html=True)
    with f3:
        st.markdown("""
        <div class="glass-card">
          <div style="font-size: 1.8rem; color: #2dd4bf; margin-bottom: 0.8rem;"><i class="fa-solid fa-route"></i></div>
          <h4 style="margin: 0 0 0.5rem 0;">Skill Gap Roadmaps</h4>
          <p style="font-size: 0.9rem; margin: 0; color: rgba(244, 242, 238, 0.65);">
            Diagnoses technical deficits and charts actionable learning pathways with curated documentation and certification tracks.
          </p>
        </div>
        """, unsafe_allow_html=True)

# ═════════════════════════════════════════════════════════════════════════════
# 2. SALARY INTELLIGENCE
# ═════════════════════════════════════════════════════════════════════════════
elif nav_selection == "Salary intelligence":
    st.subheader("Salary Intelligence Engine")
    st.write("Estimate your true market compensation benchmark powered by native-market XGBoost regression models.")

    col_m1, col_m2 = st.columns([1, 2])
    with col_m1:
        target_country = st.selectbox("Select Target Market", COUNTRIES, index=0)

    locations_list = LOCATIONS_INDIA if target_country == "India" else LOCATIONS_US
    default_loc = "Chennai" if target_country == "India" else "San Francisco"

    st.markdown("##### Career Profile Parameters")
    with st.form("salary_form"):
        col1, col2, col3 = st.columns(3)
        with col1:
            job_role = st.selectbox("Target Job Role", JOB_TITLES, index=JOB_TITLES.index("AI Engineer") if "AI Engineer" in JOB_TITLES else 0)
            years_experience = st.slider("Years of Experience", 0, 30, 0)
        with col2:
            education_level = st.selectbox("Education Level", EDUCATION, index=2)
            location = st.selectbox("Location", locations_list, index=locations_list.index(default_loc) if default_loc in locations_list else 0)
        with col3:
            company_size = st.selectbox("Company Size", COMP_SIZE, index=2)
            employment_type = st.selectbox("Employment Type", EMP_TYPE, index=0)

        user_skills = st.multiselect("Technical Skills Stack", ALL_SKILLS, default=["Python", "Machine Learning", "SQL"])
        submit_salary = st.form_submit_button("Calculate Precision Compensation Report")

    if submit_salary:
        if not user_skills:
            st.warning("Please select at least one skill to calculate precision estimate.")
        else:
            is_india = (target_country == "India")
            salary_bundle = load_salary_model_india() if is_india else load_salary_model_us()
            
            salary_pred = predict_salary(
                salary_bundle,
                years_experience,
                education_level,
                location,
                job_role,
                company_size,
                employment_type,
                user_skills,
            )
            salary_low = salary_pred * 0.85
            salary_high = salary_pred * 1.15
            
            role_medians_dict = ROLE_MEDIANS_INDIA if is_india else ROLE_MEDIANS_US
            role_median = role_medians_dict.get(job_role, 1200000 if is_india else 115000)

            st.markdown("<br>", unsafe_allow_html=True)
            
            if is_india:
                st.markdown(f"""
                <div class="glass-card" style="border: 1px solid rgba(255, 107, 107, 0.4); background: rgba(255, 255, 255, 0.08);">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                      <span class="badge-coral"><i class="fa-solid fa-circle-check"></i> High-Confidence ML Prediction</span>
                      <h2 style="font-size: 2.7rem; font-weight: 800; margin: 0.6rem 0 0.2rem; color: #ffffff;">{format_inr_lpa(salary_pred)}</h2>
                      <p style="margin: 0; color: rgba(244, 242, 238, 0.7); font-size: 0.95rem;">{format_inr_annual(salary_pred)} • <strong style="color:#ffffff;">{format_inr_monthly(salary_pred)}</strong></p>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 0.82rem; color: rgba(244, 242, 238, 0.5); text-transform: uppercase; letter-spacing: 0.05em;">Estimated Market Range</div>
                      <div style="font-size: 1.5rem; font-weight: 700; color: #ff8e53; margin-top: 0.25rem;">
                        {format_inr_lpa(salary_low)} – {format_inr_lpa(salary_high)}
                      </div>
                      <div style="font-size: 0.8rem; color: rgba(244, 242, 238, 0.4); margin-top: 0.2rem;">Model: India XGBoost Native Pipeline (INR)</div>
                    </div>
                  </div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="glass-card" style="border: 1px solid rgba(255, 107, 107, 0.4); background: rgba(255, 255, 255, 0.08);">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                      <span class="badge-coral"><i class="fa-solid fa-circle-check"></i> High-Confidence ML Prediction</span>
                      <h2 style="font-size: 2.7rem; font-weight: 800; margin: 0.6rem 0 0.2rem; color: #ffffff;">{format_usd_annual(salary_pred)}</h2>
                      <p style="margin: 0; color: rgba(244, 242, 238, 0.7); font-size: 0.95rem;"><strong style="color:#ffffff;">{format_usd_monthly(salary_pred)}</strong></p>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 0.82rem; color: rgba(244, 242, 238, 0.5); text-transform: uppercase; letter-spacing: 0.05em;">Estimated Market Range</div>
                      <div style="font-size: 1.5rem; font-weight: 700; color: #ff8e53; margin-top: 0.25rem;">
                        {format_usd_annual(salary_low)} – {format_usd_annual(salary_high)}
                      </div>
                      <div style="font-size: 0.8rem; color: rgba(244, 242, 238, 0.4); margin-top: 0.2rem;">Model: US XGBoost Native Pipeline (USD)</div>
                    </div>
                  </div>
                </div>
                """, unsafe_allow_html=True)

            render_glass_ai_insight(
                "Compensation Optimization Strategy",
                f"For an {job_role} in {location}, mastering high-demand cloud orchestration tools (Docker, AWS, Kubernetes) alongside advanced deep learning frameworks establishes immediate salary negotiation leverage."
            )

            st.markdown("### Interactive Market Visualizations")
            c_chart1, c_chart2 = st.columns(2)
            
            with c_chart1:
                exp_points = [0, 2, 5, 10, 15, 20]
                exp_preds = [
                    predict_salary(salary_bundle, e, education_level, location, job_role, company_size, employment_type, user_skills)
                    for e in exp_points
                ]
                fig_growth = go.Figure()
                fig_growth.add_trace(go.Scatter(
                    x=exp_points,
                    y=exp_preds,
                    mode='lines+markers',
                    line=dict(color='#ff8e53', width=3, shape='spline'),
                    marker=dict(size=8, color='#ff6b6b'),
                    name='Career Growth'
                ))
                fig_growth.update_layout(
                    title=f"Salary Growth Curve by Experience ({'₹ LPA' if is_india else '$'})",
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    font=dict(color="#f4f2ee", family="Plus Jakarta Sans"),
                    xaxis=dict(title="Years of Experience", gridcolor="rgba(255,255,255,0.08)"),
                    yaxis=dict(title="Compensation", gridcolor="rgba(255,255,255,0.08)", tickprefix="₹" if is_india else "$"),
                    margin=dict(l=20, r=20, t=40, b=20)
                )
                st.plotly_chart(fig_growth, width='stretch')

            with c_chart2:
                fig_bench = go.Figure(
                    data=[
                        go.Bar(
                            x=["25th Percentile", "Your Prediction", "Industry Median", "75th Percentile"],
                            y=[
                                role_median * 0.82,
                                salary_pred,
                                role_median,
                                role_median * 1.22,
                            ],
                            marker_color=["rgba(255,255,255,0.2)", "#ff8e53", "rgba(168,85,247,0.8)", "rgba(255,255,255,0.3)"],
                            text=[
                                format_inr_lpa(role_median * 0.82) if is_india else format_usd_annual(role_median * 0.82),
                                format_inr_lpa(salary_pred) if is_india else format_usd_annual(salary_pred),
                                format_inr_lpa(role_median) if is_india else format_usd_annual(role_median),
                                format_inr_lpa(role_median * 1.22) if is_india else format_usd_annual(role_median * 1.22),
                            ],
                            textposition="auto",
                            hovertemplate="<b>%{x}</b><br>Salary: %{y:,.0f}<extra></extra>"
                        )
                    ]
                )
                fig_bench.update_layout(
                    title="Market Benchmark Distribution",
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    font=dict(color="#f4f2ee", family="Plus Jakarta Sans"),
                    xaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
                    yaxis=dict(gridcolor="rgba(255,255,255,0.08)", tickprefix="₹" if is_india else "$"),
                    margin=dict(l=20, r=20, t=40, b=20)
                )
                st.plotly_chart(fig_bench, width='stretch')

# ═════════════════════════════════════════════════════════════════════════════
# 3. AI JOB RECOMMENDATIONS
# ═════════════════════════════════════════════════════════════════════════════
elif nav_selection == "Job matches":
    st.subheader("AI Job Recommendation Engine")
    st.write("Discover target tech roles ranked across skills (50%), target role affinity (20%), tenure (15%), degree (10%), and location (5%).")

    with st.form("job_rec_form"):
        c1, c2 = st.columns(2)
        with c1:
            rec_target_role = st.selectbox("Preferred Target Role", JOB_TITLES, index=JOB_TITLES.index("AI Engineer") if "AI Engineer" in JOB_TITLES else 0)
            selected_skills = st.multiselect("Your Current Technical Stack", ALL_SKILLS, default=["Python", "Machine Learning", "SQL"])
            custom_skills = st.text_input("Additional custom skills (comma-separated, e.g., AWS, PyTorch)")
        with c2:
            rec_exp = st.slider("Your Years of Experience", 0, 30, 2)
            rec_edu = st.selectbox("Your Education Level", EDUCATION, index=2)
            rec_loc = st.selectbox("Preferred Location", LOCATIONS_INDIA + LOCATIONS_US, index=7)
            preferred_domain = st.selectbox("Preferred Industry Domain", DOMAINS)
            top_recs = st.slider("Max Role Recommendations", 3, 8, 5)

        submit_recommend = st.form_submit_button("Generate Multi-Factor Role Matches")

    if submit_recommend:
        skills_input = list(selected_skills)
        if custom_skills.strip():
            skills_input += [skill.strip() for skill in custom_skills.split(",") if skill.strip()]

        if not skills_input:
            st.warning("Please select or enter at least one skill.")
        else:
            jobs_df = load_jobs_data()
            recommendations = multi_factor_recommend(
                jobs_df,
                cand_skills=skills_input,
                target_role=rec_target_role,
                cand_exp=rec_exp,
                cand_edu=rec_edu,
                cand_loc=rec_loc,
                domain=preferred_domain,
                top_n=top_recs
            )
            
            if recommendations:
                st.session_state["top_job"] = recommendations[0]["Job Title"]
                st.session_state["rec_skills"] = skills_input
                st.session_state["recommendations"] = recommendations
                st.session_state["jobs_df"] = jobs_df

                st.markdown("<br>", unsafe_allow_html=True)
                for idx, rec in enumerate(recommendations, start=1):
                    job_title = rec["Job Title"]
                    score = rec["Match Score"]
                    readiness = rec["Readiness Index"]
                    
                    st.markdown(f"""
                    <div class="glass-card" style="padding: 1.35rem 1.65rem; margin-bottom: 1.15rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <div>
                          <span style="font-size: 0.8rem; font-weight: 700; color: #ff8e53; text-transform: uppercase;">RANK #{idx}</span>
                          <h4 style="margin: 0.2rem 0 0; color: #ffffff; font-size: 1.25rem;">{job_title}</h4>
                          <p style="margin: 0.35rem 0 0.5rem; color: rgba(244, 242, 238, 0.65); font-size: 0.88rem;">
                            <i class="fa-solid fa-building" style="color: #ff8e53;"></i> {rec['Industry']} &nbsp;•&nbsp; 
                            <i class="fa-solid fa-graduation-cap" style="color: #c084fc;"></i> {rec['Degree Requirement']} req &nbsp;•&nbsp;
                            <i class="fa-solid fa-briefcase" style="color: #2dd4bf;"></i> ~{rec['Experience Requirement']} yrs exp
                          </p>
                        </div>
                        <div style="text-align: right;">
                          <span class="badge-coral" style="font-size: 0.95rem; font-weight: 700;">
                            <i class="fa-solid fa-chart-pie"></i> {score:.1f}% MATCH
                          </span>
                          <div style="font-size: 0.78rem; color: rgba(244, 242, 238, 0.6); margin-top: 0.25rem;">
                            Readiness Index: <strong>{readiness}%</strong>
                          </div>
                        </div>
                      </div>
                      
                      <div style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.08);">
                        <span class="badge-sub-glass">Skill: {rec['Skill Score']}%</span>
                        <span class="badge-sub-glass">Role Affinity: {rec['Role Score']}%</span>
                        <span class="badge-sub-glass">Tenure Fit: {rec['Experience Score']}%</span>
                        <span class="badge-sub-glass">Degree: {rec['Education Score']}%</span>
                        <span class="badge-sub-glass">Location: {rec['Location Score']}%</span>
                      </div>
                      
                      <div style="margin-top: 0.6rem; font-size: 0.85rem; color: rgba(244, 242, 238, 0.8); line-height: 1.5;">
                        <i class="fa-solid fa-circle-info" style="color: #ff8e53;"></i> <em>{rec['Explanation']}</em>
                      </div>
                      
                      <div style="margin-top: 0.8rem;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: #34d399; margin-bottom: 0.2rem;">Matched Skills:</div>
                        <div>{' '.join([f'<span class=\"tag-matched-glass\">{s}</span>' for s in rec['Matched Skills']]) if rec['Matched Skills'] else '<span style=\"color:rgba(244,242,238,0.4); font-size:0.8rem;\">None identified</span>'}</div>
                      </div>
                      
                      <div style="margin-top: 0.5rem;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: #fb7185; margin-bottom: 0.2rem;">Missing Skills to Bridge:</div>
                        <div>{' '.join([f'<span class=\"tag-missing-glass\">{s}</span>' for s in rec['Missing Skills']]) if rec['Missing Skills'] else '<span style=\"color:#34d399; font-size:0.8rem;\">Full skill stack possessed</span>'}</div>
                      </div>
                    </div>
                    """, unsafe_allow_html=True)

# ═════════════════════════════════════════════════════════════════════════════
# 4. SKILL GAP ANALYSIS
# ═════════════════════════════════════════════════════════════════════════════
elif nav_selection == "Skill gap analysis":
    st.subheader("Your Skill Gap Analysis")
    st.write("Compare your technical stack against target industry roles and pinpoint key areas to develop.")

    default_role = st.session_state.get("top_job", JOB_TITLES[0])
    default_skills = st.session_state.get("rec_skills", ["Python", "SQL", "Machine Learning"])

    with st.expander("Configure Target Role & Current Stack", expanded=True):
        selected_role = st.selectbox("Target Career Role", JOB_TITLES, index=JOB_TITLES.index(default_role) if default_role in JOB_TITLES else 0)
        current_skills = st.multiselect("Your Current Skills", ALL_SKILLS, default=default_skills)
        if st.button("Update Skill Gap Matrix"):
            st.session_state["top_job"] = selected_role
            st.session_state["rec_skills"] = current_skills
            st.success("Target role and skills updated.")

    if not current_skills:
        st.warning("Select current skills to compute gap matrix.")
        st.stop()

    jobs_df = st.session_state.get("jobs_df") if st.session_state.get("jobs_df") is not None else load_jobs_data()
    target_role = st.session_state.get("top_job", default_role)
    required_skills = get_role_skills(jobs_df, target_role)
    
    cand_norm_set = {normalize_skill(s) for s in current_skills if str(s).strip()}
    matched_skills = [s for s in required_skills if normalize_skill(s) in cand_norm_set]
    missing_skills = [s for s in required_skills if normalize_skill(s) not in cand_norm_set]
    match_pct = int(len(matched_skills) / max(len(required_skills), 1) * 100)

    st.markdown("<br>", unsafe_allow_html=True)
    g1, g2 = st.columns(2)
    with g1:
        st.markdown(f"""
        <div class="glass-kpi">
          <div class="glass-kpi-value">{target_role}</div>
          <div class="glass-kpi-label">Target Role</div>
        </div>
        """, unsafe_allow_html=True)
    with g2:
        st.markdown(f"""
        <div class="glass-kpi">
          <div class="glass-kpi-value">{match_pct}%</div>
          <div class="glass-kpi-label">Skill Coverage Index</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    col_match, col_missing = st.columns(2)
    with col_match:
        st.markdown("""
        <div class="glass-card">
          <h4 style="margin-top:0; color:#34d399;"><i class="fa-solid fa-circle-check"></i> Strong Skills Possessed</h4>
        """, unsafe_allow_html=True)
        if matched_skills:
            st.markdown(" ".join([f'<span class="tag-matched-glass">{skill}</span>' for skill in matched_skills]), unsafe_allow_html=True)
        else:
            st.write("No skill overlap identified yet.")
        st.markdown("</div>", unsafe_allow_html=True)

    with col_missing:
        st.markdown("""
        <div class="glass-card">
          <h4 style="margin-top:0; color:#fb7185;"><i class="fa-solid fa-triangle-exclamation"></i> Skills to Develop</h4>
        """, unsafe_allow_html=True)
        if missing_skills:
            st.markdown(" ".join([f'<span class="tag-missing-glass">{skill}</span>' for skill in missing_skills]), unsafe_allow_html=True)
        else:
            st.success("Complete skill set possessed for this target role!")
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("### Priority Skills to Acquire")
    if missing_skills:
        for idx, skill in enumerate(missing_skills[:4], 1):
            pct = max(35, 90 - idx * 15)
            st.markdown(f"**{idx}. {skill}**")
            st.progress(pct / 100.0)

# ═════════════════════════════════════════════════════════════════════════════
# 5. CAREER ROADMAP
# ═════════════════════════════════════════════════════════════════════════════
elif nav_selection == "Career roadmap":
    st.subheader("Personalized Career Progression Roadmap")
    st.write("Strategic milestone timeline from your current baseline to senior architectural and leadership roles.")

    target_role = st.session_state.get("top_job", "AI Engineer")
    stages = [
        ("STAGE 1: CURRENT / FOUNDATION", "Associate / Junior Specialist", "0–2 Years", "Master core programming, version control (Git), SQL databases, and fundamental frameworks."),
        ("STAGE 2: INTERMEDIATE SPECIALIZATION", "Mid-Level Professional", "2–5 Years", "Build scalable microservices, containerize applications (Docker), integrate CI/CD pipelines, and contribute to system design."),
        ("STAGE 3: SENIOR / LEAD ENGINEER", f"Senior {target_role}", "5–9 Years", "Lead architecture design, mentor engineering teams, optimize high-throughput distributed systems, and drive ML product lifecycle."),
        ("STAGE 4: PRINCIPAL / ARCHITECT", "Solutions Architect / Tech Director", "10+ Years", "Cross-functional technology leadership, executive stakeholder strategy, enterprise cloud governance, and large-scale AI strategy.")
    ]

    for stage_tag, role_name, tenure, desc in stages:
        st.markdown(f"""
        <div class="timeline-glass">
          <span class="badge-coral" style="position: absolute; top: 1.2rem; right: 1.2rem;">{tenure}</span>
          <div style="font-size: 0.78rem; font-weight: 700; color: #ff8e53; text-transform: uppercase;">{stage_tag}</div>
          <h3 style="margin: 0.3rem 0 0.5rem; color: #ffffff; font-size: 1.3rem;">{role_name}</h3>
          <p style="margin: 0; color: rgba(244, 242, 238, 0.7); font-size: 0.92rem; line-height: 1.6;">{desc}</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("### Curated Curriculum & Certification Tracks")
    current_skills = st.session_state.get("rec_skills", ["Python", "SQL", "Machine Learning"])
    jobs_df = load_jobs_data()
    required_skills = get_role_skills(jobs_df, target_role)
    missing_skills = [s for s in required_skills if normalize_skill(s) not in {normalize_skill(x) for x in current_skills}]
    roadmap_skills = missing_skills[:5] if missing_skills else required_skills[:5]

    for skill in roadmap_skills:
        title, desc, icon, link = LEARNING_MAP.get(
            skill,
            (f"Master {skill}", f"Explore curated documentation and courses for {skill}.", "fa-solid fa-book", f"https://www.google.com/search?q={skill}+course")
        )
        st.markdown(f"""
        <a href="{link}" target="_blank" style="text-decoration: none;">
          <div class="glass-card" style="padding: 1.2rem 1.5rem; margin-bottom: 0.8rem;">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <div style="font-size: 1.5rem; color: #ff8e53;"><i class="{icon}"></i></div>
              <div>
                <strong style="color: #ffffff; font-size: 1rem;">{title}</strong>
                <p style="margin: 0.25rem 0 0; color: rgba(244, 242, 238, 0.65); font-size: 0.88rem;">{desc}</p>
              </div>
            </div>
          </div>
        </a>
        """, unsafe_allow_html=True)

# ═════════════════════════════════════════════════════════════════════════════
# 6. MODEL OBSERVABILITY
# ═════════════════════════════════════════════════════════════════════════════
elif nav_selection == "Model observability":
    st.subheader("Model Analytics & ML Observability")
    st.write("Inspect trained machine learning benchmarks, performance metrics, and exploratory data visualizations.")

    render_glass_ai_insight(
        "ML System Architecture & Zero-Leakage Guarantee",
        "Salary prediction pipelines utilize scikit-learn ColumnTransformer and XGBoost Regressors fitted strictly on training subsets (80%). All categorical encoders, text vectorizers, and numerical scalers are fully encapsulated within saved artifacts, ensuring zero data leakage and 100% reproducible inference."
    )

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">97.97%</div>
          <div class="glass-kpi-label">India XGBoost Test R²</div>
        </div>
        """, unsafe_allow_html=True)
    with k2:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">₹71,818</div>
          <div class="glass-kpi-label">India Test MAE</div>
        </div>
        """, unsafe_allow_html=True)
    with k3:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">96.49%</div>
          <div class="glass-kpi-label">US XGBoost Test R²</div>
        </div>
        """, unsafe_allow_html=True)
    with k4:
        st.markdown("""
        <div class="glass-kpi">
          <div class="glass-kpi-value">$8,788</div>
          <div class="glass-kpi-label">US Test MAE</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    m_tab1, m_tab2 = st.tabs(["🇮🇳 India Pipeline (INR)", "🇺🇸 US Pipeline (USD)"])
    with m_tab1:
        bundle_in = load_salary_model_india()
        res_df_in = pd.DataFrame(bundle_in.get("results", {})).T
        res_df_in.index.name = "Algorithm"
        st.dataframe(
            res_df_in.style.format({
                "CV_R2": "{:.4f}",
                "R²": "{:.4f}",
                "MAE": "₹{:,.0f}",
                "MSE": "₹{:,.0f}",
                "RMSE": "₹{:,.0f}",
                "MedAE": "₹{:,.0f}"
            }),
            width='stretch'
        )

    with m_tab2:
        bundle_u = load_salary_model_us()
        res_df_u = pd.DataFrame(bundle_u.get("results", {})).T
        res_df_u.index.name = "Algorithm"
        st.dataframe(
            res_df_u.style.format({
                "CV_R2": "{:.4f}",
                "R²": "{:.4f}",
                "MAE": "${:,.0f}",
                "MSE": "${:,.0f}",
                "RMSE": "${:,.0f}",
                "MedAE": "${:,.0f}"
            }),
            width='stretch'
        )

    st.markdown("---")
    st.markdown("### Exploratory Data Visualizations")
    eda_images = [
        ("Salary vs. Experience", "images/salary_vs_experience.png"),
        ("Salary Distribution", "images/salary_distribution.png"),
        ("Top 15 Job Roles", "images/top_job_roles.png"),
        ("Top 20 Technical Skills", "images/top_skills.png"),
        ("Education Level vs. Salary", "images/education_vs_salary.png"),
        ("Correlation Heatmap", "images/correlation_heatmap.png")
    ]
    col_a, col_b = st.columns(2)
    for idx, (title, path) in enumerate(eda_images):
        target_col = col_a if idx % 2 == 0 else col_b
        with target_col:
            if os.path.exists(path):
                st.markdown(f"**{title}**")
                st.image(path, width='stretch')

# ─── 7. Footer ────────────────────────────────────────────────────────────────
st.markdown("""
<div class="glass-footer">
  CAREER AI® • Ambient Glassmorphism Intelligence Platform<br>
  Engineered with Streamlit, Scikit-learn, XGBoost & Plotly • Version 3.3 Glass
</div>
""", unsafe_allow_html=True)

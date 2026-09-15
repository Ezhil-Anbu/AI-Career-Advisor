import io
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from pypdf import PdfReader
from backend.services.ml_service import ALL_SKILLS, DEGREE_HIERARCHY

logger = logging.getLogger("resume_service")

# ─── Canonical Project Role Vocabulary ────────────────────────────────────────
ROLE_VOCABULARY = [
    "AI Engineer", "Machine Learning Engineer", "Software Engineer", "Data Scientist",
    "Data Analyst", "Data Engineer", "Backend Developer", "Frontend Developer",
    "Full Stack Developer", "DevOps Engineer", "MLOps Engineer", "NLP Engineer",
    "Computer Vision Engineer", "Cloud Architect", "Solutions Architect", "Product Manager",
    "UX Designer", "Cybersecurity Analyst", "Research Scientist", "QA Engineer",
    "Blockchain Developer"
]

# Aliases for role matching
ROLE_ALIASES = {
    "software developer": "Software Engineer",
    "sde": "Software Engineer",
    "sde 1": "Software Engineer",
    "sde 2": "Software Engineer",
    "sde 3": "Software Engineer",
    "sde i": "Software Engineer",
    "sde ii": "Software Engineer",
    "software engineer": "Software Engineer",
    "ai engineer": "AI Engineer",
    "ai/ml engineer": "AI Engineer",
    "machine learning engineer": "Machine Learning Engineer",
    "ml engineer": "Machine Learning Engineer",
    "data scientist": "Data Scientist",
    "data analyst": "Data Analyst",
    "data engineer": "Data Engineer",
    "backend engineer": "Backend Developer",
    "backend developer": "Backend Developer",
    "frontend engineer": "Frontend Developer",
    "frontend developer": "Frontend Developer",
    "full stack engineer": "Full Stack Developer",
    "full stack developer": "Full Stack Developer",
    "fullstack developer": "Full Stack Developer",
    "devops engineer": "DevOps Engineer",
    "mlops engineer": "MLOps Engineer",
    "nlp engineer": "NLP Engineer",
    "computer vision engineer": "Computer Vision Engineer",
    "cloud engineer": "Cloud Architect",
    "cloud architect": "Cloud Architect",
    "cloud solutions architect": "Solutions Architect",
    "solutions architect": "Solutions Architect",
    "product manager": "Product Manager",
    "ux designer": "UX Designer",
    "ui/ux designer": "UX Designer",
    "qa engineer": "QA Engineer",
    "test engineer": "QA Engineer",
    "research scientist": "Research Scientist"
}

# ─── Comprehensive Skill Aliases & Normalization ──────────────────────────────
# NOTE: Each alias maps to its canonical skill name as it appears in ALL_SKILLS.
# "fastapi" → "FastAPI" (its own skill, NOT REST API)
# "flask" → "Flask" (its own skill)
# Single-letter tokens (r, c, js, ts) are handled carefully to avoid false positives.
SKILL_ALIASES: Dict[str, str] = {
    "python": "Python",
    "py": "Python",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "artificial intelligence": "Machine Learning",
    "ai": "Machine Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "computer vision": "OpenCV",
    "opencv": "OpenCV",
    # NOTE: "cv" alone is NOT aliased here to avoid false positives (CV = curriculum vitae)
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "statistics": "Statistics",
    "stats": "Statistics",
    "data visualization": "Data Visualization",
    "data visualisation": "Data Visualization",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "ms excel": "Excel",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "mlflow": "MLflow",
    "git": "Git",
    "github": "Git",
    "gitlab": "Git",
    # REST API and web frameworks kept distinct
    "rest api": "REST API",
    "restful api": "REST API",
    "rest apis": "REST API",
    # FastAPI, Flask, Django are their OWN skills now
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "jira": "Jira",
    "system design": "System Design",
    "linux": "Linux",
    "unix": "Linux",
    "ubuntu": "Linux",
    "microservices": "Microservices",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react native": "React Native",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node": "Node.js",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "terraform": "Terraform",
    "jenkins": "Jenkins",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "transformers": "Transformers",
    "hugging face": "Hugging Face",
    "huggingface": "Hugging Face",
    "bert": "BERT",
    "spark": "Spark",
    "apache spark": "Spark",
    "pyspark": "Spark",
    "kafka": "Kafka",
    "apache kafka": "Kafka",
    "airflow": "Airflow",
    "apache airflow": "Airflow",
    "etl": "ETL",
    "data modeling": "Data Modeling",
    "security": "Security",
    "network security": "Network Security",
    "figma": "Figma",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "flutter": "Flutter",
    "solidity": "Solidity",
    "web3": "Web3.js",
    "chatgpt": "ChatGPT",
    "langchain": "LangChain",
    "llm": "Transformers",
    "large language models": "Transformers"
}

# ─── Location & Country Mapping ───────────────────────────────────────────────
LOCATION_MAP: Dict[str, Tuple[str, str]] = {
    "bangalore": ("Bangalore", "India"),
    "bengaluru": ("Bangalore", "India"),
    "chennai": ("Chennai", "India"),
    "madras": ("Chennai", "India"),
    "hyderabad": ("Hyderabad", "India"),
    "secunderabad": ("Hyderabad", "India"),
    "pune": ("Pune", "India"),
    "mumbai": ("Mumbai", "India"),
    "bombay": ("Mumbai", "India"),
    "delhi": ("Delhi", "India"),
    "new delhi": ("Delhi", "India"),
    "ncr": ("Delhi", "India"),
    "gurgaon": ("Gurgaon", "India"),
    "gurugram": ("Gurgaon", "India"),
    "noida": ("Noida", "India"),
    "greater noida": ("Noida", "India"),
    "coimbatore": ("Coimbatore", "India"),
    "kolkata": ("Kolkata", "India"),
    "calcutta": ("Kolkata", "India"),
    # Fixed: ahmedabad should map to Ahmedabad, not Bangalore
    "ahmedabad": ("Ahmedabad", "India"),
    "san francisco": ("San Francisco", "United States"),
    "sf": ("San Francisco", "United States"),
    "bay area": ("San Francisco", "United States"),
    "silicon valley": ("San Francisco", "United States"),
    "new york": ("New York", "United States"),
    "nyc": ("New York", "United States"),
    "seattle": ("Seattle", "United States"),
    "austin": ("Austin", "United States"),
    "boston": ("Boston", "United States"),
    "los angeles": ("Los Angeles", "United States"),
    "la": ("Los Angeles", "United States"),
    "chicago": ("Chicago", "United States"),
    "denver": ("Denver", "United States"),
    "remote": ("Remote", "United States")
}

# ─── Soft Skills Vocabulary ───────────────────────────────────────────────────
SOFT_SKILLS_LIST = [
    "Communication", "Leadership", "Teamwork", "Problem Solving",
    "Time Management", "Critical Thinking", "Adaptability",
    "Collaboration", "Agile Mindset", "Mentoring", "Stakeholder Management",
    "Presentation", "Analytical Thinking", "Creativity"
]

# ─── Common Certifications List ───────────────────────────────────────────────
KNOWN_CERTIFICATIONS = [
    "AWS Certified Solutions Architect", "AWS Certified Developer", "AWS Certified Cloud Practitioner",
    "AWS Certified Machine Learning", "Google Cloud Certified", "Google Cloud Associate Cloud Engineer",
    "Microsoft Certified: Azure Fundamentals", "Microsoft Certified: Azure Solutions Architect",
    "Certified Kubernetes Administrator", "CKA", "CKAD", "TensorFlow Developer Certificate",
    "CompTIA Security+", "PMP", "Certified ScrumMaster", "CSM", "ITIL", "Oracle Certified"
]

# ─── Education Section Patterns (used to skip date ranges in edu context) ─────
EDUCATION_SECTION_PATTERN = re.compile(
    r'(?:education|academic|qualification|degree|university|college|school|b\.?tech|m\.?tech|b\.?e|m\.?sc|bca|mca|b\.?sc|mba|bachelor|master|ph\.?d)[^\n]{0,60}?\n'
    r'([^\n]+\n){0,5}',
    re.IGNORECASE
)


class ResumeService:
    """
    Production Resume Analyzer Service.
    Extracts text, cleans formatting, extracts contact info, skills, experience,
    education, roles, location, certifications, and projects deterministically.

    Pipeline:
        validate_pdf_file()
        extract_text_from_pdf()  /  decode .txt
        clean_resume_text()
        extract_name(), extract_email(), extract_phone()
        extract_location(), extract_education(), extract_role()
        extract_target_role(), extract_experience()
        extract_skills(), extract_soft_skills(), extract_certifications()
        extract_projects(), extract_work_experience()
    """

    # ──────────────────────────────────────────────────────────────────────────
    # Validation & Extraction
    # ──────────────────────────────────────────────────────────────────────────

    def validate_pdf_file(self, file_bytes: bytes, filename: str) -> None:
        """Validate PDF header, extension, and size.  Raises ValueError on failure."""
        if not file_bytes or len(file_bytes) == 0:
            raise ValueError("The uploaded file is empty.")
        if len(file_bytes) > 12 * 1024 * 1024:
            raise ValueError("File size exceeds the 12MB limit.")
        if not filename.lower().endswith((".pdf", ".txt")):
            raise ValueError("Please upload a valid PDF resume.")
        if filename.lower().endswith(".pdf") and not file_bytes.startswith(b"%PDF"):
            raise ValueError("The uploaded file is not a valid PDF format.")

    def extract_text_from_pdf(self, file_bytes: bytes) -> Tuple[str, int, bool]:
        """
        Extract text from all pages using pypdf.
        Returns (extracted_text, pages_count, is_scanned_pdf).
        """
        raw_text = ""
        page_count = 0
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    raw_text += extracted + "\n"
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise ValueError(f"We couldn't read this PDF file. Please ensure it is not corrupted: {str(e)}")

        cleaned = self.clean_resume_text(raw_text)
        # A real text-based resume has at least 50 characters of readable content
        is_scanned = len(cleaned.strip()) < 50

        return cleaned, page_count, is_scanned

    def clean_resume_text(self, raw_text: str) -> str:
        """Clean and normalize resume text while preserving line layout."""
        if not raw_text:
            return ""

        text = raw_text

        # Normalize unicode bullets and special characters
        bullets = ['•', '●', '▪', '■', '►', '★', '✔', '✓', '–', '—', '·', '◦']
        for b in bullets:
            text = text.replace(b, ' - ')

        # Replace non-breaking spaces and tabs
        text = text.replace('\xa0', ' ').replace('\t', ' ')

        # Normalize multiple spaces on the same line
        text = re.sub(r'[ ]{2,}', ' ', text)

        # Normalize excessive newlines (max 2 consecutive newlines)
        text = re.sub(r'\n{3,}', '\n\n', text)

        return text.strip()

    # ──────────────────────────────────────────────────────────────────────────
    # Contact Information Extractors
    # ──────────────────────────────────────────────────────────────────────────

    def extract_name(self, text: str) -> Optional[str]:
        """
        Extract candidate name from top section (first 8 non-empty lines).
        Avoids generic keywords like Resume, CV, Summary, Contact, etc.
        Returns None if a reliable name cannot be identified.
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if not lines:
            return None

        disallowed = [
            "resume", "curriculum vitae", "cv", "profile", "contact", "email",
            "phone", "linkedin", "github", "address", "summary", "skills",
            "experience", "education", "projects", "objective", "certifications",
            "http", "www.", ".com", "@", "+91", "page", "developer", "engineer",
            "analyst", "scientist", "manager", "designer", "architect", "lead"
        ]

        for line in lines[:8]:
            line_lower = line.lower()
            if any(d in line_lower for d in disallowed):
                continue
            # Skip lines that look like email, phone or links
            if '@' in line or re.search(r'\d{5,}', line) or len(line) > 45:
                continue

            # Standard Capitalized Name: "Firstname Lastname" or "Firstname Middle Lastname"
            clean_candidate = re.sub(r'[^a-zA-Z\s.]', '', line).strip()
            words = clean_candidate.split()
            if 1 <= len(words) <= 4 and all(len(w) >= 2 for w in words):
                if all(w[0].isupper() for w in words):
                    return " ".join(words)
                elif line.isupper() and len(clean_candidate) >= 3:
                    # ALL CAPS NAME → Title Case
                    return " ".join([w.capitalize() for w in words])

        return None

    def extract_email(self, text: str) -> Optional[str]:
        """Extract email address using regex."""
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        match = re.search(email_pattern, text)
        if match:
            return match.group(0).rstrip('.').lower()
        return None

    def extract_phone(self, text: str) -> Optional[str]:
        """Extract Indian or international phone number and normalize."""
        # Indian formats: +91 9876543210, 9876543210, +91-9876543210
        indian_patterns = [
            r'(?:\+91[\s-]?)?[6789]\d{4}[\s-]?\d{5}',
            r'(?:\+91[\s-]?)?[6789]\d{9}',
            r'\b[6789]\d{9}\b'
        ]
        for pat in indian_patterns:
            match = re.search(pat, text)
            if match:
                raw_phone = match.group(0).strip()
                digits_only = re.sub(r'\D', '', raw_phone)
                if len(digits_only) == 10:
                    return f"+91 {digits_only[:5]} {digits_only[5:]}"
                elif len(digits_only) == 12 and digits_only.startswith("91"):
                    return f"+91 {digits_only[2:7]} {digits_only[7:]}"
                return raw_phone

        # International format: +1 (123) 456-7890
        intl_pattern = r'\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}'
        match = re.search(intl_pattern, text)
        if match:
            return match.group(0).strip()

        return None

    # ──────────────────────────────────────────────────────────────────────────
    # Profile Field Extractors
    # ──────────────────────────────────────────────────────────────────────────

    # Institutional prefixes: if a location name follows these words, it's a
    # college/university name, NOT the candidate's actual city.
    _INST_PREFIX_RE = re.compile(
        r'\b(iit|nit|iiit|iim|bits|vit|srm|anna university|mit|stanford|university of|college of)\s+$',
        re.IGNORECASE
    )

    def extract_location(self, text: str) -> Tuple[Optional[str], str]:
        """Extract candidate city and country from text using word-boundary matching.
        Skips location names that are part of institution names (e.g. 'IIT Madras').
        """
        text_lower = text.lower()
        # Institutional prefixes that mean the following word is a college name, not a city
        inst_prefix = re.compile(
            r'\b(iit|nit|iiit|iim|bits|vit|srm|anna university|mit|stanford|university of)\s+$',
            re.IGNORECASE
        )
        for loc_key, (canonical_city, country) in LOCATION_MAP.items():
            pattern = r'\b' + re.escape(loc_key) + r'\b'
            for m in re.finditer(pattern, text_lower):
                preceding = text_lower[max(0, m.start() - 30):m.start()]
                if inst_prefix.search(preceding):
                    continue  # e.g. "IIT Madras" — skip
                return canonical_city, country
        return None, "India"

    def extract_education(self, text: str) -> Optional[str]:
        """
        Detect highest education degree from Indian and International degree names.
        Maps strictly to: 'PhD', 'Master', 'Bachelor', 'Associate', 'High School'.
        Compatible with existing salary model education values.
        """
        text_lower = text.lower()

        # 1. PhD
        if re.search(r'\b(ph\.?d|doctorate|doctor of philosophy)\b', text_lower):
            return "PhD"

        # 2. Master's degrees
        master_patterns = [
            r'\bm\.?tech\b', r'\bmtech\b', r'\bm\.?e\b', r'\bm\.?s\.?\b',
            r'\bmsc\b', r'\bm\.?sc\b', r'\bmca\b', r'\bmba\b',
            r'\bmaster\'?s?(?:\s+of\s+[a-zA-Z\s]+)?\b',
            r'\bpost\s+graduate\b', r'\bpg\s+diploma\b'
        ]
        if any(re.search(pat, text_lower) for pat in master_patterns):
            return "Master"

        # 3. Bachelor's degrees
        bachelor_patterns = [
            r'\bb\.?tech\b', r'\bbtech\b', r'\bb\.?e\b', r'\bb\.?s\.?\b',
            r'\bbsc\b', r'\bb\.?sc\b', r'\bbca\b', r'\bbba\b', r'\bb\.?com\b',
            r'\bbachelor\'?s?(?:\s+of\s+[a-zA-Z\s]+)?\b',
            r'\bundergraduate\b', r'\bdegree in\b'
        ]
        if any(re.search(pat, text_lower) for pat in bachelor_patterns):
            return "Bachelor"

        # 4. Associate / Polytechnic
        if re.search(r'\b(associate(?:\s+degree)?|polytechnic|diploma in)\b', text_lower):
            return "Associate"

        # 5. High School
        if re.search(r'\b(high school|higher secondary|12th grade|senior secondary|cbse 12th|hsc)\b', text_lower):
            return "High School"

        return None

    def extract_role(self, text: str) -> Tuple[Optional[str], Optional[float]]:
        """
        Detect current / most prominent job role from top headline or experience.
        Returns (role_name, confidence).
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        top_text = " ".join(lines[:12]).lower()
        full_text_lower = text.lower()

        # Check top section first (higher confidence)
        for alias, canonical_role in ROLE_ALIASES.items():
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, top_text):
                return canonical_role, 0.92

        # Check full text (e.g. experience section)
        for alias, canonical_role in ROLE_ALIASES.items():
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, full_text_lower):
                return canonical_role, 0.78

        return None, None

    def extract_target_role(self, text: str) -> Optional[str]:
        """Extract target role if explicitly stated ('Seeking AI Engineer role')."""
        # Stop capturing at stop-words like position/role/job or punctuation/newline
        pattern = (
            r'(?:seeking|looking for|target role|career objective|applying for)'
            r'\s+(?:a\s+|an\s+|the\s+)?([A-Za-z][A-Za-z\s/]{2,38}?)'
            r'(?:\s+(?:position|role|opportunity|job|post)\b|[.,;\n]|$)'
        )
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            candidate_target = match.group(1).strip().lower()
            for alias, canonical in ROLE_ALIASES.items():
                if alias in candidate_target:
                    return canonical
        return None

    def _get_education_section_years(self, text: str) -> set:
        """
        Return a set of year-strings that appear within the education section
        of the resume. These are filtered out of experience date calculations
        to prevent graduation years being counted as work experience.
        """
        edu_years: set = set()
        # Find education section (look for the block following education keywords)
        edu_match = re.search(
            r'(?:education|academic background|qualifications?)[\s\S]{0,20}\n([\s\S]+?)(?:\n{2,}|\Z)',
            text, re.IGNORECASE
        )
        if edu_match:
            edu_block = edu_match.group(1)
            found = re.findall(r'\b(20\d{2}|19\d{2})\b', edu_block)
            edu_years.update(found)
        # Also capture years adjacent to degree keywords
        degree_lines = re.findall(
            r'(?:b\.?tech|m\.?tech|b\.?e|m\.?e|bsc|msc|bca|mca|mba|bachelor|master|ph\.?d'
            r'|diploma|polytechnic|high school|12th|hsc|degree)[^\n]{0,80}',
            text, re.IGNORECASE
        )
        for line in degree_lines:
            found = re.findall(r'\b(20\d{2}|19\d{2})\b', line)
            edu_years.update(found)
        return edu_years

    def extract_experience(self, text: str) -> Tuple[Optional[float], Optional[str]]:
        """
        Extract professional experience years.
        Method 1: Explicit statements ('3+ years of experience in ML').
        Method 2: Date interval calculation from employment sections
                  (education section dates are excluded to avoid double-counting).
        Returns (experience_years, evidence_snippet).
        """
        text_lower = text.lower()

        # Method 1: Explicit statement
        exp_patterns = [
            r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:relevant|professional|total|industry|hands-on)?\s*(?:experience|exp)\b',
            r'experience\s*(?::|—|-)\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\b'
        ]
        for pat in exp_patterns:
            matches = re.findall(pat, text_lower)
            if matches:
                valid_numbers = [float(x) for x in matches if 0.5 <= float(x) <= 35.0]
                if valid_numbers:
                    best_val = max(valid_numbers)
                    evidence = f"Explicitly mentioned {best_val} years of experience."
                    return best_val, evidence

        # Method 2: Date range parsing — exclude education section years
        edu_years = self._get_education_section_years(text)

        date_pattern = (
            r'\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})'
            r'\s*(?:-|–|—|to)\s*'
            r'(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\b'
        )
        matches = re.findall(date_pattern, text, re.IGNORECASE)

        if matches:
            total_months = 0
            current_year = datetime.now().year

            for start_str, end_str in matches:
                start_year_m = re.search(r'\b(20\d{2}|19\d{2})\b', start_str)
                if not start_year_m:
                    continue
                start_y_str = start_year_m.group(1)

                # Only skip bare-year education graduation ranges.
                # If start_str has a month name (e.g. "Jan 2022"), it's a work date
                # and should NOT be excluded even if that year is in the edu section.
                start_has_month = bool(re.search(
                    r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',
                    start_str, re.IGNORECASE
                ))
                if start_y_str in edu_years and not start_has_month:
                    continue

                start_y = int(start_y_str)

                if end_str.lower() in ["present", "current", "now"]:
                    end_y = current_year
                else:
                    end_year_m = re.search(r'\b(20\d{2}|19\d{2})\b', end_str)
                    if not end_year_m:
                        continue
                    end_y_str = end_year_m.group(1)
                    # Only skip bare end-year edu ranges; month-qualified end dates pass
                    end_has_month = bool(re.search(
                        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',
                        end_str, re.IGNORECASE
                    ))
                    if end_y_str in edu_years and not end_has_month:
                        continue
                    end_y = int(end_y_str)

                diff_y = end_y - start_y
                if 0 <= diff_y <= 25:
                    total_months += max(diff_y * 12, 6)

            if total_months > 0:
                years = round(min(total_months / 12, 35.0), 1)
                evidence = f"Calculated {years} years based on resume date ranges."
                return years, evidence

        return None, None

    # ──────────────────────────────────────────────────────────────────────────
    # Skill Extractors
    # ──────────────────────────────────────────────────────────────────────────

    def extract_skills(self, text: str) -> List[str]:
        """
        Extract technical skills using the comprehensive project vocabulary and aliases.
        Uses strict word boundaries to prevent false positives (e.g. 'R', 'C').
        FastAPI, Flask, Django are recognized as independent skills.
        """
        text_lower = text.lower()
        extracted: set = set()

        # 1. Match from Skill Aliases Dictionary (handles aliases like k8s, tf, ml, etc.)
        for alias, canonical_skill in SKILL_ALIASES.items():
            # Special treatment for ambiguous single-char tokens
            if alias in ["r", "c"]:
                if re.search(r'\b' + re.escape(alias) + r'\s+(?:programming|language)\b', text_lower):
                    extracted.add(canonical_skill)
                elif re.search(
                    r'(?:skills|technologies|languages)\s*[:\-].*?\b' + re.escape(alias) + r'\b',
                    text_lower
                ):
                    extracted.add(canonical_skill)
            else:
                pattern = r'\b' + re.escape(alias) + r'\b'
                if re.search(pattern, text_lower):
                    extracted.add(canonical_skill)

        # 2. Match from canonical ALL_SKILLS (catches skills not in alias dict)
        for skill in ALL_SKILLS:
            if skill.lower() in ["r", "c"]:
                continue
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted.add(skill)

        return sorted(list(extracted))

    def extract_soft_skills(self, text: str) -> List[str]:
        """Extract soft skills explicitly mentioned in resume text."""
        text_lower = text.lower()
        matched = []
        for soft in SOFT_SKILLS_LIST:
            pattern = r'\b' + re.escape(soft.lower()) + r'\b'
            if re.search(pattern, text_lower):
                matched.append(soft)
        return matched

    def extract_certifications(self, text: str) -> List[str]:
        """Extract certifications from known certifications vocabulary."""
        text_lower = text.lower()
        matched = []
        for cert in KNOWN_CERTIFICATIONS:
            pattern = r'\b' + re.escape(cert.lower()) + r'\b'
            if re.search(pattern, text_lower):
                matched.append(cert)
        return matched

    def extract_projects(self, text: str, user_skills: List[str]) -> List[Dict[str, Any]]:
        """Extract project section items and detected tech stacks."""
        projects = []
        proj_match = re.search(
            r'(?:projects|academic projects|key projects)\s*[:\n]([\s\S]+?)'
            r'(?=(?:experience|education|skills|certifications|awards|\Z))',
            text, re.IGNORECASE
        )
        if proj_match:
            section_text = proj_match.group(1).strip()
            items = [
                item.strip()
                for item in re.split(r'\n(?=[A-Z0-9\-\*\•])', section_text)
                if len(item.strip()) > 15
            ]
            for item in items[:4]:
                lines = item.split('\n')
                title = lines[0].strip(' -•*')
                desc = " ".join(lines[1:]).strip() if len(lines) > 1 else title
                item_lower = item.lower()
                tech_used = [s for s in user_skills if s.lower() in item_lower]
                if len(title) > 3:
                    projects.append({
                        "name": title[:60],
                        "description": desc[:200],
                        "skills": tech_used
                    })
        return projects

    def extract_work_experience(self, text: str, user_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Extract work experience entries.
        Attempts to parse actual company names from the experience section.
        """
        experiences = []
        exp_match = re.search(
            r'(?:work experience|professional experience|employment history)\s*[:\n]([\s\S]+?)'
            r'(?=(?:education|projects|skills|certifications|\Z))',
            text, re.IGNORECASE
        )
        if exp_match:
            section_text = exp_match.group(1).strip()
            blocks = re.split(r'\n{2,}', section_text)
            for block in blocks[:4]:
                if len(block.strip()) < 15:
                    continue
                # Detect role
                found_role = None
                for alias, canonical in ROLE_ALIASES.items():
                    if alias in block.lower():
                        found_role = canonical
                        break
                # Detect dates
                date_m = re.search(
                    r'\b(20\d{2}|19\d{2})\s*[-–—to]+\s*(Present|Current|\d{4})\b',
                    block, re.IGNORECASE
                )
                dates_str = date_m.group(0) if date_m else None
                start_date: Optional[str] = None
                end_date: Optional[str] = None
                if dates_str:
                    date_parts = re.split(r'[-–—to]+', dates_str, maxsplit=1)
                    start_date = date_parts[0].strip() if len(date_parts) > 0 else None
                    end_date = date_parts[1].strip() if len(date_parts) > 1 else "Present"

                # Attempt company name extraction: look for "| CompanyName" or "at CompanyName"
                company_match = re.search(
                    r'(?:\|\s*|at\s+|@\s*)([A-Z][a-zA-Z0-9\s&.,-]{2,40}?)(?:\s*[\n,|]|$)',
                    block
                )
                company_name = company_match.group(1).strip() if company_match else None

                tech_used = [s for s in user_skills if s.lower() in block.lower()]
                experiences.append({
                    "company": company_name,
                    "role": found_role or "Software Professional",
                    "start_date": start_date,
                    "end_date": end_date,
                    "description": block[:200].strip(),
                    "skills": tech_used
                })
        return experiences

    # ──────────────────────────────────────────────────────────────────────────
    # Main Pipeline
    # ──────────────────────────────────────────────────────────────────────────

    def _empty_scanned_response(self, pages_count: int, char_count: int) -> Dict[str, Any]:
        """Return a standardized scanned/unreadable PDF response."""
        return {
            "success": False,
            "error_code": "NO_EXTRACTABLE_TEXT",
            "message": (
                "This resume appears to be image-based or scanned. "
                "Please upload a text-based PDF."
            ),
            "profile": {
                "name": None, "email": None, "phone": None,
                "role": None, "role_confidence": None, "target_role": None,
                "experience_years": None, "education": None,
                "location": None, "country": "India",
                "skills": [], "soft_skills": [], "certifications": [],
                "projects": [], "work_experience": [], "summary": None
            },
            "metadata": {
                "pages_processed": pages_count,
                "text_characters": char_count,
                "is_scanned_pdf": True,
                "evidence": {}
            }
        }

    def analyze_resume(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Complete end-to-end resume analysis pipeline.

        Steps:
          1. Validate file (type, size, PDF header)
          2. Extract text (pypdf for PDF, decode for .txt)
          3. Detect scanned / image-only PDF
          4. Extract all candidate information
          5. Return structured CandidateProfile dict

        Returns dict conforming to ResumeAnalyzeResponse schema.
        """
        # ── Handle empty .txt early (not a ValueError, return structured response) ──
        if filename.lower().endswith(".txt") and (not file_bytes or len(file_bytes) == 0):
            return self._empty_scanned_response(1, 0)

        # ── Validate ──
        self.validate_pdf_file(file_bytes, filename)

        # ── Extract Text ──
        if filename.lower().endswith(".pdf"):
            extracted_text, pages_count, is_scanned = self.extract_text_from_pdf(file_bytes)
        else:
            raw_decoded = file_bytes.decode("utf-8", errors="ignore")
            extracted_text = self.clean_resume_text(raw_decoded)
            pages_count = 1
            is_scanned = len(extracted_text.strip()) < 50

        # ── Scanned / Empty ──
        if is_scanned or len(extracted_text.strip()) < 50:
            return self._empty_scanned_response(pages_count, len(extracted_text))

        # ── Information Extraction ──
        name = self.extract_name(extracted_text)
        email = self.extract_email(extracted_text)
        phone = self.extract_phone(extracted_text)
        location, country = self.extract_location(extracted_text)
        education = self.extract_education(extracted_text)
        role, role_conf = self.extract_role(extracted_text)
        target_role = self.extract_target_role(extracted_text)
        experience_years, exp_evidence = self.extract_experience(extracted_text)
        skills = self.extract_skills(extracted_text)
        soft_skills = self.extract_soft_skills(extracted_text)
        certifications = self.extract_certifications(extracted_text)
        projects = self.extract_projects(extracted_text, skills)
        work_exp = self.extract_work_experience(extracted_text, skills)

        # ── Build evidence dict (for debugging, never logged in full) ──
        evidence: Dict[str, Any] = {}
        if exp_evidence:
            evidence["experience"] = exp_evidence
        if role_conf is not None:
            evidence["role_confidence"] = role_conf

        return {
            "success": True,
            "profile": {
                "name": name,
                "email": email,
                "phone": phone,
                "role": role,
                "role_confidence": role_conf,
                "target_role": target_role,
                "experience_years": experience_years,
                "education": education,
                "location": location,
                "country": country,
                "skills": skills,
                "soft_skills": soft_skills,
                "certifications": certifications,
                "projects": projects,
                "work_experience": work_exp,
                "summary": extracted_text[:300].strip() if extracted_text else None
            },
            "metadata": {
                "pages_processed": max(1, pages_count),
                "text_characters": len(extracted_text),
                "is_scanned_pdf": False,
                "evidence": evidence
            }
        }

    def parse_resume_content(self, text: str) -> Dict[str, Any]:
        """
        Backwards-compatible legacy parse method.
        Used by /api/resume/parse and existing tests.
        """
        clean = self.clean_resume_text(text)
        skills = self.extract_skills(clean)
        role, _ = self.extract_role(clean)
        education = self.extract_education(clean) or "Bachelor"
        exp, _ = self.extract_experience(clean)
        name = self.extract_name(clean)
        email = self.extract_email(clean)
        phone = self.extract_phone(clean)
        location, _ = self.extract_location(clean)
        target_role = self.extract_target_role(clean)

        return {
            "extracted_skills": skills,
            "extracted_roles": [role] if role else [],
            "estimated_experience": exp if exp is not None else 2.0,
            "extracted_education": education,
            "raw_text_length": len(text),
            "name": name,
            "email": email,
            "phone": phone,
            "location": location,
            "target_role": target_role,
            "soft_skills": self.extract_soft_skills(clean),
            "certifications": self.extract_certifications(clean),
            "projects": self.extract_projects(clean, skills),
            "work_experience": self.extract_work_experience(clean, skills)
        }


resume_service = ResumeService()

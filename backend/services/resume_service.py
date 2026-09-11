import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader
from backend.services.ml_service import ALL_SKILLS, DEGREE_HIERARCHY

ROLE_KEYWORDS = [
    "Data Scientist", "Software Engineer", "AI Engineer", "Machine Learning Engineer",
    "Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer",
    "Cloud Architect", "Data Analyst", "Product Manager", "UX Designer", "Cybersecurity Analyst",
    "Data Engineer", "NLP Engineer", "Computer Vision Engineer", "Research Scientist",
    "Blockchain Developer", "QA Engineer", "Solutions Architect", "MLOps Engineer"
]

class ResumeService:
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            text = f"Error extracting PDF text: {str(e)}"
        return text

    def parse_resume_content(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        extracted_skills = []

        for skill in ALL_SKILLS:
            # Match word boundary or exact token
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_skills.append(skill)

        # Detect roles
        extracted_roles = []
        for role in ROLE_KEYWORDS:
            pattern = r'\b' + re.escape(role.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_roles.append(role)

        # Detect Experience estimate
        exp_matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?', text_lower)
        estimated_exp = 2.0
        if exp_matches:
            try:
                numbers = [float(x) for x in exp_matches if 0.5 <= float(x) <= 35.0]
                if numbers:
                    estimated_exp = max(numbers)
            except Exception:
                estimated_exp = 2.0

        # Detect Education
        education = "Bachelor"
        if "phd" in text_lower or "doctor of philosophy" in text_lower or "doctorate" in text_lower:
            education = "PhD"
        elif "master" in text_lower or "m.s." in text_lower or "m.tech" in text_lower or "msc" in text_lower or "mba" in text_lower:
            education = "Master"
        elif "bachelor" in text_lower or "b.s." in text_lower or "b.tech" in text_lower or "b.e." in text_lower or "bsc" in text_lower or "bca" in text_lower:
            education = "Bachelor"
        elif "associate" in text_lower or "diploma" in text_lower:
            education = "Associate"
        elif "high school" in text_lower:
            education = "High School"

        return {
            "extracted_skills": sorted(list(set(extracted_skills))),
            "extracted_roles": extracted_roles,
            "estimated_experience": estimated_exp,
            "extracted_education": education,
            "raw_text_length": len(text)
        }

resume_service = ResumeService()

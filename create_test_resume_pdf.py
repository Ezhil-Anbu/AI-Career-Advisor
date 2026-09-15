"""
create_test_resume_pdf.py
─────────────────────────
Generates a text-based PDF test resume for Arun Kumar that can be used
to validate the full end-to-end resume analyzer pipeline.

Run:
    python create_test_resume_pdf.py

Output:
    test_resume_arun_kumar.pdf  (in the project root)

Requirements:
    pypdf>=4.0.0  (already in requirements.txt)

NOTE: pypdf's PdfWriter does not natively write arbitrary text streams.
We use the reportlab-free approach: embed a text payload directly via a
compressed content stream added to a blank page. This produces a valid
text-based PDF that pypdf can extract text from via PdfReader.

If you do not have reportlab installed, we fall back to a plain-text
.txt test file instead. The resume_service handles .txt files natively.
"""

import io
import os
import sys
import textwrap

RESUME_TEXT = textwrap.dedent("""\
Arun Kumar
Email: arun.kumar@example.com | Phone: +91 9876543210
Location: Chennai, India
LinkedIn: linkedin.com/in/arunkumar-ai | GitHub: github.com/arunkumar

PROFESSIONAL SUMMARY
Innovative AI Engineer with 3 years of experience developing machine learning models
and deploying scalable REST APIs and FastAPI services in production environments.

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
- Built FastAPI microservice with 99.9% uptime serving 50K daily requests.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science & Engineering
Anna University, Chennai | 2016 - 2020

CERTIFICATIONS
- AWS Certified Solutions Architect
- TensorFlow Developer Certificate

PROJECTS
AI Resume Intelligence: Built NLP parser in Python and FastAPI with 95% extraction accuracy.
Salary Prediction Engine: Random forest model trained on 100K data points using Scikit-learn.
""")


def create_pdf_with_reportlab(output_path: str) -> bool:
    """Try to create a proper text-based PDF using reportlab."""
    try:
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.pagesizes import A4

        c = rl_canvas.Canvas(output_path, pagesize=A4)
        c.setFont("Helvetica", 10)
        width, height = A4
        y = height - 40
        line_height = 14

        for line in RESUME_TEXT.split('\n'):
            if y < 40:
                c.showPage()
                c.setFont("Helvetica", 10)
                y = height - 40
            c.drawString(40, y, line)
            y -= line_height

        c.save()
        return True
    except ImportError:
        return False


def create_pdf_with_pypdf_stream(output_path: str) -> bool:
    """
    Create a minimal but valid PDF with an embedded text content stream.
    This is a hand-crafted PDF that pypdf can extract text from.
    """
    try:
        # Build a minimal PDF manually with a text stream
        # This ensures pypdf PdfReader.extract_text() works
        lines = RESUME_TEXT.split('\n')
        
        # Build PDF content stream (PDF text operators)
        stream_parts = ["BT", "/F1 10 Tf", "40 780 Td", "14 TL"]
        for line in lines:
            # Escape special PDF characters
            safe_line = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)').replace('\r', '')
            stream_parts.append(f"({safe_line}) Tj T*")
        stream_parts.append("ET")
        stream_content = '\n'.join(stream_parts).encode('latin-1', errors='replace')

        # Build minimal PDF structure
        pdf_lines = []
        offsets = []

        def add_obj(obj_num: int, content: str) -> None:
            offsets.append(len('\n'.join(pdf_lines) + '\n' if pdf_lines else ''))
            pdf_lines.append(f"{obj_num} 0 obj")
            pdf_lines.append(content)
            pdf_lines.append("endobj")

        pdf_lines.append("%PDF-1.4")

        # Obj 1: Catalog
        offsets_start = len('\n'.join(pdf_lines)) + 1
        pdf_lines.append("1 0 obj")
        pdf_lines.append("<< /Type /Catalog /Pages 2 0 R >>")
        pdf_lines.append("endobj")

        pdf_lines.append("2 0 obj")
        pdf_lines.append("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
        pdf_lines.append("endobj")

        stream_len = len(stream_content)
        pdf_lines.append("3 0 obj")
        pdf_lines.append(
            "<< /Type /Page /Parent 2 0 R "
            "/MediaBox [0 0 595 842] "
            "/Contents 4 0 R "
            "/Resources << /Font << /F1 5 0 R >> >> >>"
        )
        pdf_lines.append("endobj")

        # Build stream object separately (binary-safe)
        obj4_header = f"4 0 obj\n<< /Length {stream_len} >>\nstream\n"
        obj4_footer = "\nendstream\nendobj\n"

        pdf_lines.append("5 0 obj")
        pdf_lines.append(
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
            "/Encoding /WinAnsiEncoding >>"
        )
        pdf_lines.append("endobj")

        # Assemble
        body = '\n'.join(pdf_lines).encode('latin-1', errors='replace')
        body += b'\n' + obj4_header.encode('latin-1') + stream_content + obj4_footer.encode('latin-1')

        # xref table
        xref_offset = len(body)
        xref = b"xref\n0 6\n0000000000 65535 f \n"
        xref += b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"
        xref += str(xref_offset).encode() + b"\n%%EOF\n"

        with open(output_path, 'wb') as f:
            f.write(body + xref)
        return True
    except Exception as e:
        print(f"  PDF stream approach failed: {e}")
        return False


def create_txt_fallback(output_path: str) -> None:
    """Write the resume as a plain .txt file (also supported by resume_service)."""
    txt_path = output_path.replace('.pdf', '.txt')
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(RESUME_TEXT)
    print(f"  Created fallback: {txt_path}")


def main():
    project_root = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(project_root, "test_resume_arun_kumar.pdf")

    print("=" * 60)
    print("Creating test resume PDF: test_resume_arun_kumar.pdf")
    print("=" * 60)

    # Try reportlab first (best quality)
    if create_pdf_with_reportlab(output_path):
        print(f"✅ Created PDF with reportlab: {output_path}")
    elif create_pdf_with_pypdf_stream(output_path):
        print(f"✅ Created PDF with embedded text stream: {output_path}")
        
        # Quick verification: try to read it back
        try:
            sys.path.insert(0, project_root)
            from pypdf import PdfReader
            reader = PdfReader(output_path)
            extracted = ""
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    extracted += t
            char_count = len(extracted.strip())
            if char_count > 100:
                print(f"✅ Verification: pypdf extracted {char_count} characters from PDF.")
            else:
                print(f"⚠️  pypdf extracted only {char_count} chars. Falling back to .txt")
                create_txt_fallback(output_path)
        except Exception as e:
            print(f"⚠️  Could not verify PDF: {e}. Creating .txt fallback.")
            create_txt_fallback(output_path)
    else:
        print("⚠️  Could not create PDF. Creating .txt fallback.")
        create_txt_fallback(output_path)

    print()
    print("Resume content:")
    print("-" * 40)
    print(RESUME_TEXT[:300] + "...")
    print()
    print("Test this resume with:")
    print("  python test_resume_analyzer.py")
    print()
    print("Or via API:")
    print("  curl -X POST http://localhost:8000/api/resume/analyze \\")
    print("       -F 'file=@test_resume_arun_kumar.pdf'")


if __name__ == "__main__":
    main()

import sys
from pathlib import Path

# Ensure the project root is in sys.path so 'backend' module is always resolvable by Vercel Serverless runtime
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.main import app

# Export app for Vercel Serverless Function entrypoint
__all__ = ["app"]

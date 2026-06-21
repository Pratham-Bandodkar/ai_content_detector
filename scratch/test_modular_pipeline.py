import sys
import os

# Ensure the backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from pipeline import detect_text  # type: ignore

try:
    print("Testing detect_text function directly...")
    result = detect_text("This is a simple test sentence. It has more than three words. And this is another sentence.")
    print("Result:")
    print(result)
except Exception as e:
    import traceback
    print("Error encountered:")
    traceback.print_exc()

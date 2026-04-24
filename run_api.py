import uvicorn
import os
import sys

# Add the current directory to sys.path so that 'backend' can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # In production (Render), we don't want reload=True
    is_prod = os.environ.get("RENDER", "false").lower() == "true"
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=not is_prod)

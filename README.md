# RAMBharose Healthcare Dashboard 🏥

RAMBharose is a specialized AI-powered risk prediction and clinical intervention dashboard for NCD (Non-Communicable Diseases) management in rural settings.

## 🚀 Quick Start Guide for Teammates

Follow these steps to get the project working on your local machine:

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/singhviyashvi01/25_RAMBharose.git
cd 25_RAMBharose
```

### 3. Backend Setup (Virtual Environment)
```bash
# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 4. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 5. Environment Configuration 🔑
1. Locate the **`.env.example`** file in the root directory.
2. Create a new file named **`.env`** (important: do NOT commit this file to Git!).
   - We recommend placing a copy of this file in both the root and `backend/` directories.
3. Replace the placeholder values in `.env` with the actual **Supabase Keys** and **OpenAI API Key** provided by the project lead.

### 6. Running the Application
You can run both the Backend and Frontend with a single command from the root:
```bash
python run_api.py
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Frontend App**: [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure
- **/backend**: FastAPI server + ML prediction engine.
- **/frontend**: React dashboard with Vite and Chart.js.
- **/ml/saved_models**: Serialized risk prediction models.
- **sample_patients_50.csv**: Use this file in the "Upload" tab to test the system with clinical data.

---
**Need Help?**
If you encounter any module missing errors, ensure your virtual environment is active and run `pip install -r backend/requirements.txt` again.

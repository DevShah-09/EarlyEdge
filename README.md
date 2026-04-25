# EarlyEdge 🏥

## Overview
EarlyEdge is an AI-powered hospital intelligence platform designed for early detection and management of Non-Communicable Diseases (NCDs) such as Diabetes, Hypertension, and Cardiovascular Disease (CVD).

The platform enables hospitals to upload patient records, predict disease risks, automate care planning, optimize staff allocation, and identify areas requiring preventive outreach programs.

Built for modern healthcare systems, EarlyEdge combines Machine Learning, LangChain AI, clinical dashboards, and workflow automation to improve decision-making and patient outcomes.

## Live Demo
🔗 [https://earlyedge-frontend.onrender.com/signup](https://earlyedge-frontend.onrender.com/signup)

## Key Features
### 1. Patient Data Upload & Management
- Hospitals can upload patient records through forms or datasets.
- Centralized and structured patient database.
- Real-time access to records and analytics.

### 2. AI Risk Prediction Engine
Predicts disease probability for:
- **Diabetes** – 83.1% Accuracy
- **Hypertension** – 82.8% Accuracy
- **Cardiovascular Disease (CVD)** – 80.1% Accuracy

Models trained and evaluated:
- Logistic Regression
- Random Forest
- XGBoost
- LightGBM
- Voting Ensemble

Automatically selects best-performing models.

### 3. Personalized Care Plan Generator
Powered by LangChain AI:
- Auto-generates patient-specific care plans.
- Includes diet, activity, and follow-up suggestions.
- Requires doctor approval before sending.
- Approved plans can be emailed directly to patients.

### 4. Risk Simulator
Allows doctors to simulate how parameter changes affect risk:
- Weight reduction
- Improved BP levels
- Sugar control
- Smoking cessation
- Lifestyle changes

### 5. Smart Nurse Assignment
- Prioritizes high-risk patients.
- Assigns nurses based on urgency/workload.
- Improves follow-up efficiency.

### 6. Screening Camp Planner
- Detects high-risk geographical clusters.
- Suggests medical screening camps.
- Estimates staff/resources required.
- Helps hospitals plan preventive outreach.

### 7. Interactive Dashboard
- Patient statistics
- Disease trends
- Risk segmentation
- Resource planning
- Operational KPIs

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Chart.js
- **Backend**: Python, FastAPI
- **Database**: Supabase
- **AI / ML**: Scikit-learn, XGBoost, LightGBM, LangChain, Ensemble Models

## System Workflow
1. Hospital uploads patient records.
2. Data stored securely in database.
3. ML models predict disease risks.
4. Dashboard displays insights.
5. LangChain generates care plans.
6. Doctors approve recommendations.
7. Nurses / camps assigned for intervention.

## Use Cases
- Hospitals managing chronic disease populations
- Rural healthcare centers
- Preventive healthcare initiatives
- Outreach screening drives
- Risk-based patient prioritization

## Business Impact
- Early disease detection
- Better patient monitoring
- Reduced manual workload
- Smarter resource allocation
- Improved outreach planning
- Increased operational efficiency

---

## 🚀 Quick Start Guide for Teammates

Follow these steps to get the project working on your local machine:

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/DevShah-09/EarlyEdge.git
cd EarlyEdge
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

## 🛠️ Troubleshooting

### "Nothing happens when I upload a CSV"
If you select a file but the ingestion never finishes or shows an error:
1. **Check `.env`**: Ensure you have a `.env` file in the root with valid `SUPABASE_URL` and `SUPABASE_KEY`.
2. **Missing Dependencies**: Run `pip install -r backend/requirements.txt` to ensure all ML and API modules are installed.
3. **Check Terminal**: Look at the terminal running `python run_api.py`. If you see a `ValidationError` or `Supabase error`, it means your environment keys are incorrect.

### Dashboard is Blank
- Ensure the Backend API is running at `http://localhost:8000`.
- Refresh the page once the backend indicates "Database migration COMPLETED".

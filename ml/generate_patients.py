import pandas as pd
import random
from datetime import datetime, timedelta

def generate_historical_csv(filename="large_patient_dataset_5000.csv", num_patients=5000, months=1):
    """
    Generates a large dataset of synthetic patients for ML training.
    We'll set months=1 to get exactly 5000 records (one per patient).
    """
    patients = []
    
    first_names = ["Aarav", "Priya", "Ishaan", "Ananya", "Vihaan", "Aditi", "Sai", "Kavya", "Arjun", "Diya", 
                   "Rahul", "Sneha", "Karan", "Neha", "Rohan", "Riya", "Vikas", "Pooja", "Vikram", "Simran", 
                   "Deepak", "Swati", "Sanjay", "Megha", "Suresh", "Geeta", "Amit", "Sunita", "Rajesh", "Anita"]
    last_names = ["Sharma", "Verma", "Patel", "Singh", "Reddy", "Rao", "Kumar", "Iyer", "Chauhan", "Gupta", "Desai", "Nair", "Kulkarni", "Patil"]
    wards = [f"Ward {i:02d}" for i in range(1, 26)]
    
    for i in range(num_patients):
        p_name = random.choice(first_names) + " " + random.choice(last_names)
        p_age = random.randint(18, 90)
        p_ward = random.choice(wards)
        p_id = f"P-TRAIN-{i:05d}"
        
        # Randomly assign a risk profile to ensure variety in the training data
        profile = random.choices(["High", "Medium", "Normal"], weights=[0.15, 0.35, 0.50])[0]
        
        for m in range(months):
            date = datetime.now() - timedelta(days=random.randint(0, 30))
            date_str = date.strftime("%Y-%m-%d")
            
            # Generate Base Clinical Values based on profile
            if profile == "High":
                sbp = random.randint(140, 190)
                glucose = random.randint(130, 350)
                hba1c = round(random.uniform(6.5, 11.0), 1)
                cholesterol = random.randint(210, 320)
                bmi = round(random.uniform(27.0, 42.0), 1)
                smoking = random.choices([0, 1, 2], weights=[0.2, 0.3, 0.5])[0]
            elif profile == "Medium":
                sbp = random.randint(120, 155)
                glucose = random.randint(95, 150)
                hba1c = round(random.uniform(5.5, 7.5), 1)
                cholesterol = random.randint(180, 240)
                bmi = round(random.uniform(23.0, 32.0), 1)
                smoking = random.choices([0, 1, 2], weights=[0.4, 0.4, 0.2])[0]
            else:
                sbp = random.randint(95, 135)
                glucose = random.randint(70, 110)
                hba1c = round(random.uniform(4.2, 6.0), 1)
                cholesterol = random.randint(130, 200)
                bmi = round(random.uniform(19.0, 26.0), 1)
                smoking = random.choices([0, 1, 2], weights=[0.7, 0.2, 0.1])[0]

            # Introduce noise/overlap
            if random.random() < 0.15:
                sbp += random.randint(-20, 20)
                glucose += random.randint(-30, 30)
                hba1c = round(hba1c + random.uniform(-1.0, 1.0), 1)
                bmi = round(bmi + random.uniform(-5.0, 5.0), 1)
            
            # Probabilistic Disease Labeling (Ground Truth)
            # Instead of hard rules, we use probabilities to simulate real-world uncertainty
            
            # 1. Diabetes Probability
            diab_prob = 0.05
            if hba1c >= 6.5 or glucose >= 126: diab_prob = 0.85
            elif hba1c >= 5.7 or glucose >= 100: diab_prob = 0.40
            if bmi > 30: diab_prob += 0.15
            has_diabetes = 1 if random.random() < diab_prob else 0

            # 2. Hypertension Probability
            hyp_prob = 0.05
            if sbp >= 140: hyp_prob = 0.80
            elif sbp >= 130: hyp_prob = 0.35
            if p_age > 60: hyp_prob += 0.10
            has_hypertension = 1 if random.random() < hyp_prob else 0

            # 3. CVD Probability (Heart Disease)
            cvd_prob = 0.02
            if sbp > 160 or cholesterol > 240: cvd_prob = 0.70
            elif sbp > 140 or cholesterol > 200: cvd_prob = 0.30
            if smoking == 2: cvd_prob += 0.20
            if p_age > 65: cvd_prob += 0.15
            has_cvd = 1 if random.random() < cvd_prob else 0

            patients.append({
                "patient_id": p_id,
                "name": p_name,
                "age": p_age,
                "gender": random.choice(["M", "F"]),
                "ward": p_ward,
                "systolic_bp": max(80, sbp),
                "diastolic_bp": int((sbp * 0.65) + random.randint(-15, 15)),
                "blood_glucose_fasting": max(60, glucose),
                "hba1c": max(3.5, hba1c),
                "cholesterol_total": max(100, cholesterol),
                "bmi": max(15.0, bmi),
                "smoking_status": smoking,
                "physical_activity": random.randint(0, 2),
                "family_history_diabetes": random.choices([0, 1], weights=[0.7, 0.3])[0],
                "family_history_hypertension": random.choices([0, 1], weights=[0.6, 0.4])[0],
                "family_history_cvd": random.choices([0, 1], weights=[0.8, 0.2])[0],
                "has_diabetes": has_diabetes,
                "has_hypertension": has_hypertension,
                "has_cvd": has_cvd,
                "last_visit_date": date_str,
                "email": f"patient_{i}@example.com"
            })
            
    df = pd.DataFrame(patients)
    df.to_csv(filename, index=False)
    print(f"Generated {filename} with {len(df)} patient records.")

if __name__ == "__main__":
    generate_historical_csv()

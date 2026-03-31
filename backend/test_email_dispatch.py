import os
import sys

# Add the current directory to sys.path to allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
load_dotenv()

from backend.services.email_service import send_care_plan_email

def test_dispatch():
    print("Starting Email Dispatch Test...")
    
    mock_patient_name = "Abhishek"
    mock_email = "abhishek.shah.2001@gmail.com" # Using a known email for testing
    
    mock_plan_steps = [
        {
            "week": 1,
            "title": "Week 1: Diet & Hydration",
            "goal": "Reduce sodium intake and increase water",
            "actions": [
                "Limit salt to 1 teaspoon per day",
                "Drink at least 3 liters of water",
                "Avoid pickles and papad"
            ]
        },
        {
            "week": 2,
            "title": "Week 2: Physical Activity",
            "goal": "Establish a walking routine",
            "actions": [
                "30-minute brisk walk every morning",
                "Use stairs instead of elevator",
                "Track steps using a phone app"
            ]
        }
    ]
    
    print(f"Attempting to send email to {mock_email}...")
    success = send_care_plan_email(mock_patient_name, mock_email, mock_plan_steps)
    
    if success:
        print("SUCCESS: Email dispatch process completed.")
    else:
        print("FAILURE: Email dispatch failed. Check logs above.")

if __name__ == "__main__":
    test_dispatch()

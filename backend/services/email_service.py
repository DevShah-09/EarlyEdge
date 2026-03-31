import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict

# Email Configuration from Environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USER)

def send_care_plan_email(patient_name: str, email: str, plan_steps: List[Dict]):
    """
    Sends a personalized AI Care Plan to the patient's email address.
    """
    if not email or "@" not in email:
        print(f"Skipping email for {patient_name}: Invalid address '{email}'")
        return False

    # Check for credentials — if missing, we'll log the plan instead of erroring
    if not SMTP_USER or not SMTP_PASS:
        print("\n" + "!"*50)
        print(f"SIMULATION MODE: No SMTP credentials found in .env")
        print(f"MOCK EMAIL DISPATCH to: {email}")
        print(f"Subject: Your RAMBharose 30-Day Clinical Care Plan")
        print(f"Dear {patient_name},\n")
        print("Your localized intervention plan is ready:")
        for idx, step in enumerate(plan_steps):
            title = step.get('title', f"Step {idx+1}")
            goal = step.get('goal', 'Improve wellness')
            actions = step.get('actions', [])
            print(f"- {title}: {goal}")
            for action in actions:
                print(f"  * {action}")
        print("!"*50 + "\n")
        print("TIP: Add SMTP_USER and SMTP_PASS to .env to send real emails.")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        msg['Subject'] = f"Your RAMBharose Personalized Care Plan - {patient_name}"

        # ── Build Premium HTML Body ──────────────────────────────────────────
        steps_html = ""
        for s in plan_steps:
            title = s.get('title', 'Action Step')
            goal = s.get('goal', '')
            actions = s.get('actions', [])
            
            actions_list = "".join([f"<li style='margin-bottom: 6px;'>{a}</li>" for a in actions])
            
            steps_html += f"""
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 20px; border-radius: 0 12px 12px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 18px;">{title}</h3>
                <p style="margin: 0 0 12px 0; color: #3b82f6; font-weight: 600; font-size: 14px;">Goal: {goal}</p>
                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.5;">
                    {actions_list}
                </ul>
            </div>
            """
        
        body = f"""
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {{ font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.6; }}
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 40px; border-radius: 24px; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <span style="background-color: #eff6ff; color: #2563eb; padding: 8px 16px; border-radius: 12px; font-weight: 900; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">RAMBharose Clinical</span>
                        <h1 style="color: #0f172a; margin-top: 16px; font-size: 28px; font-weight: 800;">30-Day Care Plan</h1>
                    </div>
                    
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Based on your recent risk screening, our clinical team has developed a personalized roadmap to help you manage your health profile. Please follow the steps below carefully:</p>
                    
                    <div style="margin-top: 32px;">
                        {steps_html}
                    </div>
                    
                    <div style="margin-top: 40px; padding-top: 24px; border-t: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                        <p>This is an automated notification. For urgent medical concerns, please consult your assigned ASHA worker or local PHC immediately.</p>
                        <p>&copy; 2026 RAMBharose Healthcare Platform</p>
                    </div>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        
        print(f"Successfully sent care plan to {email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
        return False

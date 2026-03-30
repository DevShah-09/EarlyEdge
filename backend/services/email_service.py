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
        print("\n" + "="*50)
        print(f"📧 MOCK EMAIL DISPATCH to: {email}")
        print(f"Subject: Your RAMBharose 30-Day Clinical Care Plan")
        print(f"Dear {patient_name},\n")
        print("Your localized intervention plan is ready:")
        for idx, step in enumerate(plan_steps):
            print(f"{idx+1}. {step['title']}: {step['description']}")
        print("="*50 + "\n")
        print("💡 TIP: Add SMTP_USER and SMTP_PASS to .env to send real emails.")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        msg['Subject'] = f"Your RAMBharose Personalized Care Plan - {patient_name}"

        # Build HTML Body
        steps_html = "".join([
            f"<li><strong>{s['title']}</strong>: {s['description']}</li>" 
            for s in plan_steps
        ])
        
        body = f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
                <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #2563eb;">RAMBharose Clinical Intervention</h2>
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Based on your recent clinical screening, our medical team has approved a personalized 30-day care plan for you:</p>
                    <ul style="line-height: 1.6;">
                        {steps_html}
                    </ul>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #64748b;">
                        This is an automated clinical notification. Please consult your ASHA worker for any immediate concerns.
                    </p>
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

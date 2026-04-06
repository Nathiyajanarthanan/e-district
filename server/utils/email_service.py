import os
import requests
import textwrap
import base64
from utils.pdf_generator import generate_certificate

def send_status_update_email(applicant_email, applicant_name, service_name, status, remarks, app_id=None):
    """
    Sends an email to the applicant about their service status update.
    If RESEND_API_KEY is not set, it mocks the email in the console.
    """
    api_key = os.environ.get("RESEND_API_KEY")
    
    subject = f"Update on your {service_name} Application"
    
    html_body = textwrap.dedent(f"""\
        <h2>Application Status Update</h2>
        <p>Dear {applicant_name},</p>
        <p>The status of your recent application for <strong>{service_name}</strong> has been updated.</p>
        <p><strong>New Status:</strong> <span style="padding: 4px 8px; border-radius: 4px; background: {'#dcfce7; color: #166534' if status == 'Approved' else '#fee2e2; color: #991b1b'};">{status}</span></p>
        {'<p><strong>Admin Remarks:</strong> ' + remarks + '</p>' if remarks else ''}
        <br/>
        <p>Thank you,<br/>e-District Administration</p>
    """)
    
    attachments = []
    if status == 'Approved' and app_id:
        try:
            pdf_bytes = generate_certificate(applicant_name, service_name, app_id)
            b64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
            attachments.append({
                "filename": f"{service_name.replace(' ', '_')}_Certificate.pdf",
                "content": b64_pdf
            })
            html_body += "<hr/><p><strong>Congratulations!</strong> Your official certificate has been generated securely and is attached to this email.</p>"
        except Exception as e:
            print("Failed to generate PDF:", e)

    if not api_key:
        print("\n" + "="*50)
        print("📧 MOCK EMAIL DISPATCHED (No RESEND_API_KEY configured)")
        print(f"TO: {applicant_email}")
        print(f"SUBJECT: {subject}")
        print("-" * 50)
        print(html_body)
        print("="*50 + "\n")
        return True

    # Real Email via Resend API
    payload = {
        "from": "onboarding@resend.dev",
        "to": [applicant_email],
        "subject": subject,
        "html": html_body
    }
    
    if attachments:
        payload["attachments"] = attachments

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        if response.status_code in [200, 201]:
            print(f"Email sent successfully to {applicant_email}")
            return True
        else:
            print(f"Failed to send email: {response.text}")
            return False
    except Exception as e:
        print(f"Exception sending email: {e}")
        return False

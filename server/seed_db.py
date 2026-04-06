import os
import sys

# Change to the current script's directory so imports work
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, User, Service
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # 1. Create an Admin User if it doesn't exist
    admin_email = "admin@edistrict.gov"
    if not User.query.filter_by(email=admin_email).first():
        admin = User(
            full_name="System Administrator",
            email=admin_email,
            password_hash=generate_password_hash("admin123", method="pbkdf2:sha256"),
            role="ADMIN"
        )
        db.session.add(admin)
        print(f"Created admin account: {admin_email} / admin123")

    # 2. Add some mock Services if they don't exist
    services_to_add = [
        {
            "name": "Income Certificate",
            "description": "Apply for an official Income Certificate. Required for various subsidies and educational scholarships.",
            "required_documents": "Aadhar Card, Salary Slip / Affidavit, Ration Card",
            "fee": 50.0
        },
        {
            "name": "Birth Certificate",
            "description": "Official document recording the birth of a child. Required for school admissions and passports.",
            "required_documents": "Hospital Discharge Summary, Parents Aadhar Card",
            "fee": 100.0
        },
        {
            "name": "Caste Certificate",
            "description": "Certifies a candidate's belonging to a particular scheduled caste, tribe, or backward class.",
            "required_documents": "Proof of Residence, Aadhar Card, School Transfer Certificate",
            "fee": 25.0
        },
        {
            "name": "Domicile Certificate",
            "description": "Proves that the person bearing the certificate is a resident of a particular state / union territory.",
            "required_documents": "Voter ID, Electricity Bill, Age Proof",
            "fee": 150.0
        }
    ]

    added_count = 0
    for s in services_to_add:
        if not Service.query.filter_by(name=s["name"]).first():
            new_service = Service(
                name=s["name"],
                description=s["description"],
                required_documents=s["required_documents"],
                fee=s["fee"]
            )
            db.session.add(new_service)
            added_count += 1
            
    db.session.commit()
    print(f"Database seeded successfully. Added {added_count} new services.")

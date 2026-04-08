import os
from dotenv import load_dotenv
load_dotenv() # Load variables from .env file

from flask import Flask
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.services import services_bp
from routes.applications import applications_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuration
    base_dir = os.path.abspath(os.path.dirname(__file__))
    
    # Database Configuration (PostgreSQL for Render/Vercel)
    database_url = os.environ.get("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url or f"sqlite:///{os.path.join(base_dir, 'edistrict.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "super-secret-key-for-dev")
    app.config["UPLOAD_FOLDER"] = os.path.join(base_dir, "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024 # 50MB max upload size

    # CORS Configuration
    frontend_url = os.environ.get("FRONTEND_URL", "*")
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(services_bp, url_prefix="/api/services")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    with app.app_context():
        db.create_all()
        seed_db()

    return app

def seed_db():
    from models import User, Service
    from werkzeug.security import generate_password_hash
    
    # 1. Create Admin
    admin_email = "admin@edistrict.gov"
    if not User.query.filter_by(email=admin_email).first():
        admin = User(
            full_name="System Administrator",
            email=admin_email,
            password_hash=generate_password_hash("admin123"),
            role="ADMIN"
        )
        db.session.add(admin)
        print(f"Seeded admin: {admin_email}")

    # 2. Create Default Services
    services_to_add = [
        # Personal & Identity Certificates
        {"name": "Income Certificate", "category": "Personal & Identity Certificates", "description": "Official document certifying the annual income of an individual/family.", "required_documents": "Aadhar Card, Salary Slip, Ration Card", "fee": 50.0},
        {"name": "Caste Certificate", "category": "Personal & Identity Certificates", "description": "Certificate proving that an individual belongs to a particular caste.", "required_documents": "Residence Proof, Aadhar Card, School TC", "fee": 25.0},
        {"name": "Domicile Certificate", "category": "Personal & Identity Certificates", "description": "Proof of permanent residence in a specific state or district.", "required_documents": "Voter ID, Electricity Bill, Age Proof", "fee": 60.0},
        
        # Family & Relationship Certificates
        {"name": "Marriage Certificate", "category": "Family & Relationship Certificates", "description": "Official statement that two people are married.", "required_documents": "Marriage Invitation, Photos, Witnesses ID", "fee": 200.0},
        {"name": "Dependency Certificate", "category": "Family & Relationship Certificates", "description": "Verification of family members dependent on the applicant.", "required_documents": "Ration Card, Family Declaration", "fee": 40.0},

        # Social Welfare Certificates
        {"name": "Old Age Pension", "category": "Social Welfare Certificates", "description": "Application for monthly financial assistance for senior citizens.", "required_documents": "Age Proof, Bank Passbook, BPL Card", "fee": 0.0},
        {"name": "Widow Pension", "category": "Social Welfare Certificates", "description": "Monthly financial support for widows in need.", "required_documents": "Death Certificate of Husband, Bank Details", "fee": 0.0},
        {"name": "Disability Certificate", "category": "Social Welfare Certificates", "description": "Proof of disability for seeking government benefits.", "required_documents": "Medical Reports, Photo, Aadhar Card", "fee": 0.0},

        # Special Case Certificates
        {"name": "Solvency Certificate", "category": "Special Case Certificates", "description": "Certification of a person's financial creditworthiness.", "required_documents": "Property Documents, Bank Statements", "fee": 500.0},
        {"name": "Survival Certificate", "category": "Special Case Certificates", "description": "Required for legal heirs to claim benefits of deceased persons.", "required_documents": "Death Certificate, Family Tree", "fee": 100.0},

        # Property & Financial Certificates
        {"name": "Land Valuation Certificate", "category": "Property & Financial Certificates", "description": "Certified value of land as per current market rates.", "required_documents": "Patta/Chitta, Survey Map", "fee": 150.0},
        {"name": "Encumbrance Certificate", "category": "Property & Financial Certificates", "description": "Evidence that the property is free from any liability.", "required_documents": "Sale Deed, Property Tax Receipt", "fee": 120.0},

        # Vital Records
        {"name": "Birth Certificate", "category": "Vital Records", "description": "Registration of a child's birth for official record.", "required_documents": "Hospital Summary, Parents Aadhar Card", "fee": 100.0},
        {"name": "Death Certificate", "category": "Vital Records", "description": "Official document recording the date and cause of death.", "required_documents": "Hospital Death Report, Aadhar of Deceased", "fee": 100.0}
    ]

    for s in services_to_add:
        if not Service.query.filter_by(name=s["name"]).first():
            new_service = Service(
                name=s["name"],
                category=s["category"],
                description=s["description"],
                required_documents=s["required_documents"],
                fee=s["fee"]
            )
            db.session.add(new_service)
    
    db.session.commit()

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

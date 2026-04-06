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
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(base_dir, 'edistrict.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "super-secret-key-for-dev")
    app.config["UPLOAD_FOLDER"] = os.path.join(base_dir, "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024 # 50MB max upload size

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
        {"name": "Income Certificate", "category": "Legal & Personal", "description": "Apply for an official Income Certificate.", "required_documents": "Aadhar Card, Salary Slip, Ration Card", "fee": 50.0},
        {"name": "Birth Certificate", "category": "Identity & Vital Records", "description": "Register for a Birth Certificate.", "required_documents": "Hospital Summary, Parents Aadhar Card", "fee": 100.0},
        {"name": "Caste Certificate", "category": "Identity & Vital Records", "description": "Apply for a Caste Certificate.", "required_documents": "Residence Proof, Aadhar Card, School TC", "fee": 25.0},
        {"name": "Domicile Certificate", "category": "Legal & Personal", "description": "Apply for Residence Proof.", "required_documents": "Voter ID, Electricity Bill, Age Proof", "fee": 150.0}
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

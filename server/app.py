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

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

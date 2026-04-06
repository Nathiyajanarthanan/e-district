from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    admin = User.query.filter_by(role='ADMIN').first()
    if not admin:
        admin = User(
            full_name='System Administrator', 
            email='admin@edistrict.gov', 
            password_hash=generate_password_hash('admin123'), 
            role='ADMIN'
        )
        db.session.add(admin)
        db.session.commit()
        print('CREATED: admin@edistrict.gov / admin123')
    else:
        admin.password_hash = generate_password_hash('admin123')
        db.session.commit()
        print(f'RESET: {admin.email} / admin123')

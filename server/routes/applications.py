import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models import db, Application, Document, Service
from utils.auth_middleware import token_required, admin_required
from utils.email_service import send_status_update_email

applications_bp = Blueprint('applications', __name__)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@applications_bp.route('/', methods=['POST'])
@token_required
def create_application(current_user):
    """
    Handle new application submission along with multiple documents in multipart/form-data
    There are NO RESTRICTIONS on the number of documents uploaded.
    """
    if 'service_id' not in request.form:
        return jsonify({"message": "service_id is required"}), 400

    service_id = request.form.get('service_id')
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    # Create the application with extra info
    import json
    application = Application(
        user_id=current_user.id,
        service_id=service_id,
        applicant_name=request.form.get('applicant_name'),
        age=request.form.get('age'),
        address=request.form.get('address'),
        phone=request.form.get('phone'),
        extra_fields=request.form.get('extra_fields', '{}'),
        status="Pending"
    )
    db.session.add(application)
    db.session.flush() # To get application.id

    # Process all uploaded documents
    uploaded_files = request.files.getlist("documents")
    for file in uploaded_files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save file locally
            file.save(filepath)

            # Store in DB
            document = Document(
                application_id=application.id,
                file_name=filename,
                file_path=unique_filename
            )
            db.session.add(document)

    db.session.commit()
    return jsonify({"message": "Application submitted successfully", "application_id": application.id}), 201


@applications_bp.route('/my', methods=['GET'])
@token_required
def get_my_applications(current_user):
    apps = Application.query.filter_by(user_id=current_user.id).all()
    result = []
    for app in apps:
        result.append({
            "id": app.id,
            "service_name": app.service.name,
            "status": app.status,
            "remarks": app.remarks,
            "created_at": app.created_at.isoformat(),
            "documents_count": len(app.documents)
        })
    return jsonify(result), 200


@applications_bp.route('/all', methods=['GET'])
@admin_required
def get_all_applications(current_user):
    apps = Application.query.all()
    result = []
    for app in apps:
        result.append({
            "id": app.id,
            "user_name": app.user.full_name,
            "user_email": app.user.email,
            "service_name": app.service.name,
            "status": app.status,
            "remarks": app.remarks,
            "created_at": app.created_at.isoformat(),
            "documents_count": len(app.documents)
        })
    return jsonify(result), 200

@applications_bp.route('/<int:app_id>', methods=['GET'])
@token_required
def get_application_details(current_user, app_id):
    app = Application.query.get_or_404(app_id)
    
    if current_user.role != "ADMIN" and app.user_id != current_user.id:
        return jsonify({"message": "Unauthorized access to application"}), 403
        
    documents = [{"id": d.id, "file_name": d.file_name, "url": f"/api/applications/download/{d.id}"} for d in app.documents]
    
    import json
    return jsonify({
        "id": app.id,
        "service_name": app.service.name,
        "applicant_name": app.applicant_name,
        "age": app.age,
        "address": app.address,
        "phone": app.phone,
        "extra_fields": json.loads(app.extra_fields) if app.extra_fields else {},
        "status": app.status,
        "remarks": app.remarks,
        "created_at": app.created_at.isoformat(),
        "documents": documents
    }), 200

@applications_bp.route('/<int:app_id>/status', methods=['PUT'])
@admin_required
def update_application_status(current_user, app_id):
    app = Application.query.get_or_404(app_id)
    data = request.get_json()
    
    if 'status' in data: app.status = data['status']
    if 'remarks' in data: app.remarks = data['remarks']
    
    db.session.commit()
    
    # Trigger Email Notification
    send_status_update_email(
        applicant_email=app.user.email,
        applicant_name=app.applicant_name or app.user.full_name,
        service_name=app.service.name,
        status=app.status,
        remarks=app.remarks
    )
    
    return jsonify({"message": "Application status updated"}), 200

@applications_bp.route('/download/<int:doc_id>', methods=['GET'])
@token_required
def download_document(current_user, doc_id):
    doc = Document.query.get_or_404(doc_id)
    app = Application.query.get(doc.application_id)
    
    if current_user.role != "ADMIN" and app.user_id != current_user.id:
        return jsonify({"message": "Unauthorized"}), 403

    return send_from_directory(
        current_app.config['UPLOAD_FOLDER'], 
        doc.file_path,
        as_attachment=True,
        download_name=doc.file_name
    )

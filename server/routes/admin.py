from flask import Blueprint, request, jsonify, current_app
from models import db, Application, AdminLog
from utils.auth_middleware import admin_required
from utils.email_service import send_status_update_email
import json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/applications', methods=['GET'])
@admin_required
def get_all_applications(current_user):
    apps = Application.query.all()
    result = []
    
    summary = {
        "Total": len(apps),
        "Pending": 0,
        "Approved": 0,
        "Rejected": 0
    }
    
    for app in apps:
        if app.status in summary:
            summary[app.status] += 1
            
        result.append({
            "id": app.id,
            "user_name": app.user.full_name,
            "user_email": app.user.email,
            "service_name": app.service.name,
            "applicant_name": app.applicant_name,
            "age": app.age,
            "address": app.address,
            "phone": app.phone,
            "extra_fields": json.loads(app.extra_fields) if app.extra_fields else {},
            "status": app.status,
            "remarks": app.remarks,
            "created_at": app.created_at.isoformat(),
            "documents_count": len(app.documents)
        })
        
    return jsonify({
       "applications": result,
       "summary": summary
    }), 200

def handle_status_update(current_user, app_id, status):
    app = Application.query.get_or_404(app_id)
    data = request.get_json() or {}
    remarks = data.get('remarks', '')
    
    app.status = status
    app.remarks = remarks
    
    log = AdminLog(
        admin_id=current_user.id,
        application_id=app.id,
        action=status.upper(),
        remarks=remarks
    )
    
    db.session.add(log)
    db.session.commit()
    
    send_status_update_email(
        applicant_email=app.user.email,
        applicant_name=app.applicant_name or app.user.full_name,
        service_name=app.service.name,
        status=app.status,
        remarks=app.remarks,
        app_id=app.id
    )
    
    return jsonify({"message": f"Application {status.lower()} successfully!"}), 200

@admin_bp.route('/application/<int:app_id>/approve', methods=['PUT'])
@admin_required
def approve_application(current_user, app_id):
    return handle_status_update(current_user, app_id, "Approved")

@admin_bp.route('/application/<int:app_id>/reject', methods=['PUT'])
@admin_required
def reject_application(current_user, app_id):
    return handle_status_update(current_user, app_id, "Rejected")

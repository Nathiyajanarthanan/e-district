from flask import Blueprint, request, jsonify
from models import db, Service
from utils.auth_middleware import admin_required

services_bp = Blueprint('services', __name__)

@services_bp.route('/', methods=['GET'])
def get_services():
    services = Service.query.all()
    return jsonify([{
        "id": s.id,
        "name": s.name,
        "description": s.description,
        "category": s.category,
        "required_documents": s.required_documents,
        "fee": s.fee
    } for s in services]), 200

@services_bp.route('/', methods=['POST'])
@admin_required
def create_service(current_user):
    data = request.get_json()
    if not data or not data.get('name') or not data.get('description'):
        return jsonify({"message": "Missing required fields"}), 400
    
    new_service = Service(
        name=data['name'],
        description=data['description'],
        category=data.get('category', 'Uncategorized'),
        required_documents=data.get('required_documents', ''),
        fee=data.get('fee', 0.0)
    )
    
    db.session.add(new_service)
    db.session.commit()
    
    return jsonify({"message": "Service created successfully"}), 201

@services_bp.route('/<int:service_id>', methods=['PUT'])
@admin_required
def update_service(current_user, service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()
    
    if 'name' in data: service.name = data['name']
    if 'description' in data: service.description = data['description']
    if 'category' in data: service.category = data['category']
    if 'required_documents' in data: service.required_documents = data['required_documents']
    if 'fee' in data: service.fee = data['fee']
    
    db.session.commit()
    return jsonify({"message": "Service updated successfully"}), 200

@services_bp.route('/<int:service_id>', methods=['DELETE'])
@admin_required
def delete_service(current_user, service_id):
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted successfully"}), 200

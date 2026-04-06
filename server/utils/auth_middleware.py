from functools import wraps
from flask import request, jsonify, current_app
import jwt
from models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header format: Bearer <token>
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if len(auth_header.split()) == 2:
                token = auth_header.split()[1]
        
        if not token:
            return jsonify({"message": "Token is missing or invalid format!"}), 401

        try:
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data["user_id"]).first()
            if not current_user:
                 return jsonify({"message": "Token is invalid, user not found!"}), 401
        except Exception as e:
            return jsonify({"message": "Token is invalid or expired!"}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if len(auth_header.split()) == 2:
                token = auth_header.split()[1]
        
        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data["user_id"]).first()
            if not current_user or current_user.role != "ADMIN":
                 return jsonify({"message": "Admin privileges required!"}), 403
        except Exception as e:
            return jsonify({"message": "Token is invalid!"}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

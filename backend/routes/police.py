from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId

police_routes = Blueprint('police', __name__)

@police_routes.route('/api/police/stations', methods=['GET'])
def get_police_stations():
    # Mock data for police stations
    stations = [
        {
            "id": "1",
            "name": "Central Police Station",
            "address": "123 Main Street, City Center",
            "phone": "+91 1234567890",
            "location": {"lat": 19.0760, "lng": 72.8777}
        },
        {
            "id": "2",
            "name": "North Police Station",
            "address": "456 North Avenue, North District",
            "phone": "+91 2345678901",
            "location": {"lat": 19.1136, "lng": 72.8697}
        },
        {
            "id": "3",
            "name": "South Police Station",
            "address": "789 South Road, South District",
            "phone": "+91 3456789012",
            "location": {"lat": 19.0330, "lng": 72.8353}
        }
    ]
    
    return jsonify(stations), 200

@police_routes.route('/api/police/ipc-sections', methods=['GET'])
def get_ipc_sections():
    from app import mongo
    
    # Get IPC sections from database
    sections = list(mongo.db.ipc_sections.find())
    
    # Convert ObjectId to string
    for section in sections:
        if "_id" in section:
            section["id"] = str(section.pop("_id"))
    
    return jsonify(sections), 200

@police_routes.route('/api/police/legal-rights', methods=['GET'])
def get_legal_rights():
    from app import mongo
    
    # Get legal rights from database
    rights = list(mongo.db.legal_rights.find())
    
    # Convert ObjectId to string
    for right in rights:
        if "_id" in right:
            right["id"] = str(right.pop("_id"))
    
    return jsonify(rights), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime, timezone
import re

complaint_routes = Blueprint('complaints', __name__)

# Helper function to validate phone number
def is_valid_phone(phone):
    pattern = r"^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$"
    return bool(re.match(pattern, phone))

@complaint_routes.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    from app import mongo
    
    current_user = get_jwt_identity()
    data = request.get_json()
    
    text = data.get('text')
    language = data.get('language')
    
    # If police is creating complaint on behalf of victim
    victim_phone = data.get('victim_phone')
    victim_name = data.get('victim_name')
    victim_details = data.get('victim_details', {})
    
    if not text or not language:
        return jsonify({"error": "Complaint text and language are required"}), 400
    
    # Handle complaint creation by police on behalf of victim
    if current_user["role"] == "police" and victim_phone:
        # Format phone number
        if not victim_phone.startswith('+'):
            if victim_phone.startswith('91'):
                victim_phone = '+' + victim_phone
            else:
                victim_phone = '+91' + victim_phone
        
        if not is_valid_phone(victim_phone):
            return jsonify({"error": "Invalid victim phone number format"}), 400
        
        if not victim_name:
            return jsonify({"error": "Victim name is required"}), 400
        
        # Check if victim exists
        victim = mongo.db.victims.find_one({"phone": victim_phone})
        
        # If victim doesn't exist, check pre-registered victims
        if not victim:
            pre_registered = mongo.db.pre_registered_victims.find_one({"phone": victim_phone})
            
            if pre_registered:
                # Use pre-registered data
                complainant_id = str(pre_registered["_id"])
                complainant_name = pre_registered["name"]
            else:
                # Create pre-registered victim
                victim_data = {
                    "name": victim_name,
                    "phone": victim_phone,
                    "created_at": datetime.now(timezone.utc),
                    "registered_by": {
                        "id": current_user["id"],
                        "name": current_user["name"]
                    }
                }
                
                # Add additional victim details if provided
                if victim_details:
                    victim_data.update(victim_details)
                
                result = mongo.db.pre_registered_victims.insert_one(victim_data)
                complainant_id = str(result.inserted_id)
                complainant_name = victim_name
        else:
            # Use existing victim data
            complainant_id = str(victim["_id"])
            complainant_name = victim["name"]
        
        # Create complaint for victim
        complaint = {
            "text": text,
            "language": language,
            "status": "pending",
            "complainantId": complainant_id,
            "complainantName": complainant_name,
            "complainantPhone": victim_phone,
            "filedAt": datetime.now(timezone.utc).isoformat(),
            "filedBy": {
                "id": current_user["id"],
                "name": current_user["name"],
                "role": "police"
            }
        }
    else:
        # Regular complaint created by victim
        complaint = {
            "text": text,
            "language": language,
            "status": "pending",
            "complainantId": current_user["id"],
            "complainantName": current_user["name"],
            "complainantPhone": current_user.get("phone"),
            "filedAt": datetime.now(timezone.utc).isoformat(),
        }
    
    result = mongo.db.complaints.insert_one(complaint)
    complaint["id"] = str(result.inserted_id)
    
    return jsonify({
        "message": "Complaint filed successfully",
        "complaint": complaint
    }), 201

@complaint_routes.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    from app import mongo
    
    current_user_identity = get_jwt_identity()
    
    try:
        # Parse the identity string
        user_id, role, name = current_user_identity.split(':', 2)
        
        if role == "victim":
            # Return only complaints filed by this victim
            complaints = list(mongo.db.complaints.find({"complainantId": user_id}))
        else:
            # For police officers, return all complaints
            complaints = list(mongo.db.complaints.find())
        
        # Convert ObjectId to string
        for complaint in complaints:
            complaint["id"] = str(complaint.pop("_id"))
        
        return jsonify(complaints), 200
    except Exception as e:
        print(f"Error processing complaints request: {e}")
        return jsonify({"error": "Error retrieving complaints"}), 400

@complaint_routes.route('/api/complaints/<complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    from app import mongo
    
    current_user_identity = get_jwt_identity()
    
    try:
        # Parse the identity string
        user_id, role, name = current_user_identity.split(':', 2)
        
        complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
        
        # Check if user has access to this complaint
        if role == "victim" and complaint["complainantId"] != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        complaint["id"] = str(complaint.pop("_id"))
        
        return jsonify(complaint), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@complaint_routes.route('/api/complaints/analyze', methods=['POST'])
@jwt_required()
def analyze_complaint():
    data = request.get_json()
    text = data.get('text')
    language = data.get('language')
    
    if not text or not language:
        return jsonify({"error": "Text and language are required"}), 400
    
    # Here you would typically call your AI model or service
    # For now, we'll return mock data based on the frontend types
    
    # Mock analysis result
    analysis_result = {
        "suggestions": [
            {
                "section": "IPC 354",
                "description": "Assault or criminal force to woman with intent to outrage her modesty",
                "act": "Indian Penal Code",
                "isCognizable": True,
                "isBailable": False,
                "punishment": "Imprisonment up to 5 years and fine"
            },
            {
                "section": "IPC 509",
                "description": "Word, gesture or act intended to insult the modesty of a woman",
                "act": "Indian Penal Code",
                "isCognizable": True,
                "isBailable": True,
                "punishment": "Imprisonment up to 3 years and fine"
            }
        ],
        "judgments": [
            {
                "title": "Vishaka vs State of Rajasthan",
                "year": 1997,
                "summary": "Landmark case that defined sexual harassment at workplace",
                "fullText": "The Supreme Court of India laid down guidelines for preventing sexual harassment at workplace...",
                "citation": "AIR 1997 SC 3011"
            }
        ],
        "proceduralSteps": [
            "File a written complaint at the police station",
            "Get a medical examination if there was physical contact",
            "Record your statement before a Magistrate under Section 164 CrPC",
            "Cooperate with the police investigation",
            "Identify the accused in an identification parade if required"
        ]
    }
    
    return jsonify(analysis_result), 200

@complaint_routes.route('/api/complaints/<complaint_id>', methods=['PATCH'])
@jwt_required()
def update_complaint(complaint_id):
    from app import mongo
    
    current_user = get_jwt_identity()
    data = request.get_json()
    
    if current_user["role"] != "police":
        return jsonify({"error": "Only police officers can update complaints"}), 403
    
    try:
        complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
        
        # Update allowed fields
        updates = {}
        if 'status' in data:
            updates["status"] = data["status"]
        if 'firNumber' in data:
            updates["firNumber"] = data["firNumber"]
        if 'appliedSections' in data:
            updates["appliedSections"] = data["appliedSections"]
        if 'assignedOfficer' in data:
            updates["assignedOfficer"] = data["assignedOfficer"]
        if 'analysisResult' in data:
            updates["analysisResult"] = data["analysisResult"]
        
        if updates:
            updates["updatedAt"] = datetime.now(timezone.utc).isoformat()
            mongo.db.complaints.update_one(
                {"_id": ObjectId(complaint_id)}, 
                {"$set": updates}
            )
        
        updated_complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        updated_complaint["id"] = str(updated_complaint.pop("_id"))
        
        return jsonify(updated_complaint), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

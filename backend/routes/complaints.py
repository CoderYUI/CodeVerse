from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime, timezone
import re
from utils.notifications import send_complaint_confirmation_sms, send_status_update_sms

complaint_routes = Blueprint('complaints', __name__)

# Helper function to validate phone number
def is_valid_phone(phone):
    pattern = r"^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$"
    return bool(re.match(pattern, phone))

# Helper function to parse the JWT identity string
def parse_identity(identity_string):
    parts = identity_string.split(':', 2)
    if len(parts) == 3:
        return {
            "id": parts[0],
            "role": parts[1],
            "name": parts[2]
        }
    return None

@complaint_routes.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    """Create a new complaint submitted by a victim"""
    try:
        current_user = get_jwt_identity()
        user_id, user_role, user_name = current_user.split(':', 2)
        
        # Verify the user is a victim
        if user_role != 'victim':
            return jsonify({"error": "Only victims can file complaints"}), 403
        
        data = request.json
        
        # Validate the input
        if not data or not data.get('text'):
            return jsonify({"error": "Complaint text is required"}), 400
        
        # Get the user information from MongoDB
        victim = mongo.db.victims.find_one({"_id": ObjectId(user_id)})
        if not victim:
            return jsonify({"error": "Victim not found"}), 404
        
        # Create the complaint document
        complaint = {
            "text": data["text"],
            "language": data.get("language", "en"),
            "status": "pending",
            "complainantId": user_id,
            "complainantName": user_name,
            "complainantPhone": victim.get("phone"),
            "filedAt": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert the complaint into MongoDB
        result = mongo.db.complaints.insert_one(complaint)
        
        # Add ID to the response
        complaint["id"] = str(result.inserted_id)
        
        return jsonify({
            "success": True,
            "message": "Complaint filed successfully",
            "complaint": complaint
        }), 201
        
    except Exception as e:
        print(f"Error in create_complaint: {e}")
        return jsonify({"error": str(e)}), 500

@complaint_routes.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    from app import mongo
    
    current_user_identity = get_jwt_identity()
    current_user = parse_identity(current_user_identity)
    
    if not current_user:
        return jsonify({"error": "Invalid user identity"}), 400
    
    try:
        if current_user["role"] == "victim":
            # Return only complaints filed by this victim
            # Don't include full text for privacy in the listing
            complaints = list(mongo.db.complaints.find(
                {"complainantId": current_user["id"]},
                {"text": 1, "status": 1, "filedAt": 1, "firNumber": 1, 
                 "complainantName": 1, "currentStage": 1, "_id": 1}
            ))
        else:
            # For police officers, return all complaints with full details
            complaints = list(mongo.db.complaints.find())
        
        # Convert ObjectId to string
        for complaint in complaints:
            complaint["id"] = str(complaint.pop("_id"))
            
            # For victims, only return a truncated version of the text for privacy
            if current_user["role"] == "victim" and "text" in complaint:
                # Store the length of the original text
                complaint["textLength"] = len(complaint["text"])
                # Truncate text for the listing to preserve privacy
                if len(complaint["text"]) > 100:
                    complaint["text"] = complaint["text"][:100] + "..."
        
        return jsonify(complaints), 200
    except Exception as e:
        print(f"Error processing complaints request: {e}")
        return jsonify({"error": "Error retrieving complaints"}), 400

@complaint_routes.route('/api/complaints/<complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    from app import mongo
    
    current_user_identity = get_jwt_identity()
    current_user = parse_identity(current_user_identity)
    
    if not current_user:
        return jsonify({"error": "Invalid user identity"}), 400
    
    try:
        # Always fetch the complete complaint with full text
        complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
        
        # Check if user has access to this complaint
        if current_user["role"] == "victim" and complaint["complainantId"] != current_user["id"]:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Add ID
        complaint["id"] = str(complaint.pop("_id"))
        
        # If the user is a police officer, fetch additional victim information
        if current_user["role"] == "police" and "complainantId" in complaint:
            victim_id = complaint["complainantId"]
            
            # Try to find the victim in the victims collection
            victim = mongo.db.victims.find_one({"_id": ObjectId(victim_id)})
            
            # If not found, try in pre-registered victims
            if not victim and "complainantPhone" in complaint:
                victim = mongo.db.pre_registered_victims.find_one({"phone": complaint["complainantPhone"]})
            
            # If we found victim info, add address and ID proof to the complaint
            if victim:
                complaint["complainantAddress"] = victim.get("address", "Not available")
                complaint["complainantIdProof"] = victim.get("id_proof", "Not available")
        
        # Ensure we're always sending the full text in GET single complaint endpoint
        # No text truncation here
        
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
    from app import mongo, twilio_client, TWILIO_PHONE_NUMBER
    
    current_user_identity = get_jwt_identity()
    current_user = parse_identity(current_user_identity)
    
    if not current_user:
        return jsonify({"error": "Invalid user identity"}), 400
    
    if current_user["role"] != "police":
        return jsonify({"error": "Only police officers can update complaints"}), 403
    
    data = request.get_json()  # Get the request data
    
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
            
            # Send notification if status was changed
            if 'status' in updates and twilio_client and TWILIO_PHONE_NUMBER:
                try:
                    # Get the complaint with victim contact info
                    updated_complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
                    victim_phone = updated_complaint.get("complainantPhone")
                    
                    if victim_phone:
                        # Get additional details for the message
                        details = None
                        if updates["status"] == "filed" and "firNumber" in updates:
                            details = f"FIR Number: {updates['firNumber']}"
                        
                        notification_result = send_status_update_sms(
                            twilio_client,
                            TWILIO_PHONE_NUMBER,
                            victim_phone,
                            complaint_id,
                            updates["status"],
                            details
                        )
                        
                        if notification_result["success"]:
                            print(f"Status update SMS sent: {notification_result['sid']}")
                            # Store notification history
                            mongo.db.notifications.insert_one({
                                "complaintId": complaint_id,
                                "recipientPhone": victim_phone,
                                "type": "status_update",
                                "message": notification_result["message"],
                                "status": "sent",
                                "sentAt": datetime.now(timezone.utc).isoformat(),
                                "twilioSid": notification_result.get("sid")
                            })
                        else:
                            print(f"Failed to send status update SMS: {notification_result['error']}")
                except Exception as e:
                    print(f"Error sending status update notification: {str(e)}")
        
        # Get updated complaint to return
        updated_complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        updated_complaint["id"] = str(updated_complaint.pop("_id"))
        return jsonify(updated_complaint), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@complaint_routes.route('/api/complaints/<complaint_id>/notes', methods=['GET'])
@jwt_required()
def get_complaint_notes(complaint_id):
    from app import mongo
    
    current_user_identity = get_jwt_identity()
    current_user = parse_identity(current_user_identity)
    
    if not current_user:
        return jsonify({"error": "Invalid user identity"}), 400
    
    try:
        # Verify complaint exists
        complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
        
        # Check user has access to this complaint
        if current_user["role"] == "victim" and complaint["complainantId"] != current_user["id"]:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Get notes with visibility filter
        query = {"complaint_id": complaint_id}
        
        # Victims can only see public notes
        if current_user["role"] == "victim":
            query["visibility"] = "public"
        
        notes = list(mongo.db.case_notes.find(query).sort("created_at", -1))
        
        # Convert ObjectId to string
        for note in notes:
            if "_id" in note:
                note["id"] = str(note.pop("_id"))
        
        return jsonify(notes), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@complaint_routes.route('/api/complaints/<complaint_id>/notes', methods=['POST'])
@jwt_required()
def add_complaint_note(complaint_id):
    from app import mongo
    
    current_user_identity = get_jwt_identity()
    current_user = parse_identity(current_user_identity)
    
    if not current_user:
        return jsonify({"error": "Invalid user identity"}), 400
    
    # Only police can add notes
    if current_user["role"] != "police":
        return jsonify({"error": "Only police officers can add case notes"}), 403
    
    data = request.get_json()
    content = data.get('content')
    stage = data.get('stage')
    visibility = data.get('visibility', 'internal')
    
    if not content:
        return jsonify({"error": "Note content is required"}), 400
    
    # Validate visibility
    if visibility not in ["internal", "public"]:
        return jsonify({"error": "Visibility must be either 'internal' or 'public'"}), 400
    
    try:
        # Verify complaint exists
        complaint = mongo.db.complaints.find_one({"_id": ObjectId(complaint_id)})
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
        
        # Create note
        note = {
            "complaint_id": complaint_id,
            "author_id": current_user["id"],
            "author_name": current_user["name"],
            "content": content,
            "stage": stage,
            "visibility": visibility,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = mongo.db.case_notes.insert_one(note)
        note_id = str(result.inserted_id)
        
        # Update complaint with the latest stage if provided
        if stage:
            mongo.db.complaints.update_one(
                {"_id": ObjectId(complaint_id)},
                {"$set": {"currentStage": stage, "updatedAt": datetime.now(timezone.utc).isoformat()}}
            )
            
        # Return success response with the created note
        note["id"] = note_id
        return jsonify(note), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
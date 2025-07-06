from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import random
import time
from datetime import datetime, timezone, timedelta
import re
from twilio.base.exceptions import TwilioRestException
import os

auth_routes = Blueprint('auth', __name__)

# Helper function to validate phone number
def is_valid_phone(phone):
    pattern = r"^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$"
    return bool(re.match(pattern, phone))

# New: In-memory OTP storage (would use Redis or database in production)
otp_storage = {}

def generate_otp(phone):
    """Generate a 6-digit OTP and store it with expiration time"""
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expiry = time.time() + 600  # OTP valid for 10 minutes
    otp_storage[phone] = {
        'otp': otp,
        'expiry': expiry,
        'attempts': 0
    }
    return otp

def verify_otp(phone, entered_otp):
    """Verify the OTP for a phone number"""
    if phone not in otp_storage:
        return False, "OTP expired or not sent"
    
    otp_data = otp_storage[phone]
    
    # Check if OTP has expired
    if time.time() > otp_data['expiry']:
        del otp_storage[phone]
        return False, "OTP has expired"
    
    # Check if too many attempts
    if otp_data['attempts'] >= 3:
        del otp_storage[phone]
        return False, "Too many failed attempts. Please request a new OTP."
    
    # Increment attempt counter
    otp_data['attempts'] += 1
    
    # Check if OTP matches
    if otp_data['otp'] == entered_otp:
        del otp_storage[phone]  # Remove after successful verification
        return True, "OTP verified"
    
    return False, "Invalid OTP"

@auth_routes.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    from app import mongo, twilio_client, TWILIO_PHONE_NUMBER
    
    data = request.get_json()
    phone = data.get('phone')
    
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400
    
    # Format phone number to E.164 format for Twilio
    formatted_phone = phone
    if not formatted_phone.startswith('+'):
        if formatted_phone.startswith('91'):
            formatted_phone = '+' + formatted_phone
        else:
            formatted_phone = '+91' + formatted_phone
    
    print(f"Sending OTP to formatted phone: {formatted_phone}")
    
    if not is_valid_phone(formatted_phone):
        print(f"Invalid phone number format: {formatted_phone}")
        return jsonify({"error": "Invalid phone number format"}), 400
    
    try:
        # Check if user exists in victims collection
        existing_user = mongo.db.victims.find_one({"phone": formatted_phone})
        
        # Check if user exists in pre-registered victims (filed by police)
        pre_registered = mongo.db.pre_registered_victims.find_one({"phone": formatted_phone})
        
        # Generate a new OTP
        otp = generate_otp(formatted_phone)
        
        # Send SMS via Twilio
        if twilio_client and TWILIO_PHONE_NUMBER:
            try:
                message = f"Your SAARTHI verification code is: {otp}. Valid for 10 minutes."
                
                sms = twilio_client.messages.create(
                    body=message,
                    from_=TWILIO_PHONE_NUMBER,
                    to=formatted_phone
                )
                
                print(f"Twilio SMS sent: {sms.sid}")
                
                return jsonify({
                    "message": "OTP sent successfully",
                    "exists": existing_user is not None,
                    "pre_registered": pre_registered is not None,
                    "pre_registered_data": {
                        "name": pre_registered["name"] if pre_registered else None,
                        "address": pre_registered.get("address") if pre_registered else None,
                        "complaints": list(mongo.db.complaints.find(
                            {"complainantPhone": formatted_phone}, 
                            {"_id": 1, "text": 1, "status": 1}
                        )) if pre_registered else []
                    } if pre_registered else None
                }), 200
            except Exception as twilio_error:
                error_message = str(twilio_error)
                print(f"Twilio Error: \n{error_message}")
                
                # Return the OTP for development purposes
                return jsonify({
                    "message": f"Failed to send SMS via Twilio: {error_message}. Using mock OTP for testing.",
                    "exists": existing_user is not None,
                    "pre_registered": pre_registered is not None,
                    "pre_registered_data": {
                        "name": pre_registered["name"] if pre_registered else None,
                        "address": pre_registered.get("address") if pre_registered else None,
                        "complaints": list(mongo.db.complaints.find(
                            {"complainantPhone": formatted_phone}, 
                            {"_id": 1, "text": 1, "status": 1}
                        )) if pre_registered else []
                    } if pre_registered else None,
                    "mock_otp": otp
                }), 200
        else:
            # For development without Twilio
            print(f"Using OTP: {otp} (Twilio not configured)")
            return jsonify({
                "message": "Development mode: Use the provided OTP",
                "exists": existing_user is not None,
                "pre_registered": pre_registered is not None,
                "pre_registered_data": {
                    "name": pre_registered["name"] if pre_registered else None,
                    "address": pre_registered.get("address") if pre_registered else None,
                    "complaints": list(mongo.db.complaints.find(
                        {"complainantPhone": formatted_phone}, 
                        {"_id": 1, "text": 1, "status": 1}
                    )) if pre_registered else []
                } if pre_registered else None,
                "mock_otp": otp
            }), 200
    
    except Exception as e:
        print(f"Error sending OTP: {str(e)}")
        return jsonify({"error": str(e)}), 400

@auth_routes.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    from app import mongo
    
    data = request.get_json()
    phone = data.get('phone')
    code = data.get('code')
    name = data.get('name')
    additional_info = data.get('additional_info', {})
    
    if not phone or not code:
        return jsonify({"error": "Phone and verification code are required"}), 400
    
    # Format phone number
    formatted_phone = phone
    if not formatted_phone.startswith('+'):
        if formatted_phone.startswith('91'):
            formatted_phone = '+' + formatted_phone
        else:
            formatted_phone = '+91' + formatted_phone
    
    print(f"Verifying OTP for phone: {formatted_phone}, code: {code}")
    
    try:
        # Check if user exists in victims collection
        user = mongo.db.victims.find_one({"phone": formatted_phone})
        
        # Check if user exists in pre-registered victims
        pre_registered = mongo.db.pre_registered_victims.find_one({"phone": formatted_phone})
        
        # Verify OTP
        is_valid, message = verify_otp(formatted_phone, code)
        
        # For development, also accept "123456" as a fallback
        if not is_valid and code == "123456":
            print("Accepting development fallback OTP: 123456")
            is_valid = True
            message = "Development OTP accepted"
        
        if is_valid:
            if not user:
                # If pre-registered, move data to victims collection
                if pre_registered:
                    # Create new user with pre-registered data
                    user_data = {
                        "name": pre_registered["name"],
                        "phone": formatted_phone,
                        "role": "victim",
                        "created_at": datetime.now(timezone.utc),
                        "address": pre_registered.get("address"),
                        "id_proof": pre_registered.get("id_proof"),
                        "verified": True,
                        "pre_registered": True,
                        "pre_registered_by": pre_registered.get("registered_by"),
                        "pre_registered_at": pre_registered.get("created_at")
                    }
                    
                    # Add any additional info provided during verification
                    if additional_info:
                        user_data.update(additional_info)
                    
                    user_id = mongo.db.victims.insert_one(user_data).inserted_id
                    
                    # Update any complaints with this phone number to link to the new user ID
                    mongo.db.complaints.update_many(
                        {"complainantPhone": formatted_phone},
                        {"$set": {"complainantId": str(user_id)}}
                    )
                    
                    # Optionally, remove from pre-registered collection
                    # mongo.db.pre_registered_victims.delete_one({"phone": phone})
                    
                    user = mongo.db.victims.find_one({"_id": user_id})
                else:
                    # Create new user if not pre-registered
                    if not name:
                        return jsonify({"error": "Name is required for new users"}), 400
                    
                    user_data = {
                        "name": name,
                        "phone": formatted_phone,
                        "role": "victim",
                        "created_at": datetime.now(timezone.utc),
                        "verified": True
                    }
                    
                    # Add any additional info provided during signup
                    if additional_info:
                        user_data.update(additional_info)
                    
                    user_id = mongo.db.victims.insert_one(user_data).inserted_id
                    user = mongo.db.victims.find_one({"_id": user_id})
            else:
                # Update existing user with any new information
                update_data = {"$set": {"verified": True}}
                
                # Add any additional info provided during verification
                if additional_info:
                    update_data["$set"].update(additional_info)
                
                mongo.db.victims.update_one({"_id": user["_id"]}, update_data)
            
            # Create a simple string identifier for the identity (subject)
            identity_string = f"{str(user['_id'])}:{user['role']}:{user['name']}"
            
            # Generate access token with string identity
            access_token = create_access_token(identity=identity_string)
            
            # Prepare user data for response
            user_data = {
                "id": str(user["_id"]),
                "name": user["name"],
                "role": "victim",
                "phone": user["phone"],
                "pre_registered": user.get("pre_registered", False)
            }
            
            # Add optional fields if they exist
            for field in ["address", "id_proof", "verified"]:
                if field in user:
                    user_data[field] = user[field]
            
            # Get associated complaints
            complaints = list(mongo.db.complaints.find(
                {"$or": [{"complainantId": str(user["_id"])}, {"complainantPhone": phone}]}
            ))
            
            # Convert ObjectId to string in complaints
            for complaint in complaints:
                if "_id" in complaint:
                    complaint["id"] = str(complaint.pop("_id"))
            
            user_data["complaints"] = complaints
            
            return jsonify({
                "message": "Verification successful",
                "token": access_token,
                "user": user_data
            }), 200
        else:
            return jsonify({"error": message}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_routes.route('/api/auth/police/login', methods=['POST'])
def police_login():
    from app import mongo
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Find police officer by email
    officer = mongo.db.police.find_one({"email": email})
    
    # If no officer found with this email
    if not officer:
        print(f"No officer found with email: {email}")
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Verify password
    if not check_password_hash(officer['password'], password):
        print(f"Password mismatch for email: {email}")
        return jsonify({"error": "Invalid email or password"}), 401
    
    # If we get here, authentication was successful
    print(f"Successful login for officer: {officer['name']}")
    
    # Create a simple string identifier for the identity (subject)
    identity_string = f"{str(officer['_id'])}:{officer['role']}:{officer['name']}"
    
    # Generate access token with string identity
    access_token = create_access_token(identity=identity_string)
    
    # Store the full user data in the response
    return jsonify({
        "token": access_token,
        "user": {
            "id": str(officer["_id"]),
            "name": officer["name"],
            "role": "police",
            "email": officer["email"]
        }
    }), 200

@auth_routes.route('/api/auth/police/register', methods=['POST'])
def police_register():
    from app import mongo
    
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    
    # Check if officer with this email already exists
    if mongo.db.police.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    
    # Hash the password
    hashed_password = generate_password_hash(password)
    
    # Insert new police officer
    officer_id = mongo.db.police.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "police",
        "created_at": datetime.now(timezone.utc)
    }).inserted_id
    
    # Generate access token with string identity
    identity_string = f"{str(officer_id)}:police:{name}"
    access_token = create_access_token(identity=identity_string)
    
    return jsonify({
        "message": "Registration successful",
        "token": access_token,
        "user": {
            "id": str(officer_id),
            "name": name,
            "role": "police",
            "email": email
        }
    }), 201

@auth_routes.route('/api/auth/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_identity = get_jwt_identity()
    
    try:
        # Parse the identity string
        user_id, role, name = current_user_identity.split(':', 2)
        
        # Return user details
        return jsonify({
            "id": user_id,
            "role": role,
            "name": name
        }), 200
    except Exception as e:
        print(f"Error parsing user identity: {e}")
        return jsonify({"error": "Invalid user identity"}), 400

# New route for police to pre-register victims
@auth_routes.route('/api/auth/police/register-victim', methods=['POST'])
@jwt_required()
def register_victim():
    from app import mongo
    
    current_user = get_jwt_identity()
    
    # Only police officers can pre-register victims
    if current_user["role"] != "police":
        return jsonify({"error": "Unauthorized access"}), 403
    
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    id_proof = data.get('id_proof')
    
    if not name or not phone:
        return jsonify({"error": "Name and phone number are required"}), 400
    
    # Format phone number
    if not phone.startswith('+'):
        if phone.startswith('91'):
            phone = '+' + phone
        else:
            phone = '+91' + phone
    
    if not is_valid_phone(phone):
        return jsonify({"error": "Invalid phone number format"}), 400
    
    # Check if already registered
    existing_victim = mongo.db.victims.find_one({"phone": phone})
    if existing_victim:
        return jsonify({
            "message": "Victim already registered",
            "victim": {
                "id": str(existing_victim["_id"]),
                "name": existing_victim["name"],
                "phone": existing_victim["phone"]
            }
        }), 200
    
    # Check if already pre-registered
    pre_registered = mongo.db.pre_registered_victims.find_one({"phone": phone})
    if pre_registered:
        # Update existing pre-registration
        mongo.db.pre_registered_victims.update_one(
            {"_id": pre_registered["_id"]},
            {"$set": {
                "name": name,
                "address": address,
                "id_proof": id_proof,
                "updated_at": datetime.now(timezone.utc),
                "updated_by": {
                    "id": current_user["id"],
                    "name": current_user["name"]
                }
            }}
        )
        victim_id = pre_registered["_id"]
    else:
        # Create new pre-registration
        victim_data = {
            "name": name,
            "phone": phone,
            "address": address,
            "id_proof": id_proof,
            "created_at": datetime.now(timezone.utc),
            "registered_by": {
                "id": current_user["id"],
                "name": current_user["name"]
            }
        }
        
        result = mongo.db.pre_registered_victims.insert_one(victim_data)
        victim_id = result.inserted_id
    
    # Retrieve the updated/created pre-registration
    victim = mongo.db.pre_registered_victims.find_one({"_id": victim_id})
    
    return jsonify({
        "message": "Victim pre-registered successfully",
        "victim": {
            "id": str(victim["_id"]),
            "name": victim["name"],
            "phone": victim["phone"],
            "address": victim.get("address"),
            "id_proof": victim.get("id_proof")
        }
    }), 201

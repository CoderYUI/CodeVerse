from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, timezone, datetime
import random
import string
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/saarthi")
mongo = PyMongo(app)

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "".join(random.choices(string.ascii_letters + string.digits, k=32)))
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Configure Twilio
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")  # New: Twilio phone number for sending SMS

# Initialize Twilio client with error handling
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        print(f"Twilio client initialized with phone number: {TWILIO_PHONE_NUMBER}")
    except Exception as e:
        print(f"Error initializing Twilio client: {e}")
        twilio_client = None
else:
    print("Twilio credentials not found or incomplete, running in development mode without SMS")

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"Token expired: {jwt_payload}")
    return jsonify({
        "error": "Token has expired",
        "message": "Please log in again"
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"Invalid token error: {error}")
    return jsonify({
        "error": "Invalid token",
        "message": "Authentication failed"
    }), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"Missing token error: {error}")
    return jsonify({
        "error": "No authorization token provided",
        "message": "Authentication required"
    }), 401

@jwt.token_verification_failed_loader
def verification_failed_callback(jwt_header, jwt_payload):
    print(f"Token verification failed for payload: {jwt_payload}")
    return jsonify({
        "error": "Token verification failed",
        "message": "Authentication failed"
    }), 422

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Add a route to verify token
@app.route('/api/auth/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    current_user = get_jwt_identity()
    print(f"Token verified for user: {current_user}")
    return jsonify({"valid": True, "user": current_user}), 200

# Import routes after app initialization to avoid circular imports
from routes import auth, complaints, police

# Register blueprints
app.register_blueprint(auth.auth_routes)
app.register_blueprint(complaints.complaint_routes)
app.register_blueprint(police.police_routes)

if __name__ == '__main__':
    app.run(debug=True)

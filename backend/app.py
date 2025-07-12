from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, timezone, datetime
import random
import string
from twilio.rest import Client
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Import utils after app is created
try:
    from utils.json_utils import configure_json_encoding
    # Configure JSON encoding for MongoDB objects
    configure_json_encoding(app)
    logger.info("JSON encoding configured successfully")
except Exception as e:
    logger.error(f"Error configuring JSON encoding: {e}")
    # Fallback JSON encoding setup
    from flask.json.provider import JSONProvider
    import json
    from bson import ObjectId

    class CustomJSONEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            if isinstance(obj, datetime):
                return obj.isoformat()
            return super().default(obj)

    class MongoJSONProvider(JSONProvider):
        def dumps(self, obj, **kwargs):
            return json.dumps(obj, cls=CustomJSONEncoder, **kwargs)
        
        def loads(self, s, **kwargs):
            return json.loads(s, **kwargs)
    
    app.json = MongoJSONProvider(app)
    logger.info("Fallback JSON encoding configured")

# Get allowed origins from environment variable
frontend_urls = os.getenv('FRONTEND_URLS', 'https://code-verse-snowy.vercel.app,http://localhost:5173,http://127.0.0.1:5173').split(',')

logger.info(f"CORS allowed origins: {frontend_urls}")

# Configure CORS properly with specific origin and credentials
CORS(
    app,
    origins=frontend_urls,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# Configure MongoDB
app.config["MONGO_URI"] = os.getenv("MONGODB_URI", "mongodb+srv://yui:me@nyayacop.f9dkeuw.mongodb.net/saarthi")
mongo = PyMongo(app)
logger.info(f"MongoDB configured with URI: {app.config['MONGO_URI'].split('@')[1] if '@' in app.config['MONGO_URI'] else 'configured'}")

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "".join(random.choices(string.ascii_letters + string.digits, k=32)))
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)
logger.info("JWT configured")

# Configure Twilio
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client with error handling
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logger.info(f"Twilio client initialized with phone number: {TWILIO_PHONE_NUMBER}")
    except Exception as e:
        logger.error(f"Error initializing Twilio client: {e}")
        twilio_client = None
else:
    logger.warning("Twilio credentials not found or incomplete, running in development mode without SMS")

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    logger.warning(f"Token expired: {jwt_payload}")
    return jsonify({
        "error": "Token has expired",
        "message": "Please log in again"
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    logger.warning(f"Invalid token error: {error}")
    return jsonify({
        "error": "Invalid token",
        "message": "Authentication failed"
    }), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    logger.warning(f"Missing token error: {error}")
    return jsonify({
        "error": "No authorization token provided",
        "message": "Authentication required"
    }), 401

@jwt.token_verification_failed_loader
def verification_failed_callback(jwt_header, jwt_payload):
    logger.warning(f"Token verification failed for payload: {jwt_payload}")
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
    current_user_identity = get_jwt_identity()
    
    # Parse the identity for better debugging
    parts = current_user_identity.split(':', 2)
    if len(parts) == 3:
        user = {
            "id": parts[0],
            "role": parts[1],
            "name": parts[2]
        }
        logger.info(f"Token verified for user: {user['name']} (role: {user['role']})")
        return jsonify({"valid": True, "user": user}), 200
    else:
        logger.warning(f"Invalid identity format: {current_user_identity}")
        return jsonify({"valid": False, "error": "Invalid identity format"}), 400

# Make Twilio client available to routes
@app.context_processor
def inject_twilio():
    return dict(twilio_client=twilio_client, TWILIO_PHONE_NUMBER=TWILIO_PHONE_NUMBER)

# Ensure utils directory is recognized as a package
if not os.path.exists('utils/__init__.py'):
    os.makedirs('utils', exist_ok=True)
    with open('utils/__init__.py', 'w') as f:
        f.write('# Utilities package for SAARTHI\n')

# Import routes after app initialization to avoid circular imports
try:
    from routes import auth, complaints, police
    
    # Register blueprints
    app.register_blueprint(auth.auth_routes)
    app.register_blueprint(complaints.complaint_routes)
    app.register_blueprint(police.police_routes)
    logger.info("Routes registered successfully")
except Exception as e:
    logger.error(f"Error registering routes: {e}")
    
    @app.route('/')
    def default_route():
        return jsonify({"status": "API is running but routes failed to load", "error": str(e)}), 500

if __name__ == '__main__':
    # Use PORT environment variable for cloud deployment
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

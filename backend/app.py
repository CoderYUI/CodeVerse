from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo  # Add this import
import os

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Get allowed origins from environment variable or hardcode for now
frontend_urls = os.getenv('FRONTEND_URLS', 'https://code-verse-snowy.vercel.app,http://localhost:5173,http://127.0.0.1:5173').split(',')

print("CORS allowed origins:", frontend_urls)

CORS(
    app,
    origins=frontend_urls,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# Configure MongoDB
# Use MongoDB Atlas URI from environment variable, with a clear fallback
app.config["MONGO_URI"] = os.getenv("MONGODB_URI", "mongodb+srv://yui:thatsme@nyayacop.f9dkeuw.mongodb.net/saarthi")
mongo = PyMongo(app)

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "".join(random.choices(string.ascii_letters + string.digits, k=32)))
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Configure Twilio
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

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
    current_user_identity = get_jwt_identity()
    
    # Parse the identity for better debugging
    parts = current_user_identity.split(':', 2)
    if len(parts) == 3:
        user = {
            "id": parts[0],
            "role": parts[1],
            "name": parts[2]
        }
        print(f"Token verified for user: {user['name']} (role: {user['role']})")
        return jsonify({"valid": True, "user": user}), 200
    else:
        print(f"Invalid identity format: {current_user_identity}")
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
from routes import auth, complaints, police

# Register blueprints
app.register_blueprint(auth.auth_routes)
app.register_blueprint(complaints.complaint_routes)
app.register_blueprint(police.police_routes)

if __name__ == '__main__':
    # Use PORT environment variable for cloud deployment
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
if not os.path.exists('utils/__init__.py'):
    os.makedirs('utils', exist_ok=True)
    with open('utils/__init__.py', 'w') as f:
        f.write('# Utilities package for SAARTHI\n')

# Import routes after app initialization to avoid circular imports
from routes import auth, complaints, police

# Register blueprints
app.register_blueprint(auth.auth_routes)
app.register_blueprint(complaints.complaint_routes)
app.register_blueprint(police.police_routes)

if __name__ == '__main__':
    # Use PORT environment variable for cloud deployment
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

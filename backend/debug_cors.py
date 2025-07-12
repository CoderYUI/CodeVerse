"""
A utility script to debug CORS issues
"""
import requests
import json
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS with debugging enabled
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", 
                                     "https://code-verse-snowy.vercel.app"], 
                         "supports_credentials": True}}, 
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
     vary_header=True)

@app.route('/api/cors-test', methods=['GET', 'OPTIONS'])
def cors_test():
    """Test endpoint to verify CORS is working properly"""
    return jsonify({
        "message": "CORS is configured correctly",
        "status": "success"
    })

@app.after_request
def after_request(response):
    """Print response headers for debugging"""
    print("\n--- Response Headers ---")
    for header, value in response.headers:
        print(f"{header}: {value}")
    print("----------------------\n")
    return response

def test_cors():
    """
    Test if the server is responding correctly to CORS preflight requests
    """
    base_url = "http://localhost:5000"
    
    # Test a simple GET request
    print("Testing GET request to /api/health...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"Status code: {response.status_code}")
        print(f"Headers: {json.dumps(dict(response.headers), indent=2)}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    print("\n" + "-"*50 + "\n")
    
    # Test OPTIONS preflight request
    print("Testing OPTIONS preflight request to /api/complaints...")
    try:
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, Authorization"
        }
        response = requests.options(f"{base_url}/api/complaints", headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Headers: {json.dumps(dict(response.headers), indent=2)}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("Starting CORS debugging server...")
    print("Test endpoints:")
    print("- GET /api/cors-test - Returns success message if CORS is working")
    print("\nCORS is configured for origins:")
    print("- http://localhost:5173")
    print("- http://127.0.0.1:5173")
    print("- https://code-verse-snowy.vercel.app")
    app.run(debug=True, port=5001)

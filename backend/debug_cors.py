"""
A utility script to debug CORS issues
"""
import requests
import json

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
    test_cors()

from bson import ObjectId
import json
from datetime import datetime
from flask import Flask

# Fix for newer Flask versions where JSONEncoder is not in flask.json
try:
    # Try the old import path first
    from flask.json import JSONEncoder
except ImportError:
    # If that fails, use the built-in json.JSONEncoder
    from json import JSONEncoder

class MongoJSONEncoder(JSONEncoder):
    """
    Custom JSONEncoder that handles MongoDB ObjectId and other non-serializable types
    """
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(MongoJSONEncoder, self).default(obj)

def configure_json_encoding(app):
    """
    Configure Flask app to use the custom JSONEncoder
    """
    try:
        # For Flask < 2.2
        app.json_encoder = MongoJSONEncoder
    except AttributeError:
        # For Flask >= 2.2
        from flask.json.provider import JSONProvider
        
        class CustomJSONProvider(JSONProvider):
            def dumps(self, obj, **kwargs):
                return json.dumps(obj, cls=MongoJSONEncoder, **kwargs)
                
            def loads(self, s, **kwargs):
                return json.loads(s, **kwargs)
        
        app.json = CustomJSONProvider(app)
    
    return app

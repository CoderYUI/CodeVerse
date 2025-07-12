from bson import ObjectId
from flask.json import JSONEncoder
import json
from datetime import datetime

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

class MongoJSONProvider:
    """
    Custom JSON provider for Flask 2.0+ compatibility
    """
    def __init__(self, app):
        self.app = app
    
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs)
    
    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)

def configure_json_encoding(app):
    """
    Configure Flask app to use the custom JSONEncoder
    """
    # For Flask 1.x
    app.json_encoder = MongoJSONEncoder
    
    # For Flask 2.x+
    try:
        app.json_provider_class = MongoJSONProvider
        app.json = app.json_provider_class(app)
    except AttributeError:
        # If using older Flask version
        pass
    
    return app

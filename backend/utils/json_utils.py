from bson import ObjectId
import json
from datetime import datetime
from flask.json.provider import JSONProvider

class MongoJSONEncoder(json.JSONEncoder):
    """
    Custom JSONEncoder that handles MongoDB ObjectId and other non-serializable types
    """
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

class MongoJSONProvider(JSONProvider):
    """
    Custom JSON provider that uses MongoJSONEncoder
    """
    def dumps(self, obj, **kwargs):
        kwargs.setdefault('cls', MongoJSONEncoder)
        return json.dumps(obj, **kwargs)
    
    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)

def configure_json_encoding(app):
    """
    Configure Flask app to use the custom JSONEncoder
    """
    app.json_provider_class = MongoJSONProvider
    app.json = app.json_provider_class(app)

from bson import ObjectId

def prepare_mongo_document_for_json(document):
    """
    Prepare a MongoDB document for JSON serialization by converting
    ObjectId to string and handling other special types
    """
    if document is None:
        return None
        
    if isinstance(document, list):
        return [prepare_mongo_document_for_json(item) for item in document]
    
    if not isinstance(document, dict):
        return document
        
    result = document.copy()
    
    # Convert ObjectId to string
    if '_id' in result:
        result['id'] = str(result.pop('_id'))
    
    # Process nested dictionaries and lists
    for key, value in result.items():
        if isinstance(value, dict):
            result[key] = prepare_mongo_document_for_json(value)
        elif isinstance(value, list):
            result[key] = [prepare_mongo_document_for_json(item) for item in value]
        elif isinstance(value, ObjectId):
            result[key] = str(value)
    
    return result

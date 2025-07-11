from datetime import datetime, timezone

class CaseNote:
    """
    Model for case notes added by police officers during investigation
    """
    def __init__(self, complaint_id, author_id, author_name, content, stage=None, visibility="internal"):
        self.complaint_id = complaint_id
        self.author_id = author_id
        self.author_name = author_name
        self.content = content
        self.stage = stage  # Optional stage of the case: investigation, evidence_collection, witness_interview, etc.
        self.visibility = visibility  # Can be "internal" (police only) or "public" (visible to victim)
        self.created_at = datetime.now(timezone.utc).isoformat()
        
    def to_dict(self):
        return {
            "complaint_id": self.complaint_id,
            "author_id": self.author_id,
            "author_name": self.author_name,
            "content": self.content,
            "stage": self.stage,
            "visibility": self.visibility,
            "created_at": self.created_at
        }

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/saarthi")
client = MongoClient(mongo_uri)
db = client.get_database()

# IPC Sections
ipc_sections = [
    {
        "number": "IPC 354A",
        "title": "Sexual Harassment",
        "description": "Physical contact and advances involving unwelcome and explicit sexual overtures",
        "punishment": "Imprisonment up to 3 years, or fine, or both",
        "isCognizable": True,
        "isBailable": True
    },
    {
        "number": "IPC 379",
        "title": "Theft",
        "description": "Whoever, intending to take dishonestly any moveable property out of the possession of any person",
        "punishment": "Imprisonment up to 3 years, or fine, or both",
        "isCognizable": True,
        "isBailable": True
    },
    {
        "number": "IPC 323",
        "title": "Voluntary Hurt",
        "description": "Whoever causes hurt to any person",
        "punishment": "Imprisonment up to 1 year, or fine up to ₹1000, or both",
        "isCognizable": True,
        "isBailable": True
    },
    {
        "number": "IPC 354",
        "title": "Assault on Woman",
        "description": "Assault or criminal force to woman with intent to outrage her modesty",
        "punishment": "Imprisonment up to 5 years and fine",
        "isCognizable": True,
        "isBailable": False
    },
    {
        "number": "IPC 509",
        "title": "Word, gesture or act intended to insult the modesty of a woman",
        "description": "Uttering any word, making any sound or gesture, or exhibiting any object, intending to insult the modesty of a woman",
        "punishment": "Imprisonment up to 3 years and fine",
        "isCognizable": True,
        "isBailable": True
    }
]

# Legal Rights
legal_rights = [
    {
        "title": "Right to File FIR",
        "description": "Every citizen has the right to file an FIR at any police station, regardless of where the crime occurred.",
        "section": "Section 154 CrPC"
    },
    {
        "title": "Right to Know FIR Status",
        "description": "You have the right to know the status of your FIR and get a copy of it.",
        "section": "Section 154(2) CrPC"
    },
    {
        "title": "Right to Legal Aid",
        "description": "Free legal aid is available for those who cannot afford a lawyer.",
        "section": "Section 304 CrPC"
    },
    {
        "title": "Right to Medical Examination",
        "description": "Victims have the right to medical examination after sexual assault.",
        "section": "Section 164A CrPC"
    },
    {
        "title": "Right to Privacy",
        "description": "Victims have the right to privacy and confidentiality during the investigation process.",
        "section": "Section 228A IPC"
    }
]

# Sample Police Officers
police_officers = [
    {
        "name": "Inspector Rajesh Kumar",
        "email": "admin@example.com",  # Changed to a simpler email for testing
        "password": generate_password_hash("password123"),
        "role": "police",
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }
]

# Sample Pre-registered Victims
pre_registered_victims = [
    {
        "name": "Anushka Sharma",
        "phone": "+919876543210",
        "address": "123 Main Street, Mumbai",
        "id_proof": "Aadhaar: XXXX-XXXX-1234",
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "registered_by": {
            "id": "1",
            "name": "Inspector Rajesh Kumar"
        }
    },
    {
        "name": "Rahul Mehta",
        "phone": "+919876543211",
        "address": "456 Park Avenue, Delhi",
        "id_proof": "Aadhaar: XXXX-XXXX-5678",
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "registered_by": {
            "id": "1",
            "name": "Inspector Rajesh Kumar"
        }
    }
]

# Sample Complaints for pre-registered victims
sample_complaints = [
    {
        "text": "I was harassed at my workplace by my supervisor. He made inappropriate comments and touched me without consent.",
        "language": "English",
        "status": "pending",
        "complainantName": "Anushka Sharma",
        "complainantPhone": "+919876543210",
        "filedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "filedBy": {
            "id": "1",
            "name": "Inspector Rajesh Kumar",
            "role": "police"
        }
    },
    {
        "text": "My neighbor has been playing loud music late at night, causing disturbance to the entire neighborhood.",
        "language": "English",
        "status": "pending",
        "complainantName": "Rahul Mehta",
        "complainantPhone": "+919876543211",
        "filedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "filedBy": {
            "id": "1",
            "name": "Inspector Rajesh Kumar",
            "role": "police"
        }
    }
]

# Sample Case Notes
sample_case_notes = [
    {
        "complaint_id": "", # Will be updated with real ID
        "author_id": "", # Will be updated with real ID
        "author_name": "Inspector Rajesh Kumar",
        "content": "Initial assessment: This appears to be a case of workplace harassment. Will proceed with preliminary inquiry.",
        "stage": "preliminary_inquiry",
        "visibility": "public",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "complaint_id": "", # Will be updated with real ID
        "author_id": "", # Will be updated with real ID
        "author_name": "Inspector Rajesh Kumar",
        "content": "Internal note: Need to collect CCTV footage from the workplace. Contact HR department.",
        "stage": "evidence_collection",
        "visibility": "internal",
        "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat()
    }
]

# Seed the database
def seed_database():
    # Drop existing collections
    db.ipc_sections.drop()
    db.legal_rights.drop()
    db.police.drop()
    db.pre_registered_victims.drop()
    db.complaints.drop()
    db.victims.drop()
    db.notifications.drop()
    db.case_notes.drop()  # Add case_notes collection
    
    # Insert data
    db.ipc_sections.insert_many(ipc_sections)
    db.legal_rights.insert_many(legal_rights)
    police_result = db.police.insert_many(police_officers)
    
    # Update police ID in pre-registered victims
    officer_id = str(police_result.inserted_ids[0])
    for victim in pre_registered_victims:
        victim["registered_by"]["id"] = officer_id
    
    # Insert pre-registered victims
    victims_result = db.pre_registered_victims.insert_many(pre_registered_victims)
    
    # Update complaints with victim IDs
    for i, complaint in enumerate(sample_complaints):
        complaint["complainantId"] = str(victims_result.inserted_ids[i])
        complaint["filedBy"]["id"] = officer_id
    
    # Insert complaints
    complaints_result = db.complaints.insert_many(sample_complaints)
    
    # Update case notes with real complaint and officer IDs
    for i, note in enumerate(sample_case_notes):
        note["complaint_id"] = str(complaints_result.inserted_ids[0])  # Assign to first complaint
        note["author_id"] = officer_id
    
    # Insert case notes
    db.case_notes.insert_many(sample_case_notes)
    
    # Print confirmation message with login credentials
    print("\nDatabase seeded successfully!")
    print("Sample Police Officer Login:")
    print("Email: admin@example.com")
    print("Password: password123")

if __name__ == "__main__":
    seed_database()

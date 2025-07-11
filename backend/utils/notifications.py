"""
Utility functions for sending notifications to users
"""
from datetime import datetime

def send_complaint_confirmation_sms(twilio_client, from_number, to_number, complaint_id, is_cognizable=None):
    """
    Send an SMS confirmation to a victim after complaint registration
    
    Args:
        twilio_client: Initialized Twilio client
        from_number: Twilio phone number to send from
        to_number: Victim's phone number
        complaint_id: The ID of the registered complaint
        is_cognizable: Boolean indicating if the offense is cognizable
    
    Returns:
        dict: Response from Twilio API or error information
    """
    if not twilio_client or not from_number or not to_number:
        return {"success": False, "error": "Missing Twilio configuration or phone numbers"}
    
    try:
        # Format complaint ID to be more readable and shorter (only last 6 characters)
        formatted_id = f"SAR-{complaint_id[-6:]}".upper()
        current_time = datetime.now().strftime("%d/%m/%Y %H:%M")
        
        message = f"Your complaint has been registered successfully at {current_time}.\n\nComplaint ID: {formatted_id}\n"
        
        # Add cognizable status if available
        if is_cognizable is not None:
            if is_cognizable:
                message += "\nThis appears to be a COGNIZABLE offense which requires immediate police action."
            else:
                message += "\nThis appears to be a NON-COGNIZABLE offense. Please follow up with the police station."
        
        message += "\n\nYou can track the status through the SAARTHI app or website."
        
        # Send the message
        sms = twilio_client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        
        return {
            "success": True,
            "sid": sms.sid,
            "to": to_number,
            "message": message
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "to": to_number
        }

def send_status_update_sms(twilio_client, from_number, to_number, complaint_id, status, details=None):
    """
    Send an SMS notification when a complaint status is updated
    
    Args:
        twilio_client: Initialized Twilio client
        from_number: Twilio phone number to send from
        to_number: Victim's phone number
        complaint_id: The ID of the registered complaint
        status: New status of the complaint
        details: Optional additional details
    
    Returns:
        dict: Response from Twilio API or error information
    """
    if not twilio_client or not from_number or not to_number:
        return {"success": False, "error": "Missing Twilio configuration or phone numbers"}
    
    try:
        # Format complaint ID to be more readable and shorter
        formatted_id = f"SAR-{complaint_id[-6:]}".upper()
        
        # Create appropriate message based on status
        status_messages = {
            "pending": "Your complaint is pending review.",
            "analyzed": "Your complaint has been analyzed and is under investigation.",
            "filed": "An FIR has been filed for your complaint.",
            "rejected": "Your complaint has been reviewed but could not be processed as an FIR.",
            "closed": "Your complaint case has been closed."
        }
        
        status_text = status_messages.get(status, f"Your complaint status has been updated to: {status}")
        
        message = f"Update for Complaint {formatted_id}: {status_text}"
        
        if details:
            message += f"\n\nDetails: {details}"
            
        message += "\n\nFor more information, please log in to the SAARTHI app or website."
        
        # Send the message
        sms = twilio_client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        
        return {
            "success": True,
            "sid": sms.sid,
            "to": to_number,
            "message": message
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "to": to_number
        }

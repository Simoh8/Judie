import os
import base64
import requests
from datetime import datetime, timedelta
from django.conf import settings


class ZoomService:
    """Service for interacting with Zoom API to create meetings using Server-to-Server OAuth"""
    
    ZOOM_API_BASE_URL = "https://api.zoom.us/v2"
    
    @classmethod
    def get_access_token(cls):
        """Generate a Server-to-Server OAuth access token for Zoom API authentication"""
        account_id = os.getenv('ZOOM_ACCOUNT_ID')
        client_id = os.getenv('ZOOM_CLIENT_ID', os.getenv('ZOOM_API_KEY'))
        client_secret = os.getenv('ZOOM_CLIENT_SECRET', os.getenv('ZOOM_API_SECRET'))
        
        if not account_id or not client_id or not client_secret:
            print("Zoom API Warning: Missing Server-to-Server OAuth credentials. "
                  "Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in your environment.")
            return None
        
        # Build basic auth header
        auth_str = f"{client_id}:{client_secret}"
        auth_bytes = auth_str.encode('utf-8')
        auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        url = "https://zoom.us/oauth/token"
        params = {
            'grant_type': 'account_credentials',
            'account_id': account_id
        }
        
        try:
            response = requests.post(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                print(f"Zoom OAuth token error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Error fetching Zoom access token: {e}")
            return None
    
    @classmethod
    def create_meeting(cls, topic, start_time, duration_minutes, password=None):
        """
        Create a Zoom meeting
        
        Args:
            topic: Meeting topic/title
            start_time: datetime object for when the meeting starts
            duration_minutes: Duration of meeting in minutes
            password: Optional password for the meeting
            
        Returns:
            dict with meeting details (join_url, start_url, meeting_id, password)
        """
        token = cls.get_access_token()
        
        # Check if we should fall back to a mock meeting in debug mode or if credentials are missing
        is_debug = getattr(settings, 'DEBUG', False)
        has_credentials = bool(os.getenv('ZOOM_ACCOUNT_ID') and 
                               (os.getenv('ZOOM_CLIENT_ID') or os.getenv('ZOOM_API_KEY')) and 
                               (os.getenv('ZOOM_CLIENT_SECRET') or os.getenv('ZOOM_API_SECRET')))
        
        if not token:
            if is_debug or not has_credentials:
                print("Zoom Service: Using mock meeting fallback because Zoom credentials are missing/invalid in DEBUG mode.")
                return cls.get_mock_meeting(topic, start_time, duration_minutes, password)
            return None
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # Format start_time for Zoom API
        start_time_str = start_time.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        # Generate random password if not provided
        if not password:
            import random
            import string
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        
        meeting_data = {
            'topic': topic,
            'type': 2,  # Scheduled meeting
            'start_time': start_time_str,
            'duration': duration_minutes,
            'password': password,
            'settings': {
                'join_before_host': True,
                'waiting_room': False,
                'participant_video': True,
                'host_video': True,
            }
        }
        
        try:
            response = requests.post(
                f'{cls.ZOOM_API_BASE_URL}/users/me/meetings',
                json=meeting_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                meeting_info = response.json()
                return {
                    'meeting_id': str(meeting_info.get('id')),
                    'join_url': meeting_info.get('join_url'),
                    'start_url': meeting_info.get('start_url'),
                    'password': meeting_info.get('password', password)
                }
            else:
                print(f"Zoom API error: {response.status_code} - {response.text}")
                if is_debug or not has_credentials:
                    print("Zoom Service: Using mock meeting fallback because Zoom API call failed in DEBUG mode.")
                    return cls.get_mock_meeting(topic, start_time, duration_minutes, password)
                return None
        except Exception as e:
            print(f"Error creating Zoom meeting: {e}")
            if is_debug or not has_credentials:
                print("Zoom Service: Using mock meeting fallback because Zoom API call raised exception in DEBUG mode.")
                return cls.get_mock_meeting(topic, start_time, duration_minutes, password)
            return None
    
    @classmethod
    def get_mock_meeting(cls, topic, start_time, duration_minutes, password=None):
        """Generate a mock Zoom meeting details dictionary for local testing"""
        import random
        import string
        meeting_id = ''.join(random.choices(string.digits, k=11))
        if not password:
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        return {
            'meeting_id': meeting_id,
            'join_url': f"https://zoom.us/j/{meeting_id}?pwd={password}",
            'start_url': f"https://zoom.us/s/{meeting_id}?pwd={password}",
            'password': password
        }
    
    @classmethod
    def delete_meeting(cls, meeting_id):
        """Delete a Zoom meeting"""
        token = cls.get_access_token()
        
        is_debug = getattr(settings, 'DEBUG', False)
        has_credentials = bool(os.getenv('ZOOM_ACCOUNT_ID') and 
                               (os.getenv('ZOOM_CLIENT_ID') or os.getenv('ZOOM_API_KEY')) and 
                               (os.getenv('ZOOM_CLIENT_SECRET') or os.getenv('ZOOM_API_SECRET')))
        
        if not token:
            if is_debug or not has_credentials:
                print(f"Zoom Service: Simulating mock meeting deletion for {meeting_id} in DEBUG mode.")
                return True
            return False
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.delete(
                f'{cls.ZOOM_API_BASE_URL}/meetings/{meeting_id}',
                headers=headers,
                timeout=10
            )
            return response.status_code == 204
        except Exception as e:
            print(f"Error deleting Zoom meeting: {e}")
            if is_debug or not has_credentials:
                print(f"Zoom Service: Simulating mock meeting deletion due to exception in DEBUG mode.")
                return True
            return False


"""
Test Suite: Live Session API
Tests for /api/session/[id]/event endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')

class TestSessionEventAPI:
    """Tests for session event API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get authenticated session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Get CSRF token
        csrf_response = self.session.get(f"{BASE_URL}/api/auth/csrf")
        if csrf_response.status_code == 200:
            self.csrf_token = csrf_response.json().get('csrfToken')
        else:
            self.csrf_token = None
        
        # Login as admin
        if self.csrf_token:
            login_response = self.session.post(
                f"{BASE_URL}/api/auth/callback/credentials",
                data={
                    "email": "admin@tribeat.com",
                    "password": "Admin123!",
                    "csrfToken": self.csrf_token
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                allow_redirects=False
            )
            # Session cookie should be set
    
    def test_get_session_state(self):
        """GET /api/session/[id]/event - Get session state"""
        response = self.session.get(f"{BASE_URL}/api/session/demo-session-1/event")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get('success') == True
        assert 'state' in data
        
        state = data['state']
        assert state['sessionId'] == 'demo-session-1'
        assert state['status'] in ['LIVE', 'PAUSED', 'ENDED']
        assert 'isPlaying' in state
        assert 'currentTime' in state
        assert 'volume' in state
        assert 'mediaUrl' in state
        assert 'timestamp' in state
    
    def test_post_play_event(self):
        """POST /api/session/[id]/event - Play event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:play",
                "data": {"currentTime": 0}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:play'
        assert 'channelName' in data
    
    def test_post_pause_event(self):
        """POST /api/session/[id]/event - Pause event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:pause",
                "data": {"currentTime": 30}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:pause'
    
    def test_post_seek_event(self):
        """POST /api/session/[id]/event - Seek event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:seek",
                "data": {"currentTime": 60}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:seek'
    
    def test_post_volume_event(self):
        """POST /api/session/[id]/event - Volume event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:volume",
                "data": {"volume": 75}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:volume'
    
    def test_invalid_event_type(self):
        """POST /api/session/[id]/event - Invalid event type returns 400"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "invalid:event",
                "data": {}
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
    
    def test_missing_event_data(self):
        """POST /api/session/[id]/event - Missing data returns 400"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:play"
                # Missing 'data' field
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
    
    def test_nonexistent_session(self):
        """GET /api/session/[id]/event - Nonexistent session returns 404"""
        response = self.session.get(f"{BASE_URL}/api/session/nonexistent-session/event")
        
        assert response.status_code == 404
        data = response.json()
        assert 'error' in data


class TestSessionPageAccess:
    """Tests for session page access control"""
    
    def test_unauthenticated_redirects_to_login(self):
        """Unauthenticated user is redirected to login"""
        session = requests.Session()
        response = session.get(
            f"{BASE_URL}/session/demo-session-1",
            allow_redirects=False
        )
        
        # Should redirect to login
        assert response.status_code in [302, 307, 308]
        location = response.headers.get('Location', '')
        assert 'login' in location.lower() or 'auth' in location.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

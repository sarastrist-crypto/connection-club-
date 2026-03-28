"""
Test suite for ConnectClub Revenue Banner (Promotions) and Concierge features
Tests: GET /api/promotions/targeted, POST /api/promotions/track-click, 
       POST /api/concierge-requests, GET /api/high-value-accounts
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@connectclub.com"
ADMIN_PASSWORD = "admin123"


class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a requests session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    @pytest.fixture(scope="class")
    def auth_session(self, session):
        """Login and return authenticated session"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return session


class TestPromotionsTargeted:
    """Tests for GET /api/promotions/targeted endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return session
    
    def test_promotions_targeted_returns_200(self, auth_session):
        """Test that targeted promotions endpoint returns 200"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_promotions_targeted_returns_3_promotions(self, auth_session):
        """Test that endpoint returns exactly 3 promotions"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200
        data = response.json()
        assert "promotions" in data, "Response should contain 'promotions' key"
        assert len(data["promotions"]) == 3, f"Expected 3 promotions, got {len(data['promotions'])}"
    
    def test_promotions_have_required_fields(self, auth_session):
        """Test that each promotion has required fields"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "headline", "subtext", "cta_label", "cta_url", 
                          "commission_close", "commission_residual", "relevance_score"]
        
        for promo in data["promotions"]:
            for field in required_fields:
                assert field in promo, f"Promotion missing required field: {field}"
    
    def test_promotions_have_relevance_scores(self, auth_session):
        """Test that promotions have relevance_score field"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200
        data = response.json()
        
        for promo in data["promotions"]:
            assert "relevance_score" in promo, "Promotion should have relevance_score"
            assert isinstance(promo["relevance_score"], (int, float)), "relevance_score should be numeric"
    
    def test_promotions_include_expected_ids(self, auth_session):
        """Test that promotions include the 3 expected promotion IDs"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200
        data = response.json()
        
        expected_ids = {"connectclub-va", "menio-global", "imago-imaging"}
        actual_ids = {p["id"] for p in data["promotions"]}
        
        assert expected_ids == actual_ids, f"Expected IDs {expected_ids}, got {actual_ids}"
    
    def test_promotions_unauthorized_without_auth(self):
        """Test that endpoint returns 401 without authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestPromotionTrackClick:
    """Tests for POST /api/promotions/track-click endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return session
    
    def test_track_click_returns_200(self, auth_session):
        """Test that track-click endpoint returns 200"""
        response = auth_session.post(f"{BASE_URL}/api/promotions/track-click", json={
            "promotion_id": "connectclub-va",
            "promotion_name": "ConnectClub Virtual Assistants"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_track_click_returns_ref_code(self, auth_session):
        """Test that track-click returns tracked=True and ref_code"""
        response = auth_session.post(f"{BASE_URL}/api/promotions/track-click", json={
            "promotion_id": "menio-global",
            "promotion_name": "Menio Global Credit Processing"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "tracked" in data, "Response should contain 'tracked' key"
        assert data["tracked"] == True, "tracked should be True"
        assert "ref_code" in data, "Response should contain 'ref_code' key"
        assert data["ref_code"].startswith("ConnectClub_"), f"ref_code should start with 'ConnectClub_', got {data['ref_code']}"
    
    def test_track_click_unauthorized_without_auth(self):
        """Test that endpoint returns 401 without authentication"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/promotions/track-click", json={
            "promotion_id": "test",
            "promotion_name": "Test"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestHighValueAccounts:
    """Tests for GET /api/high-value-accounts endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return session
    
    def test_high_value_accounts_returns_200(self, auth_session):
        """Test that high-value accounts endpoint returns 200"""
        response = auth_session.get(f"{BASE_URL}/api/high-value-accounts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_high_value_accounts_returns_accounts(self, auth_session):
        """Test that endpoint returns accounts array"""
        response = auth_session.get(f"{BASE_URL}/api/high-value-accounts")
        assert response.status_code == 200
        data = response.json()
        
        assert "accounts" in data, "Response should contain 'accounts' key"
        assert len(data["accounts"]) > 0, "Should have at least one high-value account"
    
    def test_high_value_account_has_required_fields(self, auth_session):
        """Test that high-value accounts have required fields"""
        response = auth_session.get(f"{BASE_URL}/api/high-value-accounts")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "description", "commission_tiers", "contract_value_min", "contract_value_max"]
        
        for account in data["accounts"]:
            for field in required_fields:
                assert field in account, f"Account missing required field: {field}"
    
    def test_get_single_high_value_account(self, auth_session):
        """Test getting a single high-value account by ID"""
        # First get all accounts
        response = auth_session.get(f"{BASE_URL}/api/high-value-accounts")
        assert response.status_code == 200
        accounts = response.json()["accounts"]
        
        # Get first account by ID
        account_id = accounts[0]["id"]
        response = auth_session.get(f"{BASE_URL}/api/high-value-accounts/{account_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        account = response.json()
        assert account["id"] == account_id, "Account ID should match"


class TestConciergeRequests:
    """Tests for POST /api/concierge-requests endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return session
    
    @pytest.fixture(scope="class")
    def high_value_account_id(self, auth_session):
        """Get a valid high-value account ID"""
        response = auth_session.get(f"{BASE_URL}/api/high-value-accounts")
        assert response.status_code == 200
        accounts = response.json()["accounts"]
        return accounts[0]["id"]
    
    def test_create_concierge_request_returns_200(self, auth_session, high_value_account_id):
        """Test that creating a concierge request returns 200"""
        response = auth_session.post(f"{BASE_URL}/api/concierge-requests", json={
            "high_value_account_id": high_value_account_id,
            "contact_name": "TEST_John Doe",
            "company_name": "TEST_Acme Corp",
            "estimated_locations": 5,
            "contact_email": "test@example.com",
            "contact_phone": "555-123-4567",
            "notes": "Test concierge request",
            "relationship": "working"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_create_concierge_request_returns_id_and_message(self, auth_session, high_value_account_id):
        """Test that response contains id and message"""
        response = auth_session.post(f"{BASE_URL}/api/concierge-requests", json={
            "high_value_account_id": high_value_account_id,
            "contact_name": "TEST_Jane Smith",
            "company_name": "TEST_XYZ Inc",
            "estimated_locations": 10,
            "contact_email": "jane@example.com",
            "contact_phone": "555-987-6543",
            "notes": "Another test request",
            "relationship": "close"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data, "Response should contain 'id' key"
        assert "message" in data, "Response should contain 'message' key"
        assert len(data["id"]) > 0, "ID should not be empty"
    
    def test_get_concierge_requests(self, auth_session):
        """Test getting user's concierge requests"""
        response = auth_session.get(f"{BASE_URL}/api/concierge-requests")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "requests" in data, "Response should contain 'requests' key"
    
    def test_concierge_request_invalid_account_returns_404(self, auth_session):
        """Test that invalid account ID returns 404"""
        response = auth_session.post(f"{BASE_URL}/api/concierge-requests", json={
            "high_value_account_id": "invalid-account-id",
            "contact_name": "Test",
            "company_name": "Test Co",
            "estimated_locations": 1,
            "contact_email": "",
            "contact_phone": "",
            "notes": "",
            "relationship": "acquaintance"
        })
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_concierge_request_unauthorized_without_auth(self):
        """Test that endpoint returns 401 without authentication"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/concierge-requests", json={
            "high_value_account_id": "test",
            "contact_name": "Test",
            "company_name": "Test",
            "estimated_locations": 1,
            "contact_email": "",
            "contact_phone": "",
            "notes": "",
            "relationship": "acquaintance"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Test suite for ConnectClub CCP Pivot Features
Tests: Network contacts CRUD, opt-in, verify, CCP analysis, notifications, promotions (CCP + VA only)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL') or "https://network-pay.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@connectclub.com"
ADMIN_PASSWORD = "admin123"


class TestNetworkContacts:
    """Tests for Network Contacts CRUD operations"""
    
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
    
    def test_add_contact_returns_200(self, auth_session):
        """Test POST /api/network/contacts adds a contact"""
        response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_Joe Martinez",
            "business_name": "Joe's Restaurant",
            "industry": "Restaurant",
            "email": "joe@restaurant.com",
            "phone": "555-111-2222",
            "source": "manual"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert "message" in data, "Response should contain 'message'"
    
    def test_add_contact_with_minimal_data(self, auth_session):
        """Test adding contact with only required name field"""
        response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_Minimal Contact",
            "source": "manual"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_get_contacts_returns_list(self, auth_session):
        """Test GET /api/network/contacts returns contacts list"""
        response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "contacts" in data, "Response should contain 'contacts'"
        assert "stats" in data, "Response should contain 'stats'"
        assert isinstance(data["contacts"], list), "contacts should be a list"
    
    def test_contacts_stats_structure(self, auth_session):
        """Test that stats have correct structure"""
        response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        assert response.status_code == 200
        stats = response.json()["stats"]
        
        required_stats = ["total", "opted_in", "verified", "flagged"]
        for stat in required_stats:
            assert stat in stats, f"Stats missing '{stat}'"
    
    def test_bulk_import_contacts(self, auth_session):
        """Test POST /api/network/contacts/bulk imports multiple contacts"""
        contacts = [
            {"name": "TEST_Bulk Contact 1", "business_name": "Retail Store", "industry": "Retail", "source": "csv"},
            {"name": "TEST_Bulk Contact 2", "business_name": "Dental Clinic", "industry": "Dental", "source": "csv"},
            {"name": "TEST_Bulk Contact 3", "business_name": "Auto Shop", "industry": "Auto Repair", "source": "csv"}
        ]
        response = auth_session.post(f"{BASE_URL}/api/network/contacts/bulk", json=contacts)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "imported" in data, "Response should contain 'imported'"
        assert data["imported"] == 3, f"Expected 3 imported, got {data['imported']}"


class TestContactOptIn:
    """Tests for contact opt-in functionality"""
    
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
    def test_contact_id(self, auth_session):
        """Create a test contact and return its ID"""
        response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_OptIn Contact",
            "business_name": "Test Salon",
            "industry": "Salon",
            "source": "manual"
        })
        assert response.status_code == 200
        return response.json()["id"]
    
    def test_toggle_opt_in_on(self, auth_session, test_contact_id):
        """Test PATCH /api/network/contacts/{id}/opt-in toggles opt-in to true"""
        response = auth_session.patch(
            f"{BASE_URL}/api/network/contacts/{test_contact_id}/opt-in",
            json={"opted_in": True}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify the contact is now opted in
        contacts_response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        contacts = contacts_response.json()["contacts"]
        contact = next((c for c in contacts if c["id"] == test_contact_id), None)
        assert contact is not None, "Contact should exist"
        assert contact["opted_in"] == True, "Contact should be opted in"
    
    def test_toggle_opt_in_off(self, auth_session, test_contact_id):
        """Test toggling opt-in back to false"""
        response = auth_session.patch(
            f"{BASE_URL}/api/network/contacts/{test_contact_id}/opt-in",
            json={"opted_in": False}
        )
        assert response.status_code == 200
        
        # Verify the contact is now opted out
        contacts_response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        contacts = contacts_response.json()["contacts"]
        contact = next((c for c in contacts if c["id"] == test_contact_id), None)
        assert contact["opted_in"] == False, "Contact should be opted out"


class TestContactVerifyAndCCPAnalysis:
    """Tests for contact verification and CCP analysis"""
    
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
    def restaurant_contact_id(self, auth_session):
        """Create a restaurant contact (should be CCP flagged)"""
        response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_Restaurant Owner",
            "business_name": "Downtown Restaurant",
            "industry": "Restaurant",
            "email": "owner@restaurant.com",
            "source": "manual"
        })
        assert response.status_code == 200
        return response.json()["id"]
    
    @pytest.fixture(scope="class")
    def non_ccp_contact_id(self, auth_session):
        """Create a non-CCP contact (should not be flagged)"""
        response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_Software Developer",
            "business_name": "Tech Startup",
            "industry": "Software",
            "source": "manual"
        })
        assert response.status_code == 200
        return response.json()["id"]
    
    def test_verify_restaurant_contact_triggers_ccp_flag(self, auth_session, restaurant_contact_id):
        """Test PATCH /api/network/contacts/{id}/verify triggers CCP analysis for restaurant"""
        # First opt-in the contact
        auth_session.patch(
            f"{BASE_URL}/api/network/contacts/{restaurant_contact_id}/opt-in",
            json={"opted_in": True}
        )
        
        # Now verify
        response = auth_session.patch(
            f"{BASE_URL}/api/network/contacts/{restaurant_contact_id}/verify",
            json={"verified": True}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check that contact is now CCP flagged
        contacts_response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        contacts = contacts_response.json()["contacts"]
        contact = next((c for c in contacts if c["id"] == restaurant_contact_id), None)
        
        assert contact is not None, "Contact should exist"
        assert contact["verified"] == True, "Contact should be verified"
        assert contact["ccp_flagged"] == True, "Restaurant contact should be CCP flagged"
        assert contact["ccp_analysis"] is not None, "CCP analysis should be present"
        assert contact["ccp_analysis"]["match_probability"] == "High", "Match probability should be High"
    
    def test_verify_non_ccp_contact_not_flagged(self, auth_session, non_ccp_contact_id):
        """Test that non-CCP business is not flagged"""
        # Opt-in and verify
        auth_session.patch(
            f"{BASE_URL}/api/network/contacts/{non_ccp_contact_id}/opt-in",
            json={"opted_in": True}
        )
        response = auth_session.patch(
            f"{BASE_URL}/api/network/contacts/{non_ccp_contact_id}/verify",
            json={"verified": True}
        )
        assert response.status_code == 200
        
        # Check that contact is NOT CCP flagged
        contacts_response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        contacts = contacts_response.json()["contacts"]
        contact = next((c for c in contacts if c["id"] == non_ccp_contact_id), None)
        
        assert contact["verified"] == True, "Contact should be verified"
        assert contact["ccp_flagged"] == False, "Software contact should NOT be CCP flagged"
        assert contact["ccp_analysis"]["match_probability"] == "Low", "Match probability should be Low"
    
    def test_ccp_analysis_has_required_fields(self, auth_session, restaurant_contact_id):
        """Test that CCP analysis has all required fields"""
        contacts_response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        contacts = contacts_response.json()["contacts"]
        contact = next((c for c in contacts if c["id"] == restaurant_contact_id), None)
        
        analysis = contact["ccp_analysis"]
        required_fields = ["match_probability", "rationale", "analyzed_at"]
        for field in required_fields:
            assert field in analysis, f"CCP analysis missing '{field}'"
        
        # High probability contacts should have additional fields
        if analysis["match_probability"] == "High":
            assert "service" in analysis, "High probability should have 'service'"
            assert "estimated_volume" in analysis, "High probability should have 'estimated_volume'"
            assert "potential_residual" in analysis, "High probability should have 'potential_residual'"


class TestNotifications:
    """Tests for notifications endpoint"""
    
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
    
    def test_get_notifications_returns_200(self, auth_session):
        """Test GET /api/notifications returns 200"""
        response = auth_session.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_notifications_structure(self, auth_session):
        """Test notifications response structure"""
        response = auth_session.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        data = response.json()
        
        assert "notifications" in data, "Response should contain 'notifications'"
        assert isinstance(data["notifications"], list), "notifications should be a list"
    
    def test_ccp_notification_created_on_verify(self, auth_session):
        """Test that CCP notification is created when contact is verified and flagged"""
        # Create a new retail contact
        contact_response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_Retail Store Owner",
            "business_name": "Fashion Retail Store",
            "industry": "Retail",
            "source": "manual"
        })
        contact_id = contact_response.json()["id"]
        
        # Opt-in and verify
        auth_session.patch(f"{BASE_URL}/api/network/contacts/{contact_id}/opt-in", json={"opted_in": True})
        auth_session.patch(f"{BASE_URL}/api/network/contacts/{contact_id}/verify", json={"verified": True})
        
        # Check notifications
        notif_response = auth_session.get(f"{BASE_URL}/api/notifications")
        notifications = notif_response.json()["notifications"]
        
        # Find notification for this contact
        ccp_notif = next((n for n in notifications if n.get("contact_id") == contact_id), None)
        assert ccp_notif is not None, "CCP notification should be created for retail contact"
        assert ccp_notif["type"] == "ccp_opportunity", "Notification type should be 'ccp_opportunity'"
        assert "Retail Store Owner" in ccp_notif["title"], "Notification title should contain contact name"


class TestPromotionsCCPOnly:
    """Tests for promotions endpoint - should only return CCP + VA promotions"""
    
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
    
    def test_promotions_returns_only_ccp_and_va(self, auth_session):
        """Test GET /api/promotions/targeted returns only CCP and VA promotions (no Imago/Menio)"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        promotions = data["promotions"]
        
        # Should have exactly 2 promotions: CCP and VA
        assert len(promotions) == 2, f"Expected 2 promotions (CCP + VA), got {len(promotions)}"
        
        promo_ids = {p["id"] for p in promotions}
        expected_ids = {"connectclub-va", "ccp-merchant-services"}
        
        assert promo_ids == expected_ids, f"Expected {expected_ids}, got {promo_ids}"
    
    def test_no_imago_or_menio_promotions(self, auth_session):
        """Test that Imago Imaging and Menio Global are NOT in promotions"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200
        
        promotions = response.json()["promotions"]
        promo_ids = {p["id"] for p in promotions}
        
        assert "imago-imaging" not in promo_ids, "Imago Imaging should NOT be in promotions"
        assert "menio-global" not in promo_ids, "Menio Global should NOT be in promotions"
    
    def test_ccp_promotion_has_correct_content(self, auth_session):
        """Test CCP promotion has correct merchant services content"""
        response = auth_session.get(f"{BASE_URL}/api/promotions/targeted")
        assert response.status_code == 200
        
        promotions = response.json()["promotions"]
        ccp_promo = next((p for p in promotions if p["id"] == "ccp-merchant-services"), None)
        
        assert ccp_promo is not None, "CCP promotion should exist"
        assert "Merchant" in ccp_promo["headline"] or "Processing" in ccp_promo["headline"], \
            "CCP headline should mention Merchant or Processing"
        assert "interchange" in ccp_promo["subtext"].lower() or "pci" in ccp_promo["subtext"].lower(), \
            "CCP subtext should mention interchange or PCI"


class TestContactDelete:
    """Tests for contact deletion"""
    
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
    
    def test_delete_contact(self, auth_session):
        """Test DELETE /api/network/contacts/{id} removes contact"""
        # Create a contact to delete
        create_response = auth_session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "TEST_To Be Deleted",
            "source": "manual"
        })
        contact_id = create_response.json()["id"]
        
        # Delete the contact
        delete_response = auth_session.delete(f"{BASE_URL}/api/network/contacts/{contact_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        # Verify contact is gone
        contacts_response = auth_session.get(f"{BASE_URL}/api/network/contacts")
        contacts = contacts_response.json()["contacts"]
        contact = next((c for c in contacts if c["id"] == contact_id), None)
        assert contact is None, "Deleted contact should not exist"
    
    def test_delete_nonexistent_contact_returns_404(self, auth_session):
        """Test deleting non-existent contact returns 404"""
        response = auth_session.delete(f"{BASE_URL}/api/network/contacts/nonexistent-id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestAuthProtection:
    """Tests for authentication protection on endpoints"""
    
    def test_contacts_unauthorized_without_auth(self):
        """Test that contacts endpoint returns 401 without auth"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/network/contacts")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_notifications_unauthorized_without_auth(self):
        """Test that notifications endpoint returns 401 without auth"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_add_contact_unauthorized_without_auth(self):
        """Test that adding contact returns 401 without auth"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/network/contacts", json={
            "name": "Test",
            "source": "manual"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ConnectClubAPITester:
    def __init__(self, base_url="https://network-pay.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.admin_user_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        return success

    def test_health_check(self):
        """Test if backend is accessible"""
        try:
            response = self.session.get(f"{self.base_url}/api/auth/me")
            # Even 401 is good - means server is responding
            success = response.status_code in [200, 401]
            return self.log_test("Backend Health Check", success, 
                               f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            return self.log_test("Backend Health Check", False, str(e))

    def test_admin_login(self):
        """Test admin login"""
        try:
            data = {
                "email": "admin@connectclub.com",
                "password": "admin123"
            }
            response = self.session.post(f"{self.base_url}/api/auth/login", json=data)
            success = response.status_code == 200
            if success:
                user_data = response.json()
                self.admin_user_id = user_data.get("id")
                # Check if admin role
                success = user_data.get("role") == "admin"
            return self.log_test("Admin Login", success, 
                               f"Status: {response.status_code}, Role: {user_data.get('role') if success else 'N/A'}")
        except Exception as e:
            return self.log_test("Admin Login", False, str(e))

    def test_user_registration(self):
        """Test user registration"""
        try:
            timestamp = datetime.now().strftime("%H%M%S")
            data = {
                "email": f"test{timestamp}@example.com",
                "password": "test123",
                "name": f"Test User {timestamp}"
            }
            response = self.session.post(f"{self.base_url}/api/auth/register", json=data)
            success = response.status_code == 200
            if success:
                user_data = response.json()
                self.test_user_id = user_data.get("id")
                success = user_data.get("role") == "member" and not user_data.get("onboarding_completed")
            return self.log_test("User Registration", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("User Registration", False, str(e))

    def test_user_login(self):
        """Test user login with registered user"""
        try:
            timestamp = datetime.now().strftime("%H%M%S")
            # First register a user
            reg_data = {
                "email": f"testlogin{timestamp}@example.com",
                "password": "test123",
                "name": f"Test Login User {timestamp}"
            }
            reg_response = self.session.post(f"{self.base_url}/api/auth/register", json=reg_data)
            
            if reg_response.status_code != 200:
                return self.log_test("User Login", False, "Registration failed")
            
            # Now test login
            login_data = {
                "email": reg_data["email"],
                "password": reg_data["password"]
            }
            response = self.session.post(f"{self.base_url}/api/auth/login", json=login_data)
            success = response.status_code == 200
            if success:
                user_data = response.json()
                success = user_data.get("email") == reg_data["email"]
            return self.log_test("User Login", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("User Login", False, str(e))

    def test_auth_me_endpoint(self):
        """Test /auth/me endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/auth/me")
            success = response.status_code == 200
            if success:
                user_data = response.json()
                success = "id" in user_data and "email" in user_data
            return self.log_test("Auth Me Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Auth Me Endpoint", False, str(e))

    def test_platforms_endpoint(self):
        """Test platforms endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/platforms")
            success = response.status_code == 200
            if success:
                data = response.json()
                platforms = data.get("platforms", [])
                success = len(platforms) > 0  # Should have seeded platforms
            return self.log_test("Platforms Endpoint", success, 
                               f"Status: {response.status_code}, Platforms: {len(platforms) if success else 0}")
        except Exception as e:
            return self.log_test("Platforms Endpoint", False, str(e))

    def test_bundles_endpoint(self):
        """Test bundles endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/bundles")
            success = response.status_code == 200
            if success:
                data = response.json()
                bundles = data.get("bundles", [])
                success = len(bundles) > 0  # Should have seeded bundles
            return self.log_test("Bundles Endpoint", success, 
                               f"Status: {response.status_code}, Bundles: {len(bundles) if success else 0}")
        except Exception as e:
            return self.log_test("Bundles Endpoint", False, str(e))

    def test_onboarding_complete(self):
        """Test onboarding completion"""
        try:
            # Need to be logged in as a user
            if not self.test_user_id:
                return self.log_test("Onboarding Complete", False, "No test user available")
            
            onboarding_data = {
                "name": "Test User",
                "location": "Test City, TS",
                "contact_preference": "email",
                "industries": ["hospitality", "retail"],
                "industry_relationships": {
                    "hospitality": "working",
                    "retail": "acquaintance"
                },
                "income_goal": "1k-3k",
                "career_track": "young-professional",
                "availability": "part-time"
            }
            
            response = self.session.post(f"{self.base_url}/api/onboarding/complete", json=onboarding_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "profile" in data and "top_matches" in data
            return self.log_test("Onboarding Complete", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Onboarding Complete", False, str(e))

    def test_dashboard_endpoint(self):
        """Test dashboard endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/dashboard")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "earnings" in data and "top_matches" in data
            return self.log_test("Dashboard Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Dashboard Endpoint", False, str(e))

    def test_tax_summary_endpoint(self):
        """Test tax summary endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/tax/summary")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "gross_income" in data and "quarterly_set_aside" in data
            return self.log_test("Tax Summary Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Tax Summary Endpoint", False, str(e))

    def test_network_credits_endpoint(self):
        """Test network credits endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/network/credits")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "credits_available" in data and "referral_code" in data
            return self.log_test("Network Credits Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Network Credits Endpoint", False, str(e))

    def test_commissions_endpoint(self):
        """Test commissions endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/commissions")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "total_earned" in data and "introductions" in data
            return self.log_test("Commissions Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Commissions Endpoint", False, str(e))

    def test_education_content_endpoint(self):
        """Test education content endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/education/content")
            success = response.status_code == 200
            if success:
                data = response.json()
                content = data.get("content", [])
                success = len(content) > 0  # Should have seeded content
            return self.log_test("Education Content Endpoint", success, 
                               f"Status: {response.status_code}, Content items: {len(content) if success else 0}")
        except Exception as e:
            return self.log_test("Education Content Endpoint", False, str(e))

    def test_admin_stats_endpoint(self):
        """Test admin stats endpoint (requires admin login)"""
        try:
            # Login as admin first
            admin_data = {
                "email": "admin@connectclub.com",
                "password": "admin123"
            }
            login_response = self.session.post(f"{self.base_url}/api/auth/login", json=admin_data)
            if login_response.status_code != 200:
                return self.log_test("Admin Stats Endpoint", False, "Admin login failed")
            
            response = self.session.get(f"{self.base_url}/api/admin/stats")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "total_users" in data and "total_platforms" in data
            return self.log_test("Admin Stats Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Admin Stats Endpoint", False, str(e))

    def test_user_submission_endpoint(self):
        """Test user submission endpoint (public)"""
        try:
            submission_data = {
                "platform_name": "Test Platform",
                "website_url": "https://testplatform.com",
                "tracks": ["entry-level"],
                "category": "Testing",
                "description": "A test platform for testing purposes",
                "recommendation_reason": "Good for testing",
                "submitter_name": "Test Submitter",
                "submitter_email": "test@example.com"
            }
            
            response = self.session.post(f"{self.base_url}/api/submissions", json=submission_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "message" in data
            return self.log_test("User Submission Endpoint", success, 
                               f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("User Submission Endpoint", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting ConnectClub API Tests")
        print("=" * 50)
        
        # Basic connectivity
        self.test_health_check()
        
        # Authentication tests
        self.test_admin_login()
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me_endpoint()
        
        # Core functionality tests
        self.test_platforms_endpoint()
        self.test_bundles_endpoint()
        self.test_onboarding_complete()
        self.test_dashboard_endpoint()
        self.test_tax_summary_endpoint()
        self.test_network_credits_endpoint()
        self.test_commissions_endpoint()
        self.test_education_content_endpoint()
        
        # Admin tests
        self.test_admin_stats_endpoint()
        
        # Public endpoints
        self.test_user_submission_endpoint()
        
        # Summary
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ConnectClubAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
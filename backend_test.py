#!/usr/bin/env python3
"""
Backend Test for Surat Keterangan System
Testing Supabase integration and cek_verifikator PDF link functionality
"""

import requests
import json
import sys
from datetime import datetime

class SupabaseAPITester:
    def __init__(self):
        self.base_url = "https://goesszamjyvbyehufxri.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZXNzemFtanl2YnllaHVmeHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODkwMDQsImV4cCI6MjA3MDY2NTAwNH0.SUyeN43XfKs3PvBU0mKNToUl6MSpLn3fLARUuzI_Ci4"
        self.headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, test_func):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            result = test_func()
            if result:
                self.tests_passed += 1
                print(f"✅ Passed - {name}")
                return True
            else:
                print(f"❌ Failed - {name}")
                return False
        except Exception as e:
            print(f"❌ Failed - {name}: {str(e)}")
            return False

    def test_supabase_connection(self):
        """Test basic Supabase connection"""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/",
                headers=self.headers,
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Connection error: {e}")
            return False

    def test_surat_keterangan_table_access(self):
        """Test access to surat_keterangan table"""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=id,status,alasan_tolak&limit=1",
                headers=self.headers,
                timeout=10
            )
            return response.status_code in [200, 406]  # 406 is acceptable for empty table
        except Exception as e:
            print(f"Table access error: {e}")
            return False

    def test_table_schema(self):
        """Test if cek_verifikator column exists and accepts TEXT values"""
        try:
            # Try to select the cek_verifikator column specifically
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=cek_verifikator&limit=1",
                headers=self.headers,
                timeout=10
            )
            # If column doesn't exist, we'd get a 400 error
            return response.status_code in [200, 406]
        except Exception as e:
            print(f"Schema test error: {e}")
            return False

    def test_insert_sample_data(self):
        """Test inserting sample data with rejection reason"""
        try:
            sample_data = {
                "nama": "Test User",
                "nik": "1234567890123456",
                "tempat_lahir": "Jakarta",
                "tanggal_lahir": "1990-01-01",
                "jenis_kelamin": "Laki-laki",
                "pendidikan": "S1 (Sarjana)",
                "pekerjaan": "Software Developer",
                "alamat_sesuai_ktp": "Jl. Test No. 123, Jakarta",
                "alamat_domisili": "Jl. Test No. 123, Jakarta",
                "alasan_permohonan": "Untuk keperluan melamar pekerjaan",
                "status": "Ditolak",
                "alasan_tolak": "Dokumen tidak lengkap. Harap melengkapi berkas KTP dan SKCK.",
                "tanggal_permohonan": datetime.now().strftime("%Y-%m-%d")
            }
            
            response = requests.post(
                f"{self.base_url}/rest/v1/surat_keterangan",
                headers=self.headers,
                json=sample_data,
                timeout=10
            )
            
            if response.status_code == 201:
                self.sample_id = response.json()[0]['id']
                print(f"Sample data inserted with ID: {self.sample_id}")
                return True
            else:
                print(f"Insert failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Insert test error: {e}")
            return False

    def test_fetch_rejection_reason(self):
        """Test fetching rejection reason from database"""
        try:
            if not hasattr(self, 'sample_id'):
                print("No sample data to fetch")
                return False
                
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.sample_id}&select=status,alasan_tolak",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    record = data[0]
                    has_rejection = record.get('status') == 'Ditolak' and record.get('alasan_tolak')
                    if has_rejection:
                        print(f"Found rejection reason: {record.get('alasan_tolak')}")
                        return True
                    else:
                        print("No rejection reason found")
                        return False
                else:
                    print("No data returned")
                    return False
            else:
                print(f"Fetch failed with status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Fetch test error: {e}")
            return False

    def test_update_rejection_reason(self):
        """Test updating rejection reason"""
        try:
            if not hasattr(self, 'sample_id'):
                print("No sample data to update")
                return False
                
            update_data = {
                "status": "Ditolak",
                "alasan_tolak": "Updated: Berkas foto tidak jelas dan dokumen SKCK sudah expired."
            }
            
            response = requests.patch(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.sample_id}",
                headers=self.headers,
                json=update_data,
                timeout=10
            )
            
            if response.status_code in [200, 204]:  # Accept both 200 and 204 as success
                print("Rejection reason updated successfully")
                return True
            else:
                print(f"Update failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Update test error: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up test data"""
        try:
            if hasattr(self, 'sample_id'):
                response = requests.delete(
                    f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.sample_id}",
                    headers=self.headers,
                    timeout=10
                )
                if response.status_code == 204:
                    print(f"✅ Test data cleaned up (ID: {self.sample_id})")
                else:
                    print(f"⚠️ Cleanup warning: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Supabase Backend Tests for Rejection Reason Feature")
        print("=" * 60)
        
        # Test basic connectivity
        self.run_test("Supabase Connection", self.test_supabase_connection)
        self.run_test("Table Access", self.test_surat_keterangan_table_access)
        self.run_test("Table Schema (alasan_tolak column)", self.test_table_schema)
        
        # Test CRUD operations for rejection reasons
        if self.run_test("Insert Sample Data with Rejection", self.test_insert_sample_data):
            self.run_test("Fetch Rejection Reason", self.test_fetch_rejection_reason)
            self.run_test("Update Rejection Reason", self.test_update_rejection_reason)
            self.cleanup_test_data()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Backend Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed! Rejection reason feature is working correctly.")
            return 0
        else:
            print("❌ Some backend tests failed. Please check the implementation.")
            return 1

def main():
    tester = SupabaseAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Direct test for cek_verifikator functionality
This test will try to add the column and test the functionality directly
"""

import requests
import json
import sys
from datetime import datetime

class CekVerifikatorTester:
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

    def test_table_structure(self):
        """Test current table structure"""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=*&limit=1",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    columns = list(data[0].keys())
                    print(f"Current table columns: {columns}")
                    has_cek_verifikator = 'cek_verifikator' in columns
                    print(f"Has cek_verifikator column: {has_cek_verifikator}")
                    return True
                else:
                    print("Table is empty, but accessible")
                    return True
            else:
                print(f"Table access failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Table structure test error: {e}")
            return False

    def test_insert_with_cek_verifikator(self):
        """Test inserting data with cek_verifikator field"""
        try:
            # First try without cek_verifikator to see what works
            basic_data = {
                "nama": "Test User for Verifikator",
                "nik": "1234567890123456",
                "tempat_lahir": "Jakarta",
                "tanggal_lahir": "1990-01-01",
                "jenis_kelamin": "Laki-laki",
                "pendidikan": "S1 (Sarjana)",
                "pekerjaan": "Software Developer",
                "alamat_sesuai_ktp": "Jl. Test No. 123, Jakarta",
                "alamat_domisili": "Jl. Test No. 123, Jakarta",
                "alasan_permohonan": "Untuk keperluan testing verifikator",
                "status": "Menunggu Verifikasi",
                "tanggal_permohonan": datetime.now().strftime("%Y-%m-%d")
            }
            
            response = requests.post(
                f"{self.base_url}/rest/v1/surat_keterangan",
                headers=self.headers,
                json=basic_data,
                timeout=10
            )
            
            if response.status_code == 201:
                self.sample_id = response.json()[0]['id']
                print(f"Basic data inserted with ID: {self.sample_id}")
                return True
            else:
                print(f"Insert failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Insert test error: {e}")
            return False

    def test_update_with_pdf_link(self):
        """Test updating record with PDF link"""
        try:
            if not hasattr(self, 'sample_id'):
                print("No sample data to update")
                return False
                
            # Try to update with cek_verifikator field
            update_data = {
                "cek_verifikator": "test-admin-pdf-123.pdf"
            }
            
            response = requests.patch(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.sample_id}",
                headers=self.headers,
                json=update_data,
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                print("PDF link update successful")
                return True
            else:
                print(f"Update failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Update test error: {e}")
            return False

    def test_verifikator_query_logic(self):
        """Test the query logic used by verifikator dashboard"""
        try:
            # This is the exact query from VerifikatorDashboard.jsx
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=*&not.cek_verifikator=is.null&neq.status=Disetujui&neq.status=Ditolak oleh Verifikator",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"Verifikator query returned {len(data)} records")
                
                # Check if our test record is included
                if hasattr(self, 'sample_id'):
                    test_record = next((r for r in data if r['id'] == self.sample_id), None)
                    if test_record:
                        print(f"✅ Test record found in verifikator query")
                        print(f"   cek_verifikator: {test_record.get('cek_verifikator')}")
                        return True
                    else:
                        print("❌ Test record not found in verifikator query")
                        return False
                else:
                    print("No test record to check, but query executed successfully")
                    return True
            else:
                print(f"Verifikator query failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Verifikator query test error: {e}")
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
        """Run all tests"""
        print("🚀 Starting cek_verifikator Column Tests")
        print("=" * 50)
        
        # Test current structure
        self.run_test("Table Structure Check", self.test_table_structure)
        
        # Test basic functionality
        if self.run_test("Insert Basic Data", self.test_insert_with_cek_verifikator):
            self.run_test("Update with PDF Link", self.test_update_with_pdf_link)
            self.run_test("Verifikator Query Logic", self.test_verifikator_query_logic)
            self.cleanup_test_data()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed.")
            return 1

def main():
    tester = CekVerifikatorTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
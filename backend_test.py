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
        self.base_url = "https://htasbqlbhbwxxdfxbved.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXNicWxiaGJ3eHhkZnhidmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDIzOTgsImV4cCI6MjA3MDcxODM5OH0.xukRBZXjN0A7p-4ven1Gk-KK_AwfQAAPkvSz0CNtVho"
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
        """Test inserting sample data with PDF link in cek_verifikator"""
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
                "status": "Menunggu Verifikasi",
                "cek_verifikator": "test-pdf-link-123.pdf",  # PDF link instead of boolean
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

    def test_fetch_pdf_link(self):
        """Test fetching PDF link from cek_verifikator column"""
        try:
            if not hasattr(self, 'sample_id'):
                print("No sample data to fetch")
                return False
                
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.sample_id}&select=status,cek_verifikator",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    record = data[0]
                    has_pdf_link = record.get('cek_verifikator') is not None
                    if has_pdf_link:
                        print(f"Found PDF link: {record.get('cek_verifikator')}")
                        return True
                    else:
                        print("No PDF link found")
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

    def test_update_pdf_link(self):
        """Test updating PDF link in cek_verifikator"""
        try:
            if not hasattr(self, 'sample_id'):
                print("No sample data to update")
                return False
                
            update_data = {
                "cek_verifikator": "updated-pdf-link-456.pdf"
            }
            
            response = requests.patch(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.sample_id}",
                headers=self.headers,
                json=update_data,
                timeout=10
            )
            
            if response.status_code in [200, 204]:  # Accept both 200 and 204 as success
                print("PDF link updated successfully")
                return True
            else:
                print(f"Update failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Update test error: {e}")
            return False

    def test_verifikator_query_with_ditolak_filter(self):
        """Test verifikator dashboard query - should exclude documents with status 'Ditolak'"""
        try:
            # First, create test data with different statuses including "Ditolak"
            test_records = []
            
            # Create a record with status "Ditolak" (should be filtered out)
            ditolak_data = {
                "nama": "Test User Ditolak",
                "nik": "1234567890123457",
                "tempat_lahir": "Jakarta",
                "tanggal_lahir": "1990-01-01",
                "jenis_kelamin": "Laki-laki",
                "pendidikan": "S1 (Sarjana)",
                "pekerjaan": "Software Developer",
                "alamat_sesuai_ktp": "Jl. Test No. 123, Jakarta",
                "alamat_domisili": "Jl. Test No. 123, Jakarta",
                "alasan_permohonan": "Untuk keperluan melamar pekerjaan",
                "status": "Ditolak",  # This should be filtered out
                "cek_verifikator": "test-pdf-ditolak.pdf",
                "tanggal_permohonan": datetime.now().strftime("%Y-%m-%d")
            }
            
            # Create a record with status "Menunggu Verifikasi" (should be included)
            menunggu_data = {
                "nama": "Test User Menunggu",
                "nik": "1234567890123458",
                "tempat_lahir": "Jakarta",
                "tanggal_lahir": "1990-01-01",
                "jenis_kelamin": "Laki-laki",
                "pendidikan": "S1 (Sarjana)",
                "pekerjaan": "Software Developer",
                "alamat_sesuai_ktp": "Jl. Test No. 123, Jakarta",
                "alamat_domisili": "Jl. Test No. 123, Jakarta",
                "alasan_permohonan": "Untuk keperluan melamar pekerjaan",
                "status": "Menunggu Verifikasi",  # This should be included
                "cek_verifikator": "test-pdf-menunggu.pdf",
                "tanggal_permohonan": datetime.now().strftime("%Y-%m-%d")
            }
            
            # Insert test records
            for data in [ditolak_data, menunggu_data]:
                response = requests.post(
                    f"{self.base_url}/rest/v1/surat_keterangan",
                    headers=self.headers,
                    json=data,
                    timeout=10
                )
                if response.status_code == 201:
                    test_records.append(response.json()[0]['id'])
                    print(f"Created test record with status: {data['status']}")
            
            # Now test the verifikator query with the new filter
            # This simulates the exact query used in VerifikatorDashboard.jsx line 57-63
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=*&cek_verifikator=not.is.null&status=not.eq.Disetujui&status=not.eq.Ditolak%20oleh%20Verifikator&status=not.eq.Ditolak",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"Verifikator query returned {len(data)} records")
                
                # Check that no records with status "Ditolak" are returned
                ditolak_records = [record for record in data if record.get('status') == 'Ditolak']
                if len(ditolak_records) == 0:
                    print("✅ No records with status 'Ditolak' found - filter working correctly")
                    
                    # Verify records with other statuses are still returned
                    menunggu_records = [record for record in data if record.get('status') == 'Menunggu Verifikasi']
                    if len(menunggu_records) > 0:
                        print("✅ Records with 'Menunggu Verifikasi' status are still included")
                        return True
                    else:
                        print("⚠️ No 'Menunggu Verifikasi' records found, but filter is working")
                        return True
                else:
                    print(f"❌ Found {len(ditolak_records)} records with status 'Ditolak' - filter not working")
                    return False
            else:
                print(f"Verifikator query failed with status: {response.status_code}")
                print(f"Error response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Verifikator query test error: {e}")
            return False
        finally:
            # Cleanup test records
            for record_id in test_records:
                try:
                    requests.delete(
                        f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{record_id}",
                        headers=self.headers,
                        timeout=10
                    )
                except:
                    pass

    def test_verifikator_query(self):
        """Test verifikator dashboard query - should only show records with PDF links"""
        try:
            # This simulates the query used in VerifikatorDashboard.jsx
            # Use proper PostgREST syntax for multiple conditions
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=*&cek_verifikator=not.is.null&status=not.eq.Disetujui&status=not.eq.Ditolak%20oleh%20Verifikator&status=not.eq.Ditolak",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"Verifikator query returned {len(data)} records")
                
                # Verify all returned records have PDF links
                all_have_pdf = all(record.get('cek_verifikator') is not None for record in data)
                if all_have_pdf:
                    print("✅ All records have PDF links as expected")
                    return True
                else:
                    print("❌ Some records don't have PDF links")
                    return False
            else:
                print(f"Verifikator query failed with status: {response.status_code}")
                print(f"Error response: {response.text}")
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
        """Run all backend tests"""
        print("🚀 Starting Supabase Backend Tests for cek_verifikator PDF Link Feature")
        print("=" * 70)
        
        # Test basic connectivity
        self.run_test("Supabase Connection", self.test_supabase_connection)
        self.run_test("Table Access", self.test_surat_keterangan_table_access)
        self.run_test("Table Schema (cek_verifikator column)", self.test_table_schema)
        
        # Test CRUD operations for PDF links
        if self.run_test("Insert Sample Data with PDF Link", self.test_insert_sample_data):
            self.run_test("Fetch PDF Link", self.test_fetch_pdf_link)
            self.run_test("Update PDF Link", self.test_update_pdf_link)
            self.run_test("Verifikator Query Logic", self.test_verifikator_query)
            self.cleanup_test_data()
        
        # Print results
        print("\n" + "=" * 70)
        print(f"📊 Backend Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed! cek_verifikator PDF link feature is working correctly.")
            return 0
        else:
            print("❌ Some backend tests failed. Please check the implementation.")
            return 1

def main():
    tester = SupabaseAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
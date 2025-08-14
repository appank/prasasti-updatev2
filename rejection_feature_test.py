#!/usr/bin/env python3
"""
Backend Test for New Rejection Features
Testing alasan_tolak column and rejection workflow functionality
"""

import requests
import json
import sys
from datetime import datetime

class RejectionFeatureTester:
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
        self.sample_ids = []

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

    def test_alasan_tolak_column_exists(self):
        """Test if alasan_tolak column exists in the table"""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=alasan_tolak&limit=1",
                headers=self.headers,
                timeout=10
            )
            return response.status_code in [200, 406]
        except Exception as e:
            print(f"Column test error: {e}")
            return False

    def test_insert_data_with_rejection_reason(self):
        """Test inserting data with rejection reason"""
        try:
            sample_data = {
                "nama": "Test Rejection User",
                "nik": "9876543210987654",
                "tempat_lahir": "Bandung",
                "tanggal_lahir": "1985-05-15",
                "jenis_kelamin": "Perempuan",
                "pendidikan": "S1 (Sarjana)",
                "pekerjaan": "Teacher",
                "alamat_sesuai_ktp": "Jl. Rejection Test No. 456, Bandung",
                "alamat_domisili": "Jl. Rejection Test No. 456, Bandung",
                "alasan_permohonan": "Untuk keperluan administrasi",
                "status": "Ditolak oleh Verifikator",
                "alasan_tolak": "Dokumen tidak lengkap dan foto tidak jelas",
                "cek_verifikator": "rejected-document-123.pdf",
                "tanggal_permohonan": datetime.now().strftime("%Y-%m-%d")
            }
            
            response = requests.post(
                f"{self.base_url}/rest/v1/surat_keterangan",
                headers=self.headers,
                json=sample_data,
                timeout=10
            )
            
            if response.status_code == 201:
                self.rejected_sample_id = response.json()[0]['id']
                self.sample_ids.append(self.rejected_sample_id)
                print(f"Rejected sample data inserted with ID: {self.rejected_sample_id}")
                return True
            else:
                print(f"Insert failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Insert test error: {e}")
            return False

    def test_fetch_rejection_reason(self):
        """Test fetching rejection reason from alasan_tolak column"""
        try:
            if not hasattr(self, 'rejected_sample_id'):
                print("No rejected sample data to fetch")
                return False
                
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.rejected_sample_id}&select=status,alasan_tolak",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    record = data[0]
                    has_rejection_reason = record.get('alasan_tolak') is not None
                    is_rejected_status = record.get('status') == "Ditolak oleh Verifikator"
                    
                    if has_rejection_reason and is_rejected_status:
                        print(f"Found rejection reason: {record.get('alasan_tolak')}")
                        print(f"Status: {record.get('status')}")
                        return True
                    else:
                        print(f"Missing rejection reason or wrong status: {record}")
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

    def test_resubmission_workflow(self):
        """Test the resubmission workflow - changing status from 'Ditolak oleh Verifikator' to 'Menunggu Verifikasi'"""
        try:
            if not hasattr(self, 'rejected_sample_id'):
                print("No rejected sample data to test resubmission")
                return False
                
            # Simulate admin resubmitting after fixing issues
            update_data = {
                "status": "Menunggu Verifikasi",
                "cek_verifikator": "resubmitted-document-456.pdf",
                "alasan_tolak": None  # Clear the rejection reason
            }
            
            response = requests.patch(
                f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.rejected_sample_id}",
                headers=self.headers,
                json=update_data,
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                print("Resubmission workflow updated successfully")
                
                # Verify the update
                verify_response = requests.get(
                    f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.rejected_sample_id}&select=status,alasan_tolak,cek_verifikator",
                    headers=self.headers,
                    timeout=10
                )
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()[0]
                    status_updated = verify_data.get('status') == "Menunggu Verifikasi"
                    reason_cleared = verify_data.get('alasan_tolak') is None
                    pdf_updated = verify_data.get('cek_verifikator') == "resubmitted-document-456.pdf"
                    
                    if status_updated and reason_cleared and pdf_updated:
                        print("✅ Resubmission workflow verified: status updated, reason cleared, PDF updated")
                        return True
                    else:
                        print(f"❌ Verification failed: status={status_updated}, reason_cleared={reason_cleared}, pdf_updated={pdf_updated}")
                        return False
                else:
                    print("Failed to verify resubmission update")
                    return False
            else:
                print(f"Resubmission update failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Resubmission test error: {e}")
            return False

    def test_admin_dashboard_query(self):
        """Test admin dashboard query - should show rejection reasons for rejected documents"""
        try:
            # Create another rejected document for testing
            sample_data = {
                "nama": "Another Rejected User",
                "nik": "1111222233334444",
                "tempat_lahir": "Surabaya",
                "tanggal_lahir": "1990-12-25",
                "jenis_kelamin": "Laki-laki",
                "pendidikan": "SMA/Sederajat",
                "pekerjaan": "Mechanic",
                "alamat_sesuai_ktp": "Jl. Admin Test No. 789, Surabaya",
                "alamat_domisili": "Jl. Admin Test No. 789, Surabaya",
                "alasan_permohonan": "Untuk keperluan bank",
                "status": "Ditolak oleh Verifikator",
                "alasan_tolak": "Alamat tidak sesuai dengan KTP",
                "cek_verifikator": "admin-test-document-789.pdf",
                "tanggal_permohonan": datetime.now().strftime("%Y-%m-%d")
            }
            
            response = requests.post(
                f"{self.base_url}/rest/v1/surat_keterangan",
                headers=self.headers,
                json=sample_data,
                timeout=10
            )
            
            if response.status_code == 201:
                admin_test_id = response.json()[0]['id']
                self.sample_ids.append(admin_test_id)
                
                # Query for rejected documents (simulating AdminDashboard query)
                query_response = requests.get(
                    f"{self.base_url}/rest/v1/surat_keterangan?status=eq.Ditolak%20oleh%20Verifikator&select=id,nama,status,alasan_tolak",
                    headers=self.headers,
                    timeout=10
                )
                
                if query_response.status_code == 200:
                    rejected_docs = query_response.json()
                    print(f"Found {len(rejected_docs)} rejected documents")
                    
                    # Verify all rejected documents have rejection reasons
                    all_have_reasons = all(doc.get('alasan_tolak') is not None for doc in rejected_docs)
                    
                    if all_have_reasons and len(rejected_docs) >= 1:
                        print("✅ All rejected documents have rejection reasons")
                        for doc in rejected_docs:
                            print(f"  - {doc['nama']}: {doc['alasan_tolak'][:50]}...")
                        return True
                    else:
                        print("❌ Some rejected documents don't have rejection reasons")
                        return False
                else:
                    print(f"Admin query failed with status: {query_response.status_code}")
                    return False
            else:
                print(f"Failed to create admin test data: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Admin dashboard test error: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up all test data"""
        try:
            for sample_id in self.sample_ids:
                response = requests.delete(
                    f"{self.base_url}/rest/v1/surat_keterangan?id=eq.{sample_id}",
                    headers=self.headers,
                    timeout=10
                )
                if response.status_code == 204:
                    print(f"✅ Test data cleaned up (ID: {sample_id})")
                else:
                    print(f"⚠️ Cleanup warning for ID {sample_id}: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")

    def run_all_tests(self):
        """Run all rejection feature tests"""
        print("🚀 Starting Rejection Feature Tests for alasan_tolak Column")
        print("=" * 70)
        
        # Test new rejection features
        self.run_test("Alasan Tolak Column Exists", self.test_alasan_tolak_column_exists)
        
        if self.run_test("Insert Data with Rejection Reason", self.test_insert_data_with_rejection_reason):
            self.run_test("Fetch Rejection Reason", self.test_fetch_rejection_reason)
            self.run_test("Resubmission Workflow", self.test_resubmission_workflow)
        
        self.run_test("Admin Dashboard Query", self.test_admin_dashboard_query)
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print results
        print("\n" + "=" * 70)
        print(f"📊 Rejection Feature Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All rejection feature tests passed! New features are working correctly.")
            return 0
        else:
            print("❌ Some rejection feature tests failed. Please check the implementation.")
            return 1

def main():
    tester = RejectionFeatureTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
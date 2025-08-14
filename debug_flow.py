#!/usr/bin/env python3
"""
Debug script to test the full flow:
1. Create test data (simulate user submission)  
2. Simulate admin approve process (set cek_verifikator)
3. Test verifikator dashboard query
4. Test final verifikator approve process
"""

import requests
import json
from datetime import datetime
import time

class FlowDebugger:
    def __init__(self):
        self.base_url = "https://htasbqlbhbwxxdfxbved.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXNicWxiaGJ3eHhkZnhidmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDIzOTgsImV4cCI6MjA3MDcxODM5OH0.xukRBZXjN0A7p-4ven1Gk-KK_AwfQAAPkvSz0CNtVho"
        self.headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        self.test_id = None
        
    def step_1_create_test_data(self):
        """Step 1: Simulate user submission"""
        print("🔍 STEP 1: Creating test data (simulate user submission)...")
        
        test_data = {
            'nama': 'Test Debug User',
            'nik': '9876543210123456',
            'tempat_lahir': 'Bandung',
            'tanggal_lahir': '1995-05-15',
            'jenis_kelamin': 'Perempuan',
            'pendidikan': 'S1 (Sarjana)',
            'pekerjaan': 'System Analyst',
            'alamat_sesuai_ktp': 'Jl. Debug Street No. 456, Bandung',
            'alamat_domisili': 'Jl. Debug Street No. 456, Bandung',
            'alasan_permohonan': 'Untuk keperluan debugging admin to verifikator flow',
            'status': 'Menunggu Verifikasi',
            'nomor': f'DEBUG/{int(time.time())}/2025',
            'tanggal_permohonan': datetime.now().strftime('%Y-%m-%d'),
            'tanggal': datetime.now().strftime('%Y-%m-%d'),
            'pejabat': 'Dr. Debug Officer'
        }
        
        # Try with minimal data first to avoid RLS issues
        minimal_data = {
            'nama': test_data['nama'],
            'status': test_data['status'],
            'nomor': test_data['nomor']
        }
        
        try:
            response = requests.post(f'{self.base_url}/rest/v1/surat_keterangan', 
                                   headers=self.headers, json=minimal_data)
            
            if response.status_code == 201:
                self.test_id = response.json()[0]['id']
                print(f"✅ Test data created successfully with ID: {self.test_id}")
                return True
            else:
                print(f"❌ Failed to create test data: {response.status_code}")
                print(f"Response: {response.text}")
                
                # Try different approach - check if there's existing data
                print("\n🔍 Checking existing data...")
                check_response = requests.get(f'{self.base_url}/rest/v1/surat_keterangan?select=id,nama,status,cek_verifikator&limit=5', 
                                            headers=self.headers)
                if check_response.status_code == 200:
                    existing_data = check_response.json()
                    print(f"Found {len(existing_data)} existing records:")
                    for record in existing_data:
                        print(f"  - ID: {record['id']}, Name: {record['nama']}, Status: {record['status']}, cek_verifikator: {record['cek_verifikator']}")
                    
                    # Use existing data for testing if available
                    if existing_data and not existing_data[0]['cek_verifikator']:
                        self.test_id = existing_data[0]['id']
                        print(f"📝 Using existing record ID: {self.test_id} for testing")
                        return True
                        
                return False
                
        except Exception as e:
            print(f"❌ Exception in step 1: {str(e)}")
            return False
            
    def step_2_simulate_admin_approve(self):
        """Step 2: Simulate admin approve (set cek_verifikator)"""
        if not self.test_id:
            print("❌ No test ID available for admin approve simulation")
            return False
            
        print(f"\n🔍 STEP 2: Simulating admin approve for ID: {self.test_id}...")
        
        # This simulates what happens in SuratKeteranganPage.jsx when admin clicks "Setujui & Kirim"
        pdf_filename = f'test_admin_pdf_{self.test_id}_{int(time.time())}.pdf'
        admin_update = {
            'cek_verifikator': pdf_filename,
            # Status should remain the same (Menunggu Verifikasi)
        }
        
        try:
            response = requests.patch(f'{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.test_id}', 
                                    headers=self.headers, json=admin_update)
            
            if response.status_code in [200, 204]:
                print(f"✅ Admin approve simulation successful")
                print(f"   PDF filename set: {pdf_filename}")
                
                # Verify the update
                verify_response = requests.get(f'{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.test_id}&select=id,nama,status,cek_verifikator', 
                                             headers=self.headers)
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    if verify_data:
                        record = verify_data[0]
                        print(f"   Verified - Status: {record['status']}, cek_verifikator: {record['cek_verifikator']}")
                        return True
                        
                return True
            else:
                print(f"❌ Admin approve simulation failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception in step 2: {str(e)}")
            return False
            
    def step_3_test_verifikator_query(self):
        """Step 3: Test verifikator dashboard query"""
        print(f"\n🔍 STEP 3: Testing verifikator dashboard query...")
        
        # This is the exact query from VerifikatorDashboard.jsx
        # Using PostgREST REST API syntax
        query_params = [
            'select=*',
            'cek_verifikator=not.is.null',
            'status=neq.Disetujui',
            'status=neq.Ditolak%20oleh%20Verifikator'
        ]
        
        query_url = f"{self.base_url}/rest/v1/surat_keterangan?{'&'.join(query_params)}"
        print(f"Query URL: {query_url}")
        
        try:
            response = requests.get(query_url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Verifikator query successful: {len(data)} records found")
                
                # Check if our test record is included
                if self.test_id:
                    test_record = next((r for r in data if r['id'] == self.test_id), None)
                    if test_record:
                        print(f"✅ Our test record (ID: {self.test_id}) is included in verifikator query")
                        print(f"   Record details: Name: {test_record['nama']}, Status: {test_record['status']}, cek_verifikator: {test_record['cek_verifikator']}")
                        return True
                    else:
                        print(f"❌ Our test record (ID: {self.test_id}) is NOT included in verifikator query")
                        print("   This indicates the issue!")
                        
                        # Debug why it's not included
                        debug_response = requests.get(f'{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.test_id}&select=*', 
                                                    headers=self.headers)
                        if debug_response.status_code == 200:
                            debug_data = debug_response.json()
                            if debug_data:
                                record = debug_data[0]
                                print(f"   Debug - Full record: {json.dumps(record, indent=2)}")
                                
                                # Check each condition
                                has_pdf = record.get('cek_verifikator') is not None
                                is_not_approved = record.get('status') != 'Disetujui'
                                is_not_rejected_by_verifikator = record.get('status') != 'Ditolak oleh Verifikator'
                                
                                print(f"   Debug - Conditions:")
                                print(f"     - Has PDF (cek_verifikator not null): {has_pdf}")
                                print(f"     - Status != 'Disetujui': {is_not_approved}")
                                print(f"     - Status != 'Ditolak oleh Verifikator': {is_not_rejected_by_verifikator}")
                                
                                if not has_pdf:
                                    print("   🎯 ROOT CAUSE: cek_verifikator is NULL - Admin approve didn't set PDF link!")
                                elif not is_not_approved:
                                    print("   🎯 ROOT CAUSE: Status is 'Disetujui' - Should remain 'Menunggu Verifikasi'")
                                elif not is_not_rejected_by_verifikator:
                                    print("   🎯 ROOT CAUSE: Status is 'Ditolak oleh Verifikator'")
                        
                        return False
                else:
                    print("✅ Query successful but no test record to verify")
                    return True
                    
            else:
                print(f"❌ Verifikator query failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception in step 3: {str(e)}")
            return False
            
    def step_4_test_verifikator_approve(self):
        """Step 4: Test verifikator final approve"""
        if not self.test_id:
            print("❌ No test ID available for verifikator approve test")
            return False
            
        print(f"\n🔍 STEP 4: Testing verifikator final approve for ID: {self.test_id}...")
        
        # This simulates what happens in VerifikatorDashboard.jsx when verifikator clicks "Setuju & Kirim"
        verifikator_update = {
            'status': 'Disetujui',
            # In real implementation, cek_verifikator value would be moved to file_url
        }
        
        try:
            response = requests.patch(f'{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.test_id}', 
                                    headers=self.headers, json=verifikator_update)
            
            if response.status_code in [200, 204]:
                print(f"✅ Verifikator approve simulation successful")
                
                # Verify the update
                verify_response = requests.get(f'{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.test_id}&select=id,nama,status,cek_verifikator,file_url', 
                                             headers=self.headers)
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    if verify_data:
                        record = verify_data[0]
                        print(f"   Verified - Status: {record['status']}, cek_verifikator: {record['cek_verifikator']}, file_url: {record['file_url']}")
                        return True
                        
                return True
            else:
                print(f"❌ Verifikator approve simulation failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception in step 4: {str(e)}")
            return False
            
    def cleanup(self):
        """Clean up test data"""
        if self.test_id:
            try:
                response = requests.delete(f'{self.base_url}/rest/v1/surat_keterangan?id=eq.{self.test_id}', 
                                         headers=self.headers)
                if response.status_code == 204:
                    print(f"\n✅ Test data cleaned up (ID: {self.test_id})")
                else:
                    print(f"\n⚠️ Cleanup warning for ID {self.test_id}: {response.status_code}")
            except Exception as e:
                print(f"\n⚠️ Cleanup error: {str(e)}")
                
    def run_full_debug(self):
        """Run complete debugging flow"""
        print("🚀 STARTING FULL FLOW DEBUG")
        print("=" * 60)
        
        success_count = 0
        total_steps = 4
        
        # Step 1: Create test data
        if self.step_1_create_test_data():
            success_count += 1
            
            # Step 2: Simulate admin approve  
            if self.step_2_simulate_admin_approve():
                success_count += 1
                
                # Step 3: Test verifikator query
                if self.step_3_test_verifikator_query():
                    success_count += 1
                    
                    # Step 4: Test verifikator approve
                    if self.step_4_test_verifikator_approve():
                        success_count += 1
        
        # Results
        print("\n" + "=" * 60)
        print(f"📊 DEBUG RESULTS: {success_count}/{total_steps} steps successful")
        
        if success_count == total_steps:
            print("🎉 ALL STEPS SUCCESSFUL - No issues found in the flow!")
        else:
            print("❌ ISSUES FOUND - Check the failed steps above for root cause")
            
        # Cleanup
        self.cleanup()
        
        return success_count == total_steps

if __name__ == "__main__":
    debugger = FlowDebugger()
    debugger.run_full_debug()
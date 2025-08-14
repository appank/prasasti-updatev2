#!/usr/bin/env python3
"""
Comprehensive Test Report for Surat Keterangan System
This script provides a complete analysis of the system and identifies the root cause
"""

import requests
import json
import sys
from datetime import datetime

class ComprehensiveTestReport:
    def __init__(self):
        self.base_url = "https://htasbqlbhbwxxdfxbved.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXNicWxiaGJ3eHhkZnhidmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDIzOTgsImV4cCI6MjA3MDcxODM5OH0.xukRBZXjN0A7p-4ven1Gk-KK_AwfQAAPkvSz0CNtVho"
        self.headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        self.issues_found = []
        self.recommendations = []

    def test_database_connectivity(self):
        """Test basic database connectivity"""
        print("🔍 Testing Database Connectivity...")
        try:
            response = requests.get(f"{self.base_url}/rest/v1/", headers=self.headers, timeout=10)
            if response.status_code == 200:
                print("✅ Database connectivity: OK")
                return True
            else:
                print(f"❌ Database connectivity failed: {response.status_code}")
                self.issues_found.append("Database connectivity failed")
                return False
        except Exception as e:
            print(f"❌ Database connectivity error: {e}")
            self.issues_found.append(f"Database connectivity error: {e}")
            return False

    def test_table_structure(self):
        """Test if the surat_keterangan table has the correct structure"""
        print("\n🔍 Testing Table Structure...")
        try:
            # Test if we can access the table and key columns
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=id,nama,status,cek_verifikator,file_url&limit=1",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 406]:  # 406 is OK for empty table
                print("✅ Table structure: OK (all required columns exist)")
                return True
            else:
                print(f"❌ Table structure issue: {response.status_code}")
                print(f"Response: {response.text}")
                self.issues_found.append("Table structure issue - missing columns")
                return False
        except Exception as e:
            print(f"❌ Table structure error: {e}")
            self.issues_found.append(f"Table structure error: {e}")
            return False

    def analyze_current_data(self):
        """Analyze current data in the system"""
        print("\n🔍 Analyzing Current Data...")
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=*",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                total_records = len(data)
                print(f"📊 Total records in database: {total_records}")
                
                if total_records == 0:
                    print("⚠️ NO DATA FOUND - This is the root cause!")
                    self.issues_found.append("No data in database - no user submissions exist")
                    self.recommendations.append("Users need to submit surat keterangan requests first")
                    return data
                
                # Analyze data by status
                status_counts = {}
                cek_verifikator_counts = {"null": 0, "not_null": 0}
                
                for record in data:
                    status = record.get('status', 'Unknown')
                    status_counts[status] = status_counts.get(status, 0) + 1
                    
                    if record.get('cek_verifikator') is None:
                        cek_verifikator_counts["null"] += 1
                    else:
                        cek_verifikator_counts["not_null"] += 1
                
                print("\n📈 Data Analysis:")
                print("Status distribution:")
                for status, count in status_counts.items():
                    print(f"  - {status}: {count}")
                
                print(f"\ncek_verifikator field:")
                print(f"  - NULL (not approved by admin): {cek_verifikator_counts['null']}")
                print(f"  - NOT NULL (approved by admin): {cek_verifikator_counts['not_null']}")
                
                # Check what should appear in verifikator dashboard
                should_appear = [r for r in data 
                               if r.get('cek_verifikator') is not None 
                               and r.get('status') not in ['Disetujui', 'Ditolak oleh Verifikator']]
                
                print(f"\n🎯 Records that SHOULD appear in verifikator dashboard: {len(should_appear)}")
                
                if len(should_appear) == 0:
                    if cek_verifikator_counts["null"] > 0:
                        self.issues_found.append("Admin has not approved any submissions yet")
                        self.recommendations.append("Admin needs to click 'Setujui & Kirim' on submissions")
                    else:
                        self.issues_found.append("All submissions have been processed")
                
                return data
            else:
                print(f"❌ Data analysis failed: {response.status_code}")
                self.issues_found.append("Cannot access data for analysis")
                return []
                
        except Exception as e:
            print(f"❌ Data analysis error: {e}")
            self.issues_found.append(f"Data analysis error: {e}")
            return []

    def test_verifikator_query(self):
        """Test the exact query used by verifikator dashboard"""
        print("\n🔍 Testing Verifikator Dashboard Query...")
        try:
            # This is the exact query from VerifikatorDashboard.jsx line 57-62
            response = requests.get(
                f"{self.base_url}/rest/v1/surat_keterangan?select=*&cek_verifikator=not.is.null&status=not.eq.Disetujui&status=not.eq.Ditolak%20oleh%20Verifikator",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Verifikator query successful: {len(data)} records found")
                
                if len(data) == 0:
                    print("⚠️ CONFIRMED: Verifikator dashboard will be empty")
                    self.issues_found.append("Verifikator dashboard query returns 0 records")
                else:
                    print("✅ Verifikator dashboard should show data")
                    for record in data:
                        print(f"  - ID {record.get('id')}: {record.get('nama')} ({record.get('status')})")
                
                return data
            else:
                print(f"❌ Verifikator query failed: {response.status_code}")
                self.issues_found.append("Verifikator query failed")
                return []
                
        except Exception as e:
            print(f"❌ Verifikator query error: {e}")
            self.issues_found.append(f"Verifikator query error: {e}")
            return []

    def generate_action_plan(self):
        """Generate specific action plan to fix the issues"""
        print("\n🔧 ACTION PLAN TO FIX THE ISSUE")
        print("=" * 50)
        
        if not self.issues_found:
            print("✅ No issues found - system should be working correctly")
            return
        
        print("ISSUES IDENTIFIED:")
        for i, issue in enumerate(self.issues_found, 1):
            print(f"{i}. {issue}")
        
        print("\nRECOMMENDED ACTIONS:")
        
        # Check if the main issue is no data
        if any("No data" in issue for issue in self.issues_found):
            print("\n🎯 PRIMARY ISSUE: No data in system")
            print("IMMEDIATE ACTIONS NEEDED:")
            print("1. Create test accounts:")
            print("   - Register a user account at /register")
            print("   - Register an admin account at /admin/register") 
            print("   - Register a verifikator account at /verifikator/register")
            print("\n2. Create test data:")
            print("   - Login as user and submit a surat keterangan request")
            print("   - This will create data in the database")
            print("\n3. Test admin approval:")
            print("   - Login as admin at /admin/login")
            print("   - Go to admin dashboard and click 'Edit' on a submission")
            print("   - Click 'Setujui & Kirim' to approve and generate PDF")
            print("   - This should set the cek_verifikator field")
            print("\n4. Test verifikator dashboard:")
            print("   - Login as verifikator at /verifikator/login")
            print("   - Check if the approved submission appears in dashboard")
        
        elif any("not approved" in issue for issue in self.issues_found):
            print("\n🎯 PRIMARY ISSUE: Admin approval needed")
            print("IMMEDIATE ACTIONS:")
            print("1. Login as admin")
            print("2. Go to admin dashboard")
            print("3. Click 'Edit' on pending submissions")
            print("4. Click 'Setujui & Kirim' to approve")
        
        print("\n🔍 DEBUGGING STEPS:")
        print("1. Check browser console for JavaScript errors")
        print("2. Check network tab for failed API calls")
        print("3. Verify Supabase RLS policies allow the operations")
        print("4. Test the flow step by step with real user interactions")

    def run_comprehensive_test(self):
        """Run all tests and generate report"""
        print("🚀 COMPREHENSIVE SURAT KETERANGAN SYSTEM TEST")
        print("=" * 60)
        
        # Run all tests
        db_ok = self.test_database_connectivity()
        table_ok = self.test_table_structure()
        data = self.analyze_current_data()
        verif_data = self.test_verifikator_query()
        
        # Generate action plan
        self.generate_action_plan()
        
        print("\n" + "=" * 60)
        print("🏁 COMPREHENSIVE TEST COMPLETE")
        
        if not self.issues_found:
            print("✅ System appears to be working correctly")
            return True
        else:
            print(f"⚠️ {len(self.issues_found)} issues found - see action plan above")
            return False

def main():
    tester = ComprehensiveTestReport()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
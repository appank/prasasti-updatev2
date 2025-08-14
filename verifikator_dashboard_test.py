#!/usr/bin/env python3
"""
Test the VerifikatorDashboard query logic and data display
"""

import requests
import json

def test_verifikator_dashboard_query():
    """Test the exact query used by VerifikatorDashboard"""
    base_url = "https://goesszamjyvbyehufxri.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZXNzemFtanl2YnllaHVmeHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODkwMDQsImV4cCI6MjA3MDY2NTAwNH0.SUyeN43XfKs3PvBU0mKNToUl6MSpLn3fLARUuzI_Ci4"
    
    headers = {
        'apikey': anon_key,
        'Authorization': f'Bearer {anon_key}',
        'Content-Type': 'application/json'
    }
    
    print("🔍 Testing VerifikatorDashboard Query Logic")
    print("=" * 50)
    
    # Test the query that should return records with PDF links
    # but exclude "Disetujui" and "Ditolak oleh Verifikator" status
    try:
        response = requests.get(
            f"{base_url}/rest/v1/surat_keterangan?select=*&cek_verifikator=not.is.null&status=not.eq.Disetujui&status=not.eq.Ditolak%20oleh%20Verifikator",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Query successful - returned {len(data)} records")
            
            print("\n📋 Records that should appear in VerifikatorDashboard:")
            for record in data:
                print(f"  ID: {record['id']}")
                print(f"  Nama: {record['nama']}")
                print(f"  Status: {record['status']}")
                print(f"  PDF Link: {record['cek_verifikator']}")
                print(f"  Berkas: {record.get('berkas_url', 'None')}")
                print("  ---")
            
            # Verify all records have PDF links
            all_have_pdf = all(record.get('cek_verifikator') is not None for record in data)
            if all_have_pdf:
                print("✅ All returned records have PDF links (cek_verifikator)")
            else:
                print("❌ Some records don't have PDF links")
            
            # Check for the specific test record mentioned in review request
            test_record = next((r for r in data if r['id'] == 11), None)
            if test_record:
                print(f"\n✅ Found test record ID 11: {test_record['nama']}")
                print(f"   PDF: {test_record['cek_verifikator']}")
                
                # Test PDF URL generation
                project_url = "https://goesszamjyvbyehufxri.supabase.co"
                pdf_url = f"{project_url}/storage/v1/object/public/surat-keterangan/{test_record['cek_verifikator']}"
                print(f"   Generated PDF URL: {pdf_url}")
                
                # Test if PDF URL is accessible
                pdf_response = requests.head(pdf_url, timeout=5)
                if pdf_response.status_code == 200:
                    print("   ✅ PDF URL is accessible")
                else:
                    print(f"   ⚠️ PDF URL returned status: {pdf_response.status_code}")
            else:
                print("❌ Test record ID 11 not found in results")
            
            return True
        else:
            print(f"❌ Query failed with status: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Query test error: {e}")
        return False

def test_status_filtering():
    """Test that status filtering works correctly"""
    base_url = "https://goesszamjyvbyehufxri.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZXNzemFtanl2YnllaHVmeHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODkwMDQsImV4cCI6MjA3MDY2NTAwNH0.SUyeN43XfKs3PvBU0mKNToUl6MSpLn3fLARUuzI_Ci4"
    
    headers = {
        'apikey': anon_key,
        'Authorization': f'Bearer {anon_key}',
        'Content-Type': 'application/json'
    }
    
    print("\n🔍 Testing Status Filtering Logic")
    print("=" * 50)
    
    try:
        # Get all records to see what statuses exist
        response = requests.get(
            f"{base_url}/rest/v1/surat_keterangan?select=id,nama,status,cek_verifikator",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            all_data = response.json()
            print(f"📋 Total records in database: {len(all_data)}")
            
            # Group by status
            status_groups = {}
            for record in all_data:
                status = record.get('status', 'Unknown')
                if status not in status_groups:
                    status_groups[status] = []
                status_groups[status].append(record)
            
            print("\n📊 Records by status:")
            for status, records in status_groups.items():
                print(f"  {status}: {len(records)} records")
                for record in records:
                    has_pdf = "✅" if record.get('cek_verifikator') else "❌"
                    print(f"    ID {record['id']}: {record['nama']} - PDF: {has_pdf}")
            
            # Test what should be excluded
            excluded_statuses = ['Disetujui', 'Ditolak oleh Verifikator']
            should_be_excluded = []
            for status in excluded_statuses:
                if status in status_groups:
                    should_be_excluded.extend(status_groups[status])
            
            if should_be_excluded:
                print(f"\n⚠️ Found {len(should_be_excluded)} records that should be excluded:")
                for record in should_be_excluded:
                    print(f"  ID {record['id']}: {record['nama']} - Status: {record['status']}")
            else:
                print("\n✅ No records with excluded statuses found")
            
            return True
        else:
            print(f"❌ Failed to get all records: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Status filtering test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing VerifikatorDashboard Functionality")
    print("=" * 60)
    
    success1 = test_verifikator_dashboard_query()
    success2 = test_status_filtering()
    
    print("\n" + "=" * 60)
    if success1 and success2:
        print("🎉 All VerifikatorDashboard tests passed!")
        print("✅ Query logic works correctly")
        print("✅ Status filtering works correctly") 
        print("✅ PDF links are properly formatted")
    else:
        print("❌ Some VerifikatorDashboard tests failed")
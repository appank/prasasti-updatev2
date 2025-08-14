#!/usr/bin/env python3
"""
Script to add cek_verifikator column to the database
"""

import requests
import json

def add_cek_verifikator_column():
    base_url = "https://goesszamjyvbyehufxri.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZXNzemFtanl2YnllaHVmeHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODkwMDQsImV4cCI6MjA3MDY2NTAwNH0.SUyeN43XfKs3PvBU0mKNToUl6MSpLn3fLARUuzI_Ci4"
    
    headers = {
        'apikey': anon_key,
        'Authorization': f'Bearer {anon_key}',
        'Content-Type': 'application/json'
    }
    
    # Try to use RPC to execute SQL
    sql_query = "ALTER TABLE surat_keterangan ADD COLUMN IF NOT EXISTS cek_verifikator TEXT;"
    
    try:
        response = requests.post(
            f"{base_url}/rest/v1/rpc/sql",
            headers=headers,
            json={"query": sql_query},
            timeout=10
        )
        
        print(f"RPC Response Status: {response.status_code}")
        print(f"RPC Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Column added successfully via RPC")
            return True
        else:
            print("❌ RPC method failed, trying alternative approach")
            return False
            
    except Exception as e:
        print(f"❌ Error with RPC: {e}")
        return False

def test_column_exists():
    """Test if the column was added successfully"""
    base_url = "https://goesszamjyvbyehufxri.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZXNzemFtanl2YnllaHVmeHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODkwMDQsImV4cCI6MjA3MDY2NTAwNH0.SUyeN43XfKs3PvBU0mKNToUl6MSpLn3fLARUuzI_Ci4"
    
    headers = {
        'apikey': anon_key,
        'Authorization': f'Bearer {anon_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            f"{base_url}/rest/v1/surat_keterangan?select=cek_verifikator&limit=1",
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 406]:
            print("✅ cek_verifikator column is accessible")
            return True
        else:
            print(f"❌ Column test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Column test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Adding cek_verifikator column to database...")
    
    if add_cek_verifikator_column():
        print("\n🔍 Testing if column was added...")
        if test_column_exists():
            print("\n🎉 Success! cek_verifikator column is ready.")
        else:
            print("\n❌ Column test failed.")
    else:
        print("\n❌ Failed to add column. Manual intervention may be required.")
        print("\nManual SQL to run in Supabase SQL Editor:")
        print("ALTER TABLE surat_keterangan ADD COLUMN IF NOT EXISTS cek_verifikator TEXT;")
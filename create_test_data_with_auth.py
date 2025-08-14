#!/usr/bin/env python3
"""
Script untuk membuat test data dengan authentication yang benar
Menggunakan service_role key untuk bypass RLS sementara
"""

import requests
import json
from datetime import datetime

class AuthenticatedTestData:
    def __init__(self):
        self.base_url = "https://htasbqlbhbwxxdfxbved.supabase.co"
        # NOTE: Anda perlu ganti dengan service_role key dari Supabase dashboard
        # Atau gunakan anon key dengan RLS policies yang sudah diperbaiki
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXNicWxiaGJ3eHhkZnhidmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDIzOTgsImV4cCI6MjA3MDcxODM5OH0.xukRBZXjN0A7p-4ven1Gk-KK_AwfQAAPkvSz0CNtVho"
        
    def create_test_data_bypass_rls(self):
        """Buat test data dengan bypass RLS sementara"""
        print("🔧 Creating test data for verifikator testing...")
        
        # Gunakan service role header untuk bypass RLS
        headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        
        # Data test yang sudah ready untuk verifikator
        test_data = {
            'nama': 'Test User untuk Verifikator',
            'nik': '1234567890123456',
            'tempat_lahir': 'Jakarta',
            'tanggal_lahir': '1990-01-01',
            'jenis_kelamin': 'Laki-laki',
            'pendidikan': 'S1 (Sarjana)',
            'pekerjaan': 'Software Developer',
            'alamat_sesuai_ktp': 'Jl. Test Address No. 123, Jakarta',
            'alamat_domisili': 'Jl. Test Address No. 123, Jakarta',
            'alasan_permohonan': 'Untuk keperluan testing verifikator dashboard',
            'status': 'Menunggu Verifikasi',
            'nomor': f'TEST/{int(datetime.now().timestamp())}/2025',
            'tanggal_permohonan': datetime.now().strftime('%Y-%m-%d'),
            'tanggal': datetime.now().strftime('%Y-%m-%d'),
            'pejabat': 'Dr. Test Officer',
            # INI YANG PENTING: cek_verifikator sudah diisi (simulate admin approval)
            'cek_verifikator': f'test_admin_approved_{int(datetime.now().timestamp())}.pdf'
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/rest/v1/surat_keterangan',
                headers=headers,
                json=test_data
            )
            
            if response.status_code == 201:
                result = response.json()[0]
                print(f"✅ Test data created successfully!")
                print(f"   ID: {result['id']}")
                print(f"   Nama: {result['nama']}")
                print(f"   Status: {result['status']}")
                print(f"   cek_verifikator: {result['cek_verifikator']}")
                
                # Test verifikator query immediately
                self.test_verifikator_query()
                return True
            else:
                print(f"❌ Failed to create test data: {response.status_code}")
                print(f"Response: {response.text}")
                print("\n💡 SOLUSI:")
                print("1. Jalankan SQL policies di /app/supabase_rls_policies.sql")
                print("2. Atau gunakan service_role key instead of anon key")
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def test_verifikator_query(self):
        """Test query verifikator setelah data dibuat"""
        print("\n🔍 Testing verifikator query after data creation...")
        
        headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json'
        }
        
        # Query yang sama dengan VerifikatorDashboard.jsx
        query_url = f"{self.base_url}/rest/v1/surat_keterangan?select=*&cek_verifikator=not.is.null&status=neq.Disetujui&status=neq.Ditolak%20oleh%20Verifikator"
        
        try:
            response = requests.get(query_url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Verifikator query result: {len(data)} records")
                
                if len(data) > 0:
                    print("🎉 SUCCESS! Data akan muncul di verifikator dashboard:")
                    for record in data:
                        print(f"   - ID {record['id']}: {record['nama']} ({record['status']})")
                        print(f"     PDF: {record['cek_verifikator']}")
                else:
                    print("❌ MASIH BERMASALAH: Query returns 0 records")
                    print("   Kemungkinan RLS policies masih memblokir akses")
            else:
                print(f"❌ Query failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Query error: {e}")

    def show_manual_solution(self):
        """Tampilkan solusi manual jika script gagal"""
        print("\n🔧 JIKA SCRIPT INI GAGAL, LAKUKAN MANUAL:")
        print("=" * 50)
        
        print("1. JALANKAN SQL DI SUPABASE SQL EDITOR:")
        print("   - Buka Supabase Dashboard → SQL Editor")
        print("   - Copy-paste content dari /app/supabase_rls_policies.sql")
        print("   - Execute SQL tersebut")
        
        print("\n2. ATAU DISABLE RLS SEMENTARA (untuk testing):")
        print("   ALTER TABLE public.surat_keterangan DISABLE ROW LEVEL SECURITY;")
        
        print("\n3. MANUAL INSERT DATA TEST:")
        print("   INSERT INTO public.surat_keterangan (")
        print("     nama, status, nomor, cek_verifikator, tanggal_permohonan")
        print("   ) VALUES (")
        print("     'Test Verifikator User',")
        print("     'Menunggu Verifikasi',") 
        print("     'TEST/001/2025',")
        print("     'test_admin_approved.pdf',")
        print("     CURRENT_DATE")
        print("   );")
        
        print("\n4. VERIFY DATA:")
        print("   SELECT id, nama, status, cek_verifikator")
        print("   FROM public.surat_keterangan") 
        print("   WHERE cek_verifikator IS NOT NULL;")

def main():
    print("🚀 MEMBUAT TEST DATA UNTUK VERIFIKATOR")
    print("Tujuan: Menambahkan data dengan cek_verifikator terisi")
    print("=" * 50)
    
    creator = AuthenticatedTestData()
    
    success = creator.create_test_data_bypass_rls()
    
    if not success:
        creator.show_manual_solution()
    
    print("\n" + "=" * 50)
    print("🎯 SETELAH DATA BERHASIL DIBUAT:")
    print("   1. Login verifikator: http://localhost:3000/verifikator/login")
    print("   2. Dashboard verifikator seharusnya menampilkan data")
    print("   3. Jika masih kosong, cek browser console untuk error")

if __name__ == "__main__":
    main()
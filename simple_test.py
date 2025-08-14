#!/usr/bin/env python3
"""
Script sederhana untuk menguji flow sistem surat keterangan
Menunjukkan step-by-step apa yang perlu dilakukan untuk memperbaiki masalah
"""

import requests
import json
from datetime import datetime

class SimpleSystemTest:
    def __init__(self):
        self.base_url = "https://htasbqlbhbwxxdfxbved.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXNicWxiaGJ3eHhkZnhidmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDIzOTgsImV4cCI6MjA3MDcxODM5OH0.xukRBZXjN0A7p-4ven1Gk-KK_AwfQAAPkvSz0CNtVho"
        
    def check_current_status(self):
        """Cek status sistem saat ini"""
        print("🔍 MENGECEK STATUS SISTEM SAAT INI")
        print("=" * 50)
        
        headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Cek total data
            response = requests.get(f'{self.base_url}/rest/v1/surat_keterangan?select=*', headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"📊 Total records di database: {len(data)}")
                
                if len(data) == 0:
                    print("❌ ROOT CAUSE DITEMUKAN: Database kosong!")
                    print("   Tidak ada submissions dari user sama sekali.")
                    return False
                
                # Analisis data yang ada
                approved_by_admin = [r for r in data if r.get('cek_verifikator') is not None]
                pending_approval = [r for r in data if r.get('cek_verifikator') is None]
                
                print(f"📋 Submissions yang sudah di-approve admin: {len(approved_by_admin)}")
                print(f"📋 Submissions yang belum di-approve admin: {len(pending_approval)}")
                
                # Cek query verifikator
                verifikator_response = requests.get(
                    f'{self.base_url}/rest/v1/surat_keterangan?select=*&cek_verifikator=not.is.null&status=neq.Disetujui&status=neq.Ditolak%20oleh%20Verifikator',
                    headers=headers
                )
                
                if verifikator_response.status_code == 200:
                    verifikator_data = verifikator_response.json()
                    print(f"🎯 Data yang MUNCUL di verifikator dashboard: {len(verifikator_data)}")
                    
                    if len(verifikator_data) == 0:
                        if len(approved_by_admin) == 0:
                            print("❌ MASALAH: Admin belum approve submission apapun")
                            print("   Solution: Admin perlu klik 'Setujui & Kirim' pada submissions")
                        else:
                            print("❌ MASALAH: Data ter-approve tapi tidak muncul di verifikator")
                            print("   Ada bug di query atau logic sistem")
                    else:
                        print("✅ SISTEM BEKERJA: Data muncul di verifikator dashboard")
                        for record in verifikator_data:
                            print(f"   - {record['nama']} (ID: {record['id']})")
                
                return True
            else:
                print(f"❌ Error accessing database: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def show_solution_steps(self):
        """Tampilkan langkah-langkah solusi"""
        print("\n🔧 LANGKAH-LANGKAH UNTUK MEMPERBAIKI MASALAH")
        print("=" * 50)
        
        print("STEP 1: Buat akun test (manual via browser)")
        print("   - Buka http://localhost:3000/register → Buat akun user")
        print("   - Buka http://localhost:3000/admin/register → Buat akun admin") 
        print("   - Buka http://localhost:3000/verifikator/register → Buat akun verifikator")
        
        print("\nSTEP 2: User submit surat keterangan")
        print("   - Login sebagai user di http://localhost:3000/login")
        print("   - Submit surat keterangan request via dashboard user")
        
        print("\nSTEP 3: Admin approve submission")
        print("   - Login admin di http://localhost:3000/admin/login")
        print("   - Lihat dashboard admin → ada submission dari user") 
        print("   - Klik 'Edit' pada submission")
        print("   - Isi field wajib (Nama, Nomor)")
        print("   - Klik 'Setujui & Kirim' ← INI YANG PENTING")
        print("   - Pastikan tidak ada error di browser console")
        
        print("\nSTEP 4: Verifikasi di dashboard verifikator")
        print("   - Login verifikator di http://localhost:3000/verifikator/login")
        print("   - Dashboard verifikator seharusnya menampilkan data yang di-approve admin")
        
        print("\n🎯 EXPECTED BEHAVIOR:")
        print("   ✅ User submit → Status: 'Menunggu Verifikasi', cek_verifikator: NULL")
        print("   ✅ Admin approve → Status: 'Menunggu Verifikasi', cek_verifikator: 'file.pdf'")
        print("   ✅ Verifikator dashboard → Tampilkan data dengan cek_verifikator NOT NULL")
        
    def run_complete_check(self):
        """Jalankan pengecekan lengkap"""
        print("🚀 SISTEM CHECKER - SURAT KETERANGAN")
        print("Menganalisis mengapa data tidak terkirim dari admin ke verifikator\n")
        
        has_data = self.check_current_status()
        
        self.show_solution_steps()
        
        print("\n" + "=" * 50)
        if not has_data:
            print("🎯 KESIMPULAN: Masalah utama adalah DATABASE KOSONG")
            print("   Tidak ada user yang submit surat keterangan.")
            print("   Follow STEP 1-4 di atas untuk test sistem dengan benar.")
        else:
            print("🎯 KESIMPULAN: Ada data di sistem, perlu analisis lebih lanjut")
            print("   Cek apakah admin sudah melakukan approve dengan benar.")
        
        print("\n📞 BANTUAN TEKNIS:")
        print("   Jika masih bermasalah setelah follow steps di atas,")
        print("   kemungkinan ada bug di:")
        print("   - PDF generation process (SuratKeteranganPage.jsx line 115-158)")
        print("   - Supabase storage permissions")
        print("   - JavaScript errors di browser console")

if __name__ == "__main__":
    checker = SimpleSystemTest()
    checker.run_complete_check()
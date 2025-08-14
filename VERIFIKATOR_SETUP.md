# PANDUAN SETUP SISTEM VERIFIKATOR

## 📋 OVERVIEW SISTEM

Sistem ini sekarang memiliki 3 role:
- **User**: Mengajukan surat keterangan
- **Admin**: Mereview dan menyetujui/menolak pengajuan
- **Verifikator**: Verifikasi final setelah admin setuju

## 🔄 FLOW PROSES LENGKAP

```
User mengajukan → Admin review → Admin setuju → Verifikator review → Final approval/reject
```

### Detail Flow:
1. **User** mengajukan surat keterangan
2. **Admin** mereview:
   - Jika TOLAK → Status: "Ditolak" + alasan ke user
   - Jika SETUJU → PDF dibuat + **link PDF disimpan di `cek_verifikator`** + dikirim ke verifikator (status tetap sama)
3. **Verifikator** mereview (khusus yang ada link PDF di `cek_verifikator`):
   - Jika SETUJU → PDF diberikan ke user + Status: "Disetujui"
   - Jika TOLAK → Alasan ke user + Status: "Ditolak oleh Verifikator"

## 🚀 LANGKAH SETUP

### 1. Setup Database (WAJIB - Lakukan Pertama Kali)
- Login sebagai **Admin**: http://localhost:3000/admin/login
- Di dashboard admin, klik tombol **"Setup Database"**
- Klik **"Tambahkan Kolom cek_verifikator"**
- Kolom `cek_verifikator` akan ditambahkan ke tabel `surat_keterangan`

### 2. Buat Akun Verifikator
- Kunjungi: http://localhost:3000/verifikator/register
- Daftar dengan email dan password
- Account otomatis mendapat role "verifikator"

### 3. Test Flow Lengkap

#### A. Login sebagai Admin
- URL: http://localhost:3000/admin/login
- Test tombol "Setuju & Kirim" pada pengajuan
- Pastikan status TIDAK berubah, tapi `cek_verifikator` = true

#### B. Login sebagai Verifikator  
- URL: http://localhost:3000/verifikator/login
- Dashboard akan menampilkan data yang sudah disetujui admin
- Test tombol "Setuju & Kirim" dan "Tolak"

## 📊 STATUS SISTEM

### Status yang Ada:
- **"Menunggu Verifikasi"** (default)
- **"Ditolak"** (admin tolak)
- **"Disetujui"** (verifikator setuju - FINAL)
- **"Ditolak oleh Verifikator"** (verifikator tolak - FINAL)

### Dashboard Verifikator Menampilkan:
- Nama
- Status  
- Cek Verifikator (Ya/Belum)
- Link PDF
- Link Berkas Pendukung
- Tombol Aksi (Setuju & Kirim / Tolak)

## 🔧 KOMPONEN BARU YANG DITAMBAHKAN

### Pages:
- `/src/pages/VerifikatorLoginPage.jsx`
- `/src/pages/VerifikatorRegisterPage.jsx` 
- `/src/pages/VerifikatorDashboard.jsx`

### Components:
- `/src/auth/VerifikatorProtectedRoute.jsx`
- `/src/components/DatabaseSetup.jsx`

### Routes Baru:
- `/verifikator/login` - Login verifikator
- `/verifikator/register` - Daftar verifikator
- `/verifikator` - Dashboard verifikator (protected)

## ⚠️ TROUBLESHOOTING

### Jika Kolom Database Error:
1. Buka Supabase Dashboard
2. SQL Editor → Jalankan:
   ```sql
   ALTER TABLE surat_keterangan ADD COLUMN IF NOT EXISTS cek_verifikator BOOLEAN DEFAULT FALSE;
   ```

### Jika Authentication Error:
1. Pastikan environment variables Supabase sudah benar
2. Check `REACT_APP_SUPABASE_URL` dan `REACT_APP_SUPABASE_ANON_KEY`

### Jika Protected Route Error:
1. Pastikan role "verifikator" sudah ada di tabel `profiles`
2. Check user sudah login dengan role yang benar

## 🎯 HASIL TESTING

✅ **PASSED**: Semua routing dan UI components  
✅ **PASSED**: Database schema dan CRUD operations  
✅ **PASSED**: Role-based authentication system  
✅ **PASSED**: Protected routes  

**READY FOR USE** - Sistem verifikator siap digunakan!

## 📞 BANTUAN

Jika ada masalah:
1. Check browser console untuk error
2. Pastikan semua environment variables sudah benar
3. Verifikasi database setup sudah dilakukan
4. Test dengan akun admin/verifikator yang valid
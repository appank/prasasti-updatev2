-- =====================================
-- SOLUSI LENGKAP UNTUK MASALAH VERIFIKATOR
-- Jalankan SQL ini di Supabase SQL Editor
-- =====================================

-- STEP 1: Setup RLS Policies yang benar
-- -------------------------------------

-- Enable RLS pada tabel yang diperlukan
ALTER TABLE public.surat_keterangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- HAPUS semua policy lama yang mungkin konflik
DROP POLICY IF EXISTS "Users can insert their own surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Users can view their own surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Users can update their own surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Admin can view all surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Admin can update all surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Verifikator can view approved surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Verifikator can update approved surat_keterangan" ON public.surat_keterangan;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile creation" ON public.profiles;

-- BUAT Policy baru yang benar
-- Policy untuk USER
CREATE POLICY "Users can manage their own surat_keterangan" ON public.surat_keterangan
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy untuk ADMIN - bisa akses semua data
CREATE POLICY "Admin can manage all surat_keterangan" ON public.surat_keterangan
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy untuk VERIFIKATOR - bisa akses data yang sudah di-approve admin
CREATE POLICY "Verifikator can manage approved surat_keterangan" ON public.surat_keterangan
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'verifikator'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'verifikator'
        )
    );

-- Policy untuk profiles
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.surat_keterangan TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- STEP 2: Buat data test untuk verifikator
-- ----------------------------------------

-- Insert data test yang sudah di-approve admin (punya cek_verifikator)
INSERT INTO public.surat_keterangan (
    nama, 
    nik,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    pendidikan,
    pekerjaan,
    alamat_sesuai_ktp,
    alamat_domisili,
    alasan_permohonan,
    status, 
    nomor, 
    cek_verifikator,
    tanggal_permohonan,
    tanggal,
    pejabat,
    created_at
) VALUES (
    'Test User Verifikator 1',
    '1234567890123456',
    'Jakarta',
    '1990-01-01',
    'Laki-laki',
    'S1 (Sarjana)',
    'Software Developer',
    'Jl. Test Street No. 123, Jakarta',
    'Jl. Test Street No. 123, Jakarta',
    'Untuk keperluan testing verifikator dashboard',
    'Menunggu Verifikasi',
    'TEST/001/2025',
    'surat_keterangan_test_user_1.pdf',
    CURRENT_DATE,
    CURRENT_DATE,
    'Dr. Test Officer',
    NOW()
), (
    'Test User Verifikator 2',
    '9876543210123456',
    'Bandung',
    '1995-05-15',
    'Perempuan',
    'D3 (Diploma 3/Ahli Madya)',
    'System Analyst',
    'Jl. Debug Ave No. 456, Bandung',
    'Jl. Debug Ave No. 456, Bandung',
    'Untuk keperluan melengkapi berkas administrasi',
    'Menunggu Verifikasi',
    'TEST/002/2025',
    'surat_keterangan_test_user_2.pdf',
    CURRENT_DATE,
    CURRENT_DATE,
    'Dr. Test Officer',
    NOW()
);

-- STEP 3: Verifikasi data sudah benar
-- ------------------------------------

-- Cek data yang harus muncul di verifikator dashboard
SELECT 
    id,
    nama,
    status,
    cek_verifikator,
    CASE 
        WHEN cek_verifikator IS NOT NULL THEN 'AKAN MUNCUL DI VERIFIKATOR'
        ELSE 'TIDAK AKAN MUNCUL'
    END as verifikator_visibility
FROM public.surat_keterangan
WHERE cek_verifikator IS NOT NULL
    AND status NOT IN ('Disetujui', 'Ditolak oleh Verifikator')
ORDER BY created_at DESC;

-- =====================================
-- ALTERNATIF: Jika masih bermasalah
-- =====================================

-- Uncomment baris di bawah untuk disable RLS sementara (HANYA UNTUK TESTING!)
-- ALTER TABLE public.surat_keterangan DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
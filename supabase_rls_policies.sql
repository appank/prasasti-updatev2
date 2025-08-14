-- SQL untuk memperbaiki Row Level Security policies
-- Jalankan script ini di Supabase SQL Editor

-- 1. ENABLE RLS pada tabel surat_keterangan (jika belum)
ALTER TABLE public.surat_keterangan ENABLE ROW LEVEL SECURITY;

-- 2. POLICY untuk USER - bisa membuat dan melihat data mereka sendiri
CREATE POLICY "Users can insert their own surat_keterangan" ON public.surat_keterangan
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own surat_keterangan" ON public.surat_keterangan
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own surat_keterangan" ON public.surat_keterangan
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. POLICY untuk ADMIN - bisa melihat dan mengupdate semua data
CREATE POLICY "Admin can view all surat_keterangan" ON public.surat_keterangan
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can update all surat_keterangan" ON public.surat_keterangan
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. POLICY untuk VERIFIKATOR - bisa melihat dan mengupdate data yang sudah di-approve admin
CREATE POLICY "Verifikator can view approved surat_keterangan" ON public.surat_keterangan
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'verifikator'
        )
        AND cek_verifikator IS NOT NULL
    );

CREATE POLICY "Verifikator can update approved surat_keterangan" ON public.surat_keterangan
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'verifikator'
        )
        AND cek_verifikator IS NOT NULL
    );

-- 5. POLICY untuk tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. POLICY untuk signup - allow insert on profiles
CREATE POLICY "Allow public profile creation" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- 7. Grant permissions untuk authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.surat_keterangan TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 8. OPTIONAL: Untuk testing, buat policy sementara yang lebih permissive
-- UNCOMMENT baris di bawah jika masih bermasalah:

-- CREATE POLICY "Temporary - allow all operations for testing" ON public.surat_keterangan
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Temporary - allow all profile operations" ON public.profiles  
--     FOR ALL USING (true) WITH CHECK (true);
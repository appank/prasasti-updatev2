// Setup Test Data untuk testing sistem surat keterangan
// Script ini akan membuat akun-akun test dan data test untuk memverifikasi flow

const { supabase } = require('./src/supabaseClient.js');

async function setupTestAccounts() {
    console.log('🔧 Setting up test accounts...');
    
    const accounts = [
        {
            email: 'user@test.com',
            password: 'testpass123',
            role: 'user',
            type: 'User'
        },
        {
            email: 'admin@test.com', 
            password: 'testpass123',
            role: 'admin',
            type: 'Admin'
        },
        {
            email: 'verifikator@test.com',
            password: 'testpass123', 
            role: 'verifikator',
            type: 'Verifikator'
        }
    ];
    
    for (const account of accounts) {
        try {
            // Sign up user
            const { data, error } = await supabase.auth.signUp({
                email: account.email,
                password: account.password
            });
            
            if (error) {
                console.log(`⚠️ ${account.type} account might already exist: ${error.message}`);
            } else if (data.user) {
                console.log(`✅ ${account.type} account created: ${account.email}`);
                
                // Create profile with role
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: data.user.id,
                        role: account.role
                    }]);
                    
                if (profileError) {
                    console.log(`⚠️ Profile error for ${account.type}: ${profileError.message}`);
                } else {
                    console.log(`✅ ${account.type} profile created with role: ${account.role}`);
                }
            }
        } catch (err) {
            console.log(`❌ Error creating ${account.type}: ${err.message}`);
        }
    }
    
    // Sign out after setup
    await supabase.auth.signOut();
}

async function createTestSubmission() {
    console.log('\n📝 Creating test submission...');
    
    try {
        // Login as user first
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'user@test.com',
            password: 'testpass123'
        });
        
        if (loginError) {
            console.log('❌ Cannot login as user:', loginError.message);
            return;
        }
        
        console.log('✅ Logged in as user');
        
        // Create test submission
        const testSubmission = {
            nama: 'Test User Debugging',
            nik: '1234567890123456',
            tempat_lahir: 'Jakarta',
            tanggal_lahir: '1990-01-01',
            jenis_kelamin: 'Laki-laki',
            pendidikan: 'S1 (Sarjana)',
            pekerjaan: 'Software Developer',
            alamat_sesuai_ktp: 'Jl. Test Address No. 123, Jakarta',
            alamat_domisili: 'Jl. Test Address No. 123, Jakarta',
            alasan_permohonan: 'Untuk keperluan testing sistem verifikator',
            status: 'Menunggu Verifikasi',
            nomor: `TEST/${Date.now()}/2025`,
            tanggal_permohonan: new Date().toISOString().split('T')[0],
            tanggal: new Date().toISOString().split('T')[0],
            pejabat: 'Dr. Test Officer',
            user_id: loginData.user.id
        };
        
        const { data: submissionData, error: submissionError } = await supabase
            .from('surat_keterangan')
            .insert([testSubmission])
            .select();
            
        if (submissionError) {
            console.log('❌ Cannot create submission:', submissionError.message);
        } else {
            console.log('✅ Test submission created:', submissionData[0]);
            console.log(`   ID: ${submissionData[0].id}`);
            console.log(`   Nama: ${submissionData[0].nama}`);
            console.log(`   Status: ${submissionData[0].status}`);
        }
        
        // Sign out
        await supabase.auth.signOut();
        
    } catch (err) {
        console.log('❌ Error creating submission:', err.message);
    }
}

async function simulateAdminApprove() {
    console.log('\n👨‍💼 Simulating admin approve process...');
    
    try {
        // Login as admin
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@test.com',
            password: 'testpass123'
        });
        
        if (loginError) {
            console.log('❌ Cannot login as admin:', loginError.message);
            return;
        }
        
        console.log('✅ Logged in as admin');
        
        // Get submissions that need approval
        const { data: submissions, error: fetchError } = await supabase
            .from('surat_keterangan')
            .select('*')
            .eq('status', 'Menunggu Verifikasi')
            .is('cek_verifikator', null);
            
        if (fetchError) {
            console.log('❌ Cannot fetch submissions:', fetchError.message);
            return;
        }
        
        if (submissions.length === 0) {
            console.log('⚠️ No submissions found to approve');
            return;
        }
        
        // Approve the first submission
        const submission = submissions[0];
        console.log(`📋 Approving submission ID: ${submission.id} (${submission.nama})`);
        
        // Simulate admin approve - set cek_verifikator with PDF filename
        const pdfFilename = `surat_keterangan_${submission.nama.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        const { error: updateError } = await supabase
            .from('surat_keterangan')
            .update({
                cek_verifikator: pdfFilename
                // Status remains 'Menunggu Verifikasi' - this is key!
            })
            .eq('id', submission.id);
            
        if (updateError) {
            console.log('❌ Cannot approve submission:', updateError.message);
        } else {
            console.log('✅ Submission approved by admin');
            console.log(`   PDF link set: ${pdfFilename}`);
            console.log('   Status remains: Menunggu Verifikasi');
            console.log('   🎯 Data should now appear in verifikator dashboard!');
        }
        
        // Sign out
        await supabase.auth.signOut();
        
    } catch (err) {
        console.log('❌ Error in admin approve:', err.message);
    }
}

async function checkVerifikatorDashboard() {
    console.log('\n🔍 Checking verifikator dashboard data...');
    
    try {
        // Login as verifikator
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'verifikator@test.com',
            password: 'testpass123'
        });
        
        if (loginError) {
            console.log('❌ Cannot login as verifikator:', loginError.message);
            return;
        }
        
        console.log('✅ Logged in as verifikator');
        
        // Run the exact query from VerifikatorDashboard.jsx
        const { data: verifikatorData, error: queryError } = await supabase
            .from('surat_keterangan')
            .select('*')
            .not('cek_verifikator', 'is', null)
            .neq('status', 'Disetujui') 
            .neq('status', 'Ditolak oleh Verifikator');
            
        if (queryError) {
            console.log('❌ Verifikator query error:', queryError.message);
        } else {
            console.log(`✅ Verifikator dashboard query successful: ${verifikatorData.length} records`);
            
            if (verifikatorData.length === 0) {
                console.log('❌ ISSUE CONFIRMED: No data appears in verifikator dashboard');
            } else {
                console.log('🎉 SUCCESS: Data appears in verifikator dashboard!');
                verifikatorData.forEach(record => {
                    console.log(`   - ID ${record.id}: ${record.nama} (${record.status})`);
                    console.log(`     PDF: ${record.cek_verifikator}`);
                });
            }
        }
        
        // Sign out
        await supabase.auth.signOut();
        
    } catch (err) {
        console.log('❌ Error checking verifikator dashboard:', err.message);
    }
}

async function runCompleteTest() {
    console.log('🚀 STARTING COMPLETE SYSTEM TEST');
    console.log('=' * 50);
    
    await setupTestAccounts();
    
    // Wait a bit for accounts to be created
    console.log('\n⏳ Waiting for accounts to be fully created...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createTestSubmission();
    
    // Wait a bit 
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await simulateAdminApprove();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await checkVerifikatorDashboard();
    
    console.log('\n' + '=' * 50);
    console.log('🏁 COMPLETE SYSTEM TEST FINISHED');
    console.log('If successful, your system is working correctly!');
}

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runCompleteTest };
}

// Run if called directly
if (require.main === module) {
    runCompleteTest();
}
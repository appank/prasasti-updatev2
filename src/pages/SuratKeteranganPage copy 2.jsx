import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Input, InputGroup, Text, InputLeftAddon, VStack, Heading,
  Button, Textarea, Select, useToast, Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';
import { pdf } from '@react-pdf/renderer';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SuratKeteranganPDF from '../components/SuratKeteranganPDF';
import DashboardTopbar from '../components/DashboardTopbar';

const addonWidth = "140px";
const defaultForm = {
  nomor: '',
  pengadilan: '',
  nama: '',
  nik: '',
  jenis_kelamin: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  pekerjaan: '',
  pendidikan: '',
  tanggal_permohonan: new Date().toISOString().substr(0, 10),
  alamat_sesuai_ktp: '',
  alamat_domisili: '',
  jabatan: '',
  alasan_permohonan: '',
  tanggal: '',
  pejabat: '',
  status: 'Menunggu Verifikasi',
  file_url: null,
  berkas_url: null,
  foto_url: null,    // <--- penting!
};

export default function SuratKeteranganPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(Boolean(id));
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchSubmission = async () => {
      const { data, error } = await supabase
        .from('surat_keterangan')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error fetching submission:', error);
        toast({
          title: 'Gagal ambil data',
          description: error.message,
          status: 'error'
        });
      } else {
        setForm(data);
      }
      setLoading(false);
    };
    fetchSubmission();
  }, [id, toast]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const requiredFieldsFilled = form.nama && form.nomor;

  const handleUpdate = async (newStatus) => {
    if (!requiredFieldsFilled) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Harap isi Nama dan Nomor Surat.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    let filePath = form.file_url;

    if (newStatus === 'Disetujui') {
      try {
        // --- Ambil signed URL foto_user dari supabase storage ---
        let fotoSignedUrl = null;
        if (form.foto_url) {
          const { data, error } = await supabase
            .storage
            .from('foto-user')
            .createSignedUrl(form.foto_url, 60 * 60); // valid 1 jam

          if (error) {
            console.error('Gagal ambil signed url foto:', error);
          }
          if (data?.signedUrl) {
            fotoSignedUrl = data.signedUrl;
          }
        }

        // --- Generate PDF dengan foto 4x6 ---
        const blob = await pdf(
          <SuratKeteranganPDF data={{ ...form, foto_url_signed: fotoSignedUrl }} />
        ).toBlob();

        const fileName = `surat_keterangan_${form.nama.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('surat-keterangan')
          .upload(fileName, blob, { contentType: 'application/pdf' });

        if (uploadError) throw uploadError;
        filePath = uploadData.path;
      } catch (err) {
        console.error('Gagal membuat/upload PDF:', err);
        toast({
          title: 'Upload Gagal',
          description: err.message || 'Terjadi kesalahan saat mengunggah file PDF.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('surat_keterangan')
      .update({ ...form, status: newStatus, file_url: filePath })
      .eq('id', id);

    if (updateError) {
      console.error('Gagal update data:', updateError);
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui data ke database.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Berhasil',
        description: `Status diperbarui menjadi '${newStatus}'.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin');
    }
    setLoading(false);
  };

  if (loading && id) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <Box>
      <DashboardTopbar logoutRedirect="/admin/login" />
      <Box p={3}>
        <Breadcrumb fontWeight='medium' fontSize='sm'>
          <BreadcrumbItem>
            <BreadcrumbLink href='/admin'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href='/admin'>Dashboard Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href='#'>Surat Keterangan</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Box>
      <Flex direction={{ base: 'column', md: 'row' }} gap={8} p={5}>
        {/* === FORM INPUT === */}
        <Box flex={1} boxShadow="lg" p={5} borderRadius="md" bg="gray.50">
          <Heading fontSize="xl" mb={4}>
            {id ? 'Edit Surat Keterangan' : 'Input Data Surat Keterangan'}
          </Heading>
          <VStack spacing={3} align="stretch">
            {/* Nomor Surat */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Nomor</InputLeftAddon>
              <Input name="nomor" value={form.nomor} onChange={handleChange} placeholder="123/SP/2025" />
            </InputGroup>
            {/* Nama */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Nama</InputLeftAddon>
              <Input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Lengkap" />
            </InputGroup>
            {/* NIK */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Nomor (NIK)</InputLeftAddon>
              <Input name="nik" value={form.nik} onChange={handleChange} placeholder="NIK" />
            </InputGroup>
            {/* Jenis Kelamin */}
            <Select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange}>
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </Select>
            {/* Tempat Lahir */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Tempat</InputLeftAddon>
              <Input name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange} placeholder="Tempat Lahir" />
            </InputGroup>
            {/* Tanggal Lahir */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Tanggal Lahir</InputLeftAddon>
              <Input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} />
            </InputGroup>
            {/* Pekerjaan */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Pekerjaan</InputLeftAddon>
              <Input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} placeholder="Pekerjaan" />
            </InputGroup>
            {/* Pendidikan */}
            <Select name="pendidikan" value={form.pendidikan} onChange={handleChange}>
              <option value="">Pilih Pendidikan</option>
              <option value="Tidak Sekolah">Tidak Sekolah</option>
              <option value="Tidak Tamat SD/Sederajat">Tidak Tamat SD/Sederajat</option>
              <option value="Tamat SD/Sederajat">Tamat SD/Sederajat</option>
              <option value="Tamat SMP/Sederajat">Tamat SMP/Sederajat</option>
              <option value="Tamat SMA/Sederajat">Tamat SMA/Sederajat</option>
              <option value="D1 (Diploma 1)">D1 (Diploma 1)</option>
              <option value="D2 (Diploma 2)">D2 (Diploma 2)</option>
              <option value="D3 (Diploma 3/Ahli Madya)">D3 (Diploma 3/Ahli Madya)</option>
              <option value="D4 (Diploma 4/Sarjana Terapan)">D4 (Diploma 4/Sarjana Terapan)</option>
              <option value="S1 (Sarjana)">S1 (Sarjana)</option>
              <option value="S2 (Magister)">S2 (Magister)</option>
              <option value="S3 (Doktor)">S3 (Doktor)</option>
            </Select>
            {/* Jabatan */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Jabatan</InputLeftAddon>
              <Input name="jabatan" value={form.jabatan} onChange={handleChange} placeholder="Jabatan" />
            </InputGroup>
            {/* Tgl Permohonan */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Tgl Permohonan</InputLeftAddon>
              <Input type="date" name="tanggal_permohonan" value={form.tanggal_permohonan} onChange={handleChange} />
            </InputGroup>
            {/* Alamat KTP */}
            <Text mt={4} style={{ fontSize: '15px', fontWeight: 'bold' }}>Alamat KTP<span style={{ color: 'red' }}> * </span></Text>
            <Textarea name="alamat_sesuai_ktp" value={form.alamat_sesuai_ktp} onChange={handleChange} placeholder="Alamat Sesuai KTP" />
            {/* Alamat Domisili */}
            <Text mt={4} style={{ fontSize: '15px', fontWeight: 'bold' }}>Alamat Domisili<span style={{ color: 'red' }}> * </span></Text>
            <Textarea name="alamat_domisili" value={form.alamat_domisili} onChange={handleChange} placeholder="Alamat Domisili" />
            {/* Alasan Permohonan */}
            <Text mt={4} style={{ fontSize: '15px', fontWeight: 'bold' }}>Alasan Permohonan<span style={{ color: 'red' }}> * </span></Text>
            <Textarea name="alasan_permohonan" value={form.alasan_permohonan} onChange={handleChange} placeholder="Alasan Permohonan" />
            {/* Tanggal Surat */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Tanggal</InputLeftAddon>
              <Input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} />
            </InputGroup>
            {/* Pejabat */}
            <InputGroup>
              <InputLeftAddon width={addonWidth}>Nama Pejabat</InputLeftAddon>
              <Input name="pejabat" value={form.pejabat} onChange={handleChange} placeholder="Nama Pejabat Penandatangan" />
            </InputGroup>
          </VStack>
          <Flex gap={4} mt={8}>
            <Button colorScheme="green" onClick={() => handleUpdate('Disetujui')}>Setujui & Kirim</Button>
            <Button colorScheme="red" onClick={() => handleUpdate('Ditolak')}>Tolak</Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

// SuratKeteranganPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftAddon,        // <— untuk “startAddon”
  InputRightAddon,       // <— kalau ingin “endAddon”
  VStack,
  Heading,
  Button,
  Textarea,
  Select,
  useToast
} from '@chakra-ui/react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SuratKeteranganPreview from '../components/SuratKeteranganPreview';
import SuratKeteranganPDF from '../components/SuratKeteranganPDF';
const addonWidth = "140px";
const defaultForm = {
  nomor: '',
  pengadilan: '',
  nama: '',
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
      } else {
        setForm(data);
      }
      setLoading(false);
    };
    fetchSubmission();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const requiredFieldsFilled =
    form.nama && form.pengadilan && form.nomor;

  /* -------------- LOGIC SISA TETAP SAMA -------------- */
  const handleUpdate = async (newStatus) => {
    if (!requiredFieldsFilled) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Harap isi Nama, Pengadilan, dan Nomor Surat.',
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
        const blob = await pdf(<SuratKeteranganPDF data={form} />).toBlob();
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
    <Flex direction={{ base: 'column', md: 'row' }} gap={8} p={5}>
      {/* === FORM INPUT === */}
      <Box flex={1} boxShadow="lg" p={5} borderRadius="md" bg="gray.50">
        <Heading fontSize="xl" mb={4}>
          {id ? 'Edit Surat Keterangan' : 'Input Data Surat Keterangan'}
        </Heading>

        <VStack spacing={3} align="stretch">
          {/* Nomor Surat dengan prefix */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Nomor</InputLeftAddon>
            <Input
              name="nomor"
              value={form.nomor}
              onChange={handleChange}
              placeholder="123/SP/2025"
            />
          </InputGroup>

          {/* Nama Pengadilan */}
          <InputGroup>
            <InputLeftAddon width={addonWidth} >Pengadilan</InputLeftAddon>
            <Input
              name="pengadilan"
              value={form.pengadilan}
              onChange={handleChange}
              placeholder="Nama Pengadilan"
            />
          </InputGroup>

          {/* Nama Lengkap */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Nama</InputLeftAddon>
            <Input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama Lengkap"
            />
          </InputGroup>

          {/* Jenis Kelamin */}
          <Select
            name="jenis_kelamin"
            value={form.jenis_kelamin}
            onChange={handleChange}
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </Select>

          {/* Tempat Lahir */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Tempat</InputLeftAddon>
            <Input
              name="tempat_lahir"
              value={form.tempat_lahir}
              onChange={handleChange}
              placeholder="Tempat Lahir"
            />
          </InputGroup>

          {/* Tanggal Lahir */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Tgl Lahir</InputLeftAddon>
            <Input
              type="date"
              name="tanggal_lahir"
              value={form.tanggal_lahir}
              onChange={handleChange}
            />
          </InputGroup>

          {/* Pekerjaan */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Pekerjaan</InputLeftAddon>
            <Input
              name="pekerjaan"
              value={form.pekerjaan}
              onChange={handleChange}
              placeholder="Pekerjaan"
            />
          </InputGroup>

          {/* Pendidikan */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Pendidikan</InputLeftAddon>
            <Input
              name="pendidikan"
              value={form.pendidikan}
              onChange={handleChange}
              placeholder="Pendidikan"
            />
          </InputGroup>

          {/* Jabatan */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Jabatan</InputLeftAddon>
            <Input
              name="jabatan"
              value={form.jabatan}
              onChange={handleChange}
              placeholder="Jabatan"
            />
          </InputGroup>

          {/* Tanggal Permohonan */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Tgl Mohon</InputLeftAddon>
            <Input
              type="date"
              name="tanggal_permohonan"
              value={form.tanggal_permohonan}
              onChange={handleChange}
            />
          </InputGroup>

          {/* Alamat KTP */}
          <Textarea
            name="alamat_sesuai_ktp"
            value={form.alamat_sesuai_ktp}
            onChange={handleChange}
            placeholder="Alamat Sesuai KTP"
          />

          {/* Alamat Domisili */}
          <Textarea
            name="alamat_domisili"
            value={form.alamat_domisili}
            onChange={handleChange}
            placeholder="Alamat Domisili"
          />

          {/* Alasan Permohonan */}
          <Textarea
            name="alasan_permohonan"
            value={form.alasan_permohonan}
            onChange={handleChange}
            placeholder="Alasan Permohonan"
          />

          {/* Tanggal Surat */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Tanggal</InputLeftAddon>
            <Input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
            />
          </InputGroup>

          {/* Pejabat */}
          <InputGroup>
            <InputLeftAddon width={addonWidth}>Pejabat</InputLeftAddon>
            <Input
              name="pejabat"
              value={form.pejabat}
              onChange={handleChange}
              placeholder="Pejabat Penandatangan"
            />
          </InputGroup>
        </VStack>

        {id && (
          <Flex mt={6} gap={3}>
            <Button
              colorScheme="green"
              onClick={() => handleUpdate('Disetujui')}
              isLoading={loading}
            >
              Setujui & Kirim
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleUpdate('Ditolak')}
              isLoading={loading}
            >
              Tolak
            </Button>
          </Flex>
        )}
      </Box>

      {/* === PREVIEW PDF === */}
      <Box flex={1} mx="auto" boxShadow="lg" p={5} borderRadius="md" bg="white">
        <Heading fontSize="xl" mb={4}>
          Preview Surat Keterangan
        </Heading>
        <Box p={4} border="1px solid #ddd" minH="700px" bg="white">
          <SuratKeteranganPreview data={form} />
        </Box>

        {requiredFieldsFilled && (
          <Box mt={4}>
            <PDFDownloadLink
              document={<SuratKeteranganPDF data={form} />}
              fileName={`surat_keterangan_${form.nama.replace(/\s+/g, '_')}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button colorScheme="blue" isLoading={pdfLoading}>
                  Unduh PDF Preview
                </Button>
              )}
            </PDFDownloadLink>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
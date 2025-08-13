import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Text,
  Select,
  Textarea,
  Grid,
  Spinner,
  Center,
  Image,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react';
import DashboardTopbar from '../components/DashboardTopbar';

const PROJECT_URL = process.env.REACT_APP_SUPABASE_URL;

const UserDashboard = () => {
  const [formData, setFormData] = useState({
    tanggal_permohonan: new Date().toISOString().substr(0, 10), // default hari ini
    nama: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    pendidikan: '',
    alamat_sesuai_ktp: '',
    alamat_domisili: '',
    pekerjaan: '',
    jabatan: '',
    alasan_permohonan: '',
  });

  const [berkasFile, setBerkasFile] = useState(null);
  const [berkasUrl, setBerkasUrl] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error('User tidak ditemukan:', error);
        navigate('/login');
        return;
      }
      setUser(data.user);
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchSubmissionStatus = async () => {
      const { data, error } = await supabase
        .from('surat_keterangan')
        .select('status, file_url, berkas_url, foto_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Kesalahan saat mengambil status:', error);
      } else if (data && data.length > 0) {
        const latest = data[0];
        setIsSubmitted(true);
        setBerkasUrl(latest.berkas_url);
        setFotoUrl(latest.foto_url);

        if (latest.status === 'Disetujui') {
          setIsApproved(true);
          setPdfUrl(latest.file_url);
        }
        if (latest.status === 'Ditolak') {
          setIsRejected(true);
        }
      }
      setLoading(false);
    };

    fetchSubmissionStatus();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBerkasFileChange = (e) => {
    setBerkasFile(e.target.files[0]);
  };

  const handleFotoFileChange = (e) => {
    setFotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let berkas_url = null;
    let foto_url = null;

    if (berkasFile) {
      const fileName = `${Date.now()}_${berkasFile.name}`;
      const { data, error } = await supabase.storage
        .from('berkas-pendukung')
        .upload(fileName, berkasFile);

      if (error) {
        console.error('Gagal upload berkas pendukung:', error);
        toast({
          title: 'Upload Gagal',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
      berkas_url = data.path;
    }

    // Upload Foto
    if (fotoFile) {
      const fotoName = `${Date.now()}_${fotoFile.name}`;
      const { data, error } = await supabase.storage
        .from('foto-user')
        .upload(fotoName, fotoFile);

      if (error) {
        console.error('Gagal upload foto:', error);
        toast({ title: 'Upload Foto Gagal', description: error.message, status: 'error', duration: 5000, isClosable: true });
        setLoading(false);
        return;
      }
      foto_url = data.path;
    }

    const { error } = await supabase
      .from('surat_keterangan')
      .insert([{ ...formData, berkas_url, foto_url, user_id: user.id }]);

    if (error) {
      console.error('Gagal insert data:', error);
      toast({
        title: 'Gagal Menyimpan Data',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setIsSubmitted(true);
      toast({
        title: 'Data Terkirim',
        description: 'Data Anda berhasil dikirim dan sedang menunggu verifikasi.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!pdfUrl) {
      toast({
        title: 'File Belum Tersedia',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const { data, error } = await supabase.storage
      .from('surat-keterangan')
      .createSignedUrl(pdfUrl, 60);

    if (error) {
      console.error('Gagal membuat signed URL:', error);
      toast({
        title: 'Gagal Mengunduh',
        description: 'Tidak dapat membuat tautan unduhan.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading && !isSubmitted) {
    return (
      <Center p={8}>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box>
      <DashboardTopbar />
      <Box maxW="4xl" mx="auto" p={8}>
        <Heading as="h1" size="xl" mb={6}>
          Dashboard Pengguna
        </Heading>

        {!isSubmitted ? (
        <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <FormControl>
              <FormLabel>Tanggal Permohonan</FormLabel>
              <Input
                type="date"
                name="tanggal_permohonan"
                value={formData.tanggal_permohonan}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Nama Lengkap</FormLabel>
              <Input type="text" name="nama" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>NIK</FormLabel>
              <Input type="text" name="nik" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Tempat Lahir</FormLabel>
              <Input type="text" name="tempat_lahir" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Tanggal Lahir</FormLabel>
              <Input type="date" name="tanggal_lahir" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Jenis Kelamin</FormLabel>
              <Select
                name="jenis_kelamin"
                placeholder="Pilih Jenis Kelamin"
                onChange={handleChange}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </Select>
            </FormControl>
              <FormControl>
                <FormLabel>Pendidikan</FormLabel>
                <Select
                  name="pendidikan"
                  placeholder="Pilih Pendidikan"
                  onChange={handleChange}
                >
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
              </FormControl>


              {/* <FormControl>
              <FormLabel>Pendidikan</FormLabel>
              <Input type="text" name="pendidikan" onChange={handleChange} />
            </FormControl> */}

            <FormControl>
              <FormLabel>Pekerjaan</FormLabel>
              <Input type="text" name="pekerjaan" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Jabatan</FormLabel>
              <Input type="text" name="jabatan" onChange={handleChange} />
            </FormControl>
          </Grid>

          <FormControl>
            <FormLabel>Alamat Sesuai KTP</FormLabel>
            <Textarea name="alamat_sesuai_ktp" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Alamat Domisili</FormLabel>
            <Textarea name="alamat_domisili" onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Alasan Permohonan</FormLabel>
            <Textarea name="alasan_permohonan" onChange={handleChange} />
          </FormControl>

            <FormControl>
              <FormLabel>Upload Foto (jpg/jpeg/png)</FormLabel>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFotoFileChange}
                p={1}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Upload Berkas Persyaratan (Jadikan 1 File)</FormLabel>

              <Box
                bg="gray.50"
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                p={4}
                mb={3}
              >
                <Text fontSize="sm" mb={2}>Mohon jadikan semua dokumen di bawah ini menjadi satu file (PDF/JPG/PNG):</Text>
                <VStack align="start" spacing={1} pl={4}>
                  <Text fontSize="sm">1. KTP / SIM / Passport</Text>
                  <Text fontSize="sm">2. SKCK</Text>
                  <Text fontSize="sm">3. Ijazah Terakhir</Text>
                  <Text fontSize="sm">4. Surat Permohonan Pembuatan Surat Keterangan</Text>
                  <Text fontSize="sm">5. Surat Pernyataan Bermaterai bahwa Pemohon Tidak Pernah Dipidana</Text>
                  <Text fontSize="sm">6. Bukti Pembayaran Surat Keterangan (Rp10.000)<br />
                    <Text as="span" fontStyle="italic" color="gray.600">*Untuk Bukti Pembayaran bisa dikirim ke nomor rekening BRI XXX-XXX-XXX</Text>
                  </Text>
                </VStack>
              </Box>

              <Input
                type="file"
                onChange={handleBerkasFileChange}
                accept=".pdf"
                p={1}
              />
            </FormControl>


          <Button type="submit" colorScheme="teal" isLoading={loading}>
            Kirim Data
          </Button>
        </VStack>
      ) : (
          /* ... bagian setelah terkirim sama seperti kode lama ... */
        <VStack spacing={4} align="stretch">
          {isApproved && (
            <Alert status="success">
              <AlertIcon />
              Pengajuan Anda telah <b>disetujui</b>.
              <Button onClick={handleDownload} colorScheme="green" ml={4}>
                Unduh Surat Keterangan
              </Button>
            </Alert>
          )}
          {isRejected && (
            <Alert status="error">
              <AlertIcon />
              Pengajuan Anda <b>ditolak</b> oleh admin.
            </Alert>
          )}
          {!isApproved && !isRejected && (
            <Alert status="warning">
              <AlertIcon />
              Data berhasil dikirim. Menunggu verifikasi dari admin.
            </Alert>
          )}

          {berkasUrl && (
            <Box mt={4}>
              <ChakraLink
                href={`${PROJECT_URL}/storage/v1/object/public/berkas-pendukung/${berkasUrl}`}
                isExternal
                color="blue.500"
              >
                Lihat Berkas Pendukung
              </ChakraLink>

              {berkasUrl.match(/\.(jpg|jpeg|png)$/i) && (
                <Image
                  src={`${PROJECT_URL}/storage/v1/object/public/berkas-pendukung/${berkasUrl}`}
                  alt="Preview"
                  maxW="xs"
                  mt={3}
                  borderWidth={1}
                  borderRadius="md"
                />
              )}
            </Box>
          )}

              {fotoUrl && (
                <Box mt={4}>
                  <Text fontWeight="bold">Foto Anda:</Text>
                  <Image
                    src={`${PROJECT_URL}/storage/v1/object/public/foto-user/${fotoUrl}`}
                    alt="Foto Pengguna"
                    maxW="xs"
                    mt={3}
                    borderWidth={1}
                    borderRadius="md"
                  />
                </Box>
              )}
        </VStack>
      )}
    </Box>
    </Box>
  );
};

export default UserDashboard;
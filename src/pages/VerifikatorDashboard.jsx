import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Tr,
  Th,
  InputGroup, 
  InputLeftElement,
  Td,
  Button,
  Spinner,
  Center,
  Link as ChakraLink,
  Input,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Text,
} from '@chakra-ui/react';
import DashboardTopbar from '../components/DashboardTopbar';
import { SearchIcon } from '@chakra-ui/icons';
import { pdf } from '@react-pdf/renderer';
import SuratKeteranganPDF from '../components/SuratKeteranganPDF';

const PROJECT_URL = process.env.REACT_APP_SUPABASE_URL || 'https://zltvhxuhxsmamtkvxpul.supabase.co';

const VerifikatorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      // Ambil data yang sudah di-approve admin (cek_verifikator berisi link PDF) 
      // tapi belum diproses verifikator
      const { data, error } = await supabase
        .from('surat_keterangan')
        .select('*')
        .not('cek_verifikator', 'is', null)
        .neq('status', 'Disetujui')
        .neq('status', 'Ditolak oleh Verifikator');

      if (error) {
        console.error('Gagal mengambil data:', error);
      } else {
        setSubmissions(data || []);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  // Filter berdasarkan nama (case-insensitive)
  const filtered = useMemo(() => {
    if (!search) return submissions;
    return submissions.filter((s) =>
      s.nama && s.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [submissions, search]);

  const generateBerkasUrl = (path) => {
    if (!path) return null;
    return `${PROJECT_URL}/storage/v1/object/public/berkas-pendukung/${path}`;
  };

  const generatePDFUrl = (path) => {
    if (!path) return null;
    return `${PROJECT_URL}/storage/v1/object/public/surat-keterangan/${path}`;
  };

  const handleSetuju = async (id, submissionData) => {
    setActionLoading(true);
    try {
      // Update status menjadi "Disetujui" dan pindahkan PDF dari cek_verifikator ke file_url
      const { error: updateError } = await supabase
        .from('surat_keterangan')
        .update({ 
          status: 'Disetujui',
          file_url: submissionData.cek_verifikator // Pindahkan PDF link ke file_url agar user bisa lihat
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Berhasil',
        description: 'Surat keterangan telah disetujui dan dikirim ke user.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      setSubmissions(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat memproses persetujuan.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTolakClick = (id) => {
    setSelectedId(id);
    setAlasanTolak('');
    onOpen();
  };

  const handleConfirmTolak = async () => {
    if (!alasanTolak.trim()) {
      toast({
        title: 'Alasan diperlukan',
        description: 'Silakan masukkan alasan penolakan.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('surat_keterangan')
        .update({ 
          status: 'Ditolak oleh Verifikator',
          alasan_tolak: alasanTolak
        })
        .eq('id', selectedId);

      if (updateError) throw updateError;

      toast({
        title: 'Berhasil',
        description: 'Surat keterangan telah ditolak dengan alasan.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      setSubmissions(prev => prev.filter(item => item.id !== selectedId));
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat memproses penolakan.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Center p={8}>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box>
      <DashboardTopbar logoutRedirect="/verifikator/login" />
      <Box p={10}>
        <Heading as="h1" size="lg" mb={6}>
          Dashboard Verifikator
        </Heading>
        <Breadcrumb fontWeight='medium' fontSize='sm'>
          <BreadcrumbItem>
            <BreadcrumbLink href='/verifikator'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href='/verifikator'>Dashboard Verifikator</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Tabel dengan Box-shadow */}
        <Box
          mt={6}
          overflowX="auto"
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          p={4}
        >
          {/* Input Pencarian */}
          <Flex mb={4} justify="space-between" align="center">
            <Text fontSize="md" fontWeight="medium">
              Data yang perlu diverifikasi: {filtered.length}
            </Text>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Cari berdasarkan nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Flex>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Nama</Th>
                <Th>Status</Th>
                <Th>Cek Verifikator</Th>
                <Th>PDF dari Admin</Th>
                <Th>Berkas</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((submission) => {
                const berkasUrl = generateBerkasUrl(submission.berkas_url);
                const pdfUrl = generatePDFUrl(submission.file_url);
                return (
                  <Tr key={submission.id}>
                    <Td>{submission.id}</Td>
                    <Td>{submission.nama}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          submission.status === 'Ditolak'
                            ? 'red'
                            : submission.status === 'Disetujui'
                              ? 'green'
                              : submission.status === 'Ditolak oleh Verifikator'
                                ? 'red'
                                : 'yellow'
                        }
                      >
                        {submission.status || 'Menunggu Verifikasi'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={submission.cek_verifikator ? 'green' : 'gray'}>
                        {submission.cek_verifikator ? 'Ada PDF' : 'Belum'}
                      </Badge>
                    </Td>
                    <Td>
                      {submission.cek_verifikator ? (
                        <ChakraLink 
                          href={`${PROJECT_URL}/storage/v1/object/public/surat-keterangan/${submission.cek_verifikator}`} 
                          isExternal 
                          color="blue.500"
                        >
                          Lihat PDF dari Admin
                        </ChakraLink>
                      ) : (
                        'Belum ada PDF'
                      )}
                    </Td>
                    <Td>
                      {berkasUrl ? (
                        <ChakraLink href={berkasUrl} isExternal color="blue.500">
                          Lihat Berkas
                        </ChakraLink>
                      ) : (
                        'Tidak ada'
                      )}
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <Button
                          onClick={() => handleSetuju(submission.id, submission)}
                          colorScheme="green"
                          size="sm"
                          isLoading={actionLoading}
                        >
                          Setuju & Kirim
                        </Button>
                        <Button
                          onClick={() => handleTolakClick(submission.id)}
                          colorScheme="red"
                          size="sm"
                          isLoading={actionLoading}
                        >
                          Tolak
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
              {filtered.length === 0 && (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text color="gray.500">
                      Tidak ada data yang perlu diverifikasi
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Modal Dialog untuk Alasan Penolakan */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alasan Penolakan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4} color="gray.600">
              Berikan alasan mengapa surat keterangan ini ditolak oleh verifikator:
            </Text>
            <Textarea
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              rows={6}
              resize="vertical"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleConfirmTolak}
              isDisabled={!alasanTolak.trim()}
              isLoading={actionLoading}
            >
              Tolak Pengajuan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VerifikatorDashboard;
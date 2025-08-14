import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  InputGroup, InputLeftElement,
  Td,
  Button,
  Spinner,
  Center,
  Link as ChakraLink,
  Input,          
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import DashboardTopbar from '../components/DashboardTopbar';
import SQLEditor from '../components/SQLEditor';
import { SearchIcon } from '@chakra-ui/icons';

const PROJECT_URL = process.env.REACT_APP_SUPABASE_URL || 'https://zltvhxuhxsmamtkvxpul.supabase.co';

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');   
  const { isOpen, onOpen, onClose } = useDisclosure();  // <── tambahan untuk SQL Editor

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from('surat_keterangan')
        .select('*');

      if (error) {
        console.error('Gagal mengambil data:', error);
      } else {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  // Filter berdasarkan nama (case-insensitive)
  const filtered = useMemo(() => {
    if (!search) return submissions;
    return submissions.filter((s) =>
      s.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [submissions, search]);

  const generateBerkasUrl = (path) => {
    if (!path) return null;
    return `${PROJECT_URL}/storage/v1/object/public/berkas-pendukung/${path}`;
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
      <DashboardTopbar logoutRedirect="/admin/login" />
      <Box p={10}>
        <Heading as="h1" size="lg" mb={6}>
          Dashboard Admin
        </Heading>
        <Breadcrumb fontWeight='medium' fontSize='sm'>
          <BreadcrumbItem>
            <BreadcrumbLink href='/admin'>Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink href='/admin'>Dashboard Admin</BreadcrumbLink>
          </BreadcrumbItem>

          {/* <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href='#'>Current</BreadcrumbLink>
          </BreadcrumbItem> */}
        </Breadcrumb>


        {/* ===== TABEL DENGAN BOX-SHADOW ===== */}
        <Box
          mt={6}
          overflowX="auto"
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          p={4}   // <── bayangan di sekeliling tabel
        >

          {/* ===== INPUT PENCARIAN ===== */}
          <Flex mb={4} justify="space-between" align="center">
            <Button onClick={onOpen} colorScheme="purple" size="sm">
              SQL Editor
            </Button>
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
                <Th>Berkas</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((submission) => {
                const berkasUrl = generateBerkasUrl(submission.berkas_url);
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
                              : 'yellow' // semua selain di atas akan default kuning
                        }
                      >
                        {submission.status || 'Menunggu Verifikasi'}
                      </Badge>
                    </Td>
                    {/*  <Td>{submission.status || 'Menunggu Verifikasi'}</Td> */}
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
                      <Button
                        as={Link}
                        to={`/admin/surat-keterangan/${submission.id}`}
                        colorScheme="teal"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Modal SQL Editor */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>SQL Editor</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SQLEditor />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
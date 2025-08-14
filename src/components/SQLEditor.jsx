import React, { useState } from 'react';
import {
  Box,
  Button,
  Textarea,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

const SQLEditor = () => {
  const [sqlQuery, setSqlQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Query untuk menambah kolom cek_verifikator
  const addColumnQuery = `ALTER TABLE surat_keterangan ADD COLUMN IF NOT EXISTS cek_verifikator BOOLEAN DEFAULT FALSE;`;

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: 'Query kosong',
        description: 'Silakan masukkan query SQL',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Untuk keamanan, hanya izinkan query tertentu
      const allowedQueries = [
        'ALTER TABLE surat_keterangan ADD COLUMN',
        'SELECT * FROM surat_keterangan LIMIT',
        'DESCRIBE surat_keterangan',
        'SELECT column_name FROM information_schema.columns WHERE table_name'
      ];

      const isAllowed = allowedQueries.some(allowed => 
        sqlQuery.toUpperCase().includes(allowed.toUpperCase())
      );

      if (!isAllowed) {
        throw new Error('Query tidak diizinkan. Hanya query ALTER TABLE untuk menambah kolom yang diperbolehkan.');
      }

      const { data, error } = await supabase.rpc('execute_sql', {
        query: sqlQuery
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: 'Query berhasil dijalankan',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    setSqlQuery(addColumnQuery);
    onClose();
  };

  return (
    <Box p={6} bg="white" borderRadius="md" boxShadow="lg">
      <VStack spacing={4} align="stretch">
        <Heading size="md">SQL Editor</Heading>
        
        <Text fontSize="sm" color="gray.600">
          Editor ini hanya untuk menambahkan kolom yang diperlukan ke tabel surat_keterangan.
        </Text>

        <Button onClick={onOpen} colorScheme="blue" size="sm" alignSelf="flex-start">
          Tambah Kolom cek_verifikator
        </Button>

        <Textarea
          placeholder="Masukkan query SQL..."
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          rows={6}
          fontFamily="monospace"
          fontSize="sm"
        />

        <Button
          onClick={executeQuery}
          isLoading={loading}
          colorScheme="green"
          size="md"
        >
          Jalankan Query
        </Button>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {result && (
          <Box>
            <Text fontWeight="bold" mb={2}>Hasil:</Text>
            <Box
              p={3}
              bg="gray.50"
              borderRadius="md"
              fontFamily="monospace"
              fontSize="sm"
              maxH="200px"
              overflowY="auto"
            >
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </Box>
          </Box>
        )}
      </VStack>

      {/* Modal Konfirmasi */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Kolom cek_verifikator</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Akan menjalankan query berikut untuk menambah kolom cek_verifikator:
            </Text>
            <Box
              p={3}
              bg="gray.100"
              borderRadius="md"
              fontFamily="monospace"
              fontSize="sm"
            >
              {addColumnQuery}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button colorScheme="blue" onClick={handleAddColumn}>
              Ya, Tambahkan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SQLEditor;
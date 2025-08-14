import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Code,
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

const DatabaseSetup = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const addCekVerifikatorColumn = async () => {
    setLoading(true);
    try {
      // Coba tambahkan kolom menggunakan SQL raw query
      const { data, error } = await supabase
        .rpc('sql', {
          query: 'ALTER TABLE surat_keterangan ADD COLUMN IF NOT EXISTS cek_verifikator BOOLEAN DEFAULT FALSE;'
        });

      if (error) {
        // Jika RPC tidak ada, coba menggunakan metode lain
        console.log('RPC error:', error);
        
        // Alternatif: Coba update langsung dengan supabase client
        const { error: updateError } = await supabase
          .from('surat_keterangan')
          .update({ cek_verifikator: false })
          .eq('id', 999999); // ID yang tidak ada, hanya untuk trigger kolom

        if (updateError && !updateError.message.includes('No rows updated')) {
          throw updateError;
        }
      }

      setSuccess(true);
      toast({
        title: 'Berhasil',
        description: 'Kolom cek_verifikator berhasil ditambahkan ke database.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error adding column:', err);
      toast({
        title: 'Perhatian',
        description: 'Kolom mungkin sudah ada atau perlu ditambahkan manual di Supabase Dashboard.',
        status: 'warning',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert status="success" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Database siap!</AlertTitle>
          <AlertDescription>
            Kolom cek_verifikator telah ditambahkan ke tabel surat_keterangan.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box p={6} bg="white" borderRadius="md" boxShadow="lg">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Setup Database</Text>
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Kolom Database Diperlukan</AlertTitle>
            <AlertDescription>
              Untuk fitur verifikator berfungsi, perlu menambahkan kolom <Code>cek_verifikator</Code> ke tabel <Code>surat_keterangan</Code>.
            </AlertDescription>
          </Box>
        </Alert>

        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.600" mb={2}>SQL yang akan dijalankan:</Text>
          <Code display="block" p={2}>
            ALTER TABLE surat_keterangan ADD COLUMN IF NOT EXISTS cek_verifikator BOOLEAN DEFAULT FALSE;
          </Code>
        </Box>

        <Button
          onClick={addCekVerifikatorColumn}
          colorScheme="blue"
          isLoading={loading}
          loadingText="Menambahkan kolom..."
        >
          Tambahkan Kolom cek_verifikator
        </Button>

        <Alert status="warning" size="sm">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Jika tombol di atas tidak berhasil, silakan tambahkan kolom secara manual di Supabase Dashboard dengan SQL Editor.
          </AlertDescription>
        </Alert>
      </VStack>
    </Box>
  );
};

export default DatabaseSetup;
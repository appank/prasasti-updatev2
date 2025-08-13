import React, { useState } from 'react';
import {
  Box, Flex, Input, VStack, Heading, Text, Button,
} from '@chakra-ui/react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HealthCertificatePDF from '../components/HealthCertificatePDF';

export default function HealthCertificatePage() {
  const [form, setForm] = useState({
    nama: '',
    usia: '',
    kondisi: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const certificateData = {
    ...form,
    no: `HC-${Math.floor(100000 + Math.random() * 900000)}`,
    tanggal: new Date().toLocaleDateString('id-ID'),
    dokter: 'Dr. Sarah Wijayanti, Sp.PD',
  };

  const ready = form.nama && form.usia && form.kondisi;

  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      gap={6}
      p={6}
      maxW="7xl"
      mx="auto"
    >
      {/* FORM KIRI */}
      <Box flex="1">
        <Heading size="lg" mb={4}>Input Data Pasien</Heading>
        <VStack spacing={4} align="stretch">
          <Input name="nama" placeholder="Nama Lengkap Pasien" value={form.nama} onChange={handleChange} />
          <Input name="usia" placeholder="Usia (tahun)" value={form.usia} onChange={handleChange} />
          <Input name="kondisi" placeholder="Kondisi Kesehatan" value={form.kondisi} onChange={handleChange} />
        </VStack>
      </Box>

      {/* PREVIEW KANAN */}
      <Box flex="1">
        <Heading size="lg" mb={4}>Preview Sertifikat</Heading>

        <Box
          borderWidth={1}
          borderRadius="md"
          p={6}
          bg="gray.50"
          minH="xs"
          whiteSpace="pre-line"
        >
          <Text fontSize="lg" fontWeight="bold">SERTIFIKAT KESEHATAN</Text>
          <Text mb={3}>Nomor: {certificateData.no}</Text>

          <Text><b>Nama Lengkap:</b> {form.nama || '-'}</Text>
          <Text><b>Usia:</b> {form.usia ? `${form.usia} tahun` : '-'}</Text>
          <Text><b>Kondisi Kesehatan:</b> {form.kondisi || '-'}</Text>

          <Text mt={4}>Tanggal: {certificateData.tanggal}</Text>
          <Text>Dokter: {certificateData.dokter}</Text>
        </Box>

        <Box mt={4}>
          <PDFDownloadLink
            document={<HealthCertificatePDF data={certificateData} />}
            fileName={`sertifikat-${form.nama || 'pasien'}.pdf`}
          >
            {({ loading }) => (
              <Button
                colorScheme="green"
                width="full"
                isDisabled={!ready}
                isLoading={loading}
              >
                Unduh PDF Sertifikat
              </Button>
            )}
          </PDFDownloadLink>
        </Box>
      </Box>
    </Flex>
  );
}
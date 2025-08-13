import React, { useEffect, useState } from 'react';
import { Box, Text, Heading, Divider, Image, Flex } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

const logoSrc = '/logo-pn-cibinong.png';
const qrCodeSrc = '/qrcode.png';

const formatTanggal = (tanggalStr) => {
  if (!tanggalStr || typeof tanggalStr !== 'string') return '-';
  if (tanggalStr.includes('-')) {
    const [yyyy, mm, dd] = tanggalStr.split('-');
    tanggalStr = `${dd}/${mm}/${yyyy}`;
  }
  const parts = tanggalStr.split('/');
  if (parts.length !== 3) return '-';
  let [dd, mm, yyyy] = parts;
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const bulanIndex = parseInt(mm, 10) - 1;
  if (bulanIndex < 0 || bulanIndex > 11 || isNaN(bulanIndex)) return '-';
  const bulan = namaBulan[bulanIndex];
  dd = String(parseInt(dd, 10));
  return `${dd} - ${bulan} - ${yyyy}`;
};

export default function SuratKeteranganPreview({ data }) {
  const [signedFotoUrl, setSignedFotoUrl] = useState(null);

  useEffect(() => {
    // Ambil signed URL dari Supabase Storage (foto-user)
    const getSignedUrl = async () => {
      if (!data?.foto_url) {
        setSignedFotoUrl(null);
        return;
      }
      try {
        const { data: signedData, error } = await supabase
          .storage
          .from('foto-user')
          .createSignedUrl(data.foto_url, 60 * 60); // 1 jam
        setSignedFotoUrl(signedData?.signedUrl || null);
      } catch (err) {
        setSignedFotoUrl(null);
      }
    };
    getSignedUrl();
  }, [data?.foto_url]);

  return (
    <Box
      fontFamily="Arial"
      color="black"
      fontSize="14px"
      lineHeight="1.4"
      bg="white"
      p={6}
      borderRadius="md"
      minH="700px"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="center"
        mb={2}
        w="100%"
      >
        {/* Kolom Kiri: Logo */}
        <Box w="100px" display="flex" justifyContent="center">
          <Image
            src={logoSrc}
            alt="Logo PN Cibinong"
            w="80px"
            h="80px"
            objectFit="contain"
          />
        </Box>
        {/* Kolom Tengah: Kop Surat */}
        <Box flex="1" textAlign="center">
          <Heading size="md" fontWeight="bold" letterSpacing="1px" fontFamily={"'BookmanBD'"} lineHeight={1.2} fontSize={15}>
            MAHKAMAH AGUNG REPUBLIK INDONESIA
          </Heading>
          <Heading size="sm" fontWeight="bold" fontFamily={"'BookmanBD'"} lineHeight={1.2} fontSize={15}>
            DIREKTORAT JENDERAL BADAN PERADILAN UMUM
          </Heading>
          <Heading size="sm" fontWeight="bold" fontFamily={"'BookmanBD'"} lineHeight={1.2} fontSize={15}>
            PENGADILAN TINGGI BANDUNG
          </Heading>
          <Heading size="sm" fontWeight="bold" fontFamily={"'BookmanBD'"} lineHeight={1.2} fontSize={15}>
            PENGADILAN NEGERI CIBINONG KELAS 1A
          </Heading>
          <Text fontSize="sm" fontFamily={"'Bookman'"} lineHeight={1.2} >
            Jl. Tegar Beriman No. 5, Cibinong, Kab. Bogor - Jawa Barat<br />
            Telp. 021-87905153, 021-87905154 Fax. 021-87905808<br />
            Website: pn-cibinong.go.id Email: info.pncibinong@gmail.com
          </Text>
        </Box>
        {/* Kolom Kanan: Kosong agar header tetap simetris */}
        <Box w="100px" />
      </Flex>
      <Divider my={2} borderColor="black" borderWidth="2px" />

      {/* Judul */}
      <Text textAlign="center" fontWeight="bold" mt={2} mb={1} >
        SURAT KETERANGAN
      </Text>
      <Text textAlign="center" fontWeight="bold" mb={2}>
        TIDAK PERNAH SEBAGAI TERPIDANA
      </Text>
      <Text textAlign="center" mb={4}>
        <b> NOMOR:</b> <b>{data.nomor}</b>
      </Text>

      {/* Isi */}
      <Text mb={2}>
        Ketua Pengadilan Negeri Cibinong menerangkan bahwa:
      </Text>
      <Box pl={4} mb={2}>
        <Text><b>Nama</b> : {data.nama}</Text>
        <Text><b>Jenis Kelamin</b> : {data.jenis_kelamin}</Text>
        <Text>
          <b>Tempat Tgl. Lahir</b> : {data.tempat_lahir || '-'}, {formatTanggal(data.tanggal_lahir)}
        </Text>
        <Text><b>Pekerjaan</b> : {data.pekerjaan}</Text>
        <Text><b>Alamat</b> : {data.alamat_sesuai_ktp}</Text>
        <Text><b>Pendidikan</b> : {data.pendidikan}</Text>
      </Box>
      <Text mb={2}>
        Berdasarkan hasil pemeriksaan Register Berkas Pidana, Pengadilan menerangkan bahwa
        yang bersangkutan:
      </Text>
      <Box pl={4} mb={2}>
        <Text>a. Tidak sedang menjalani hukuman pidana penjara;</Text>
        <Text>
          b. Tidak pernah dijatuhi hukuman pidana penjara berdasarkan Putusan Pengadilan Negeri
          yang mempunyai kekuatan hukum tetap karena melakukan tindak pidana yang diancam
          dengan pidana penjara 5 (lima) tahun atau lebih.
        </Text>
      </Box>
      <Text mb={2}>
        Bahwa, Surat Keterangan ini dibuat sebagai persyaratan {data.alasan_permohonan}
        Apabila dikemudian hari terdapat kekeliruan dalam Surat Keterangan ini, akan
        diadakan perbaikan sebagaimana mestinya.
      </Text>

      {/* Tanda tangan & Foto */}
      <Flex justify="flex-end" mt={10} pr={4}>
        <Flex align="flex-end" gap={4}>
          <Image
            src={signedFotoUrl || '/placeholder-4x6.jpg'}
            alt="Foto 4x6"
            htmlWidth={113}
            htmlHeight={170}
            objectFit="cover"
            border="1px solid #ccc"
            fallbackSrc="/placeholder-4x6.jpg"
          />
          <Flex direction="column" align="flex-start">
            <Text mb={2}>Ditetapkan di Cibinong</Text>
            <Text mb={2}>
              Pada tanggal, {formatTanggal(data.tanggal)}
            </Text>
            <Text mb={2}>An Ketua Pengadilan Negeri Cibinong</Text>
            <Image
              src={qrCodeSrc}
              alt="QR Code"
              htmlWidth={80}
              htmlHeight={80}
              my={2}
            />
            <Text color="gray" fontSize="8px" mb={1}>
              Ditandatangani secara elektronik
            </Text>
            <Text fontWeight="bold" fontSize="16px">
              {data.pejabat}
            </Text>
          </Flex>

        </Flex>
      </Flex>
    </Box>
  );
}

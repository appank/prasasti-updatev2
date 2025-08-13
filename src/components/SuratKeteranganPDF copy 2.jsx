import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Styling surat
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 130,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  isiSurat: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  signatureBlock: {
    alignItems: 'flex-end',
    marginTop: 40,
  },
  foto: {
    width: 110,
    height: 150,
    objectFit: 'cover',
    border: '1 solid #333',
    position: 'absolute',
    top: 40,
    right: 40,
  },
});

function formatTanggalIndonesia(tanggalStr) {
  if (!tanggalStr || typeof tanggalStr !== 'string') return '-';
  const bulanIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const [yyyy, mm, dd] = tanggalStr.split('-');
  const namaBulan = bulanIndo[parseInt(mm, 10) - 1];
  return `${dd} ${namaBulan} ${yyyy}`;
}

const SuratKeteranganPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* FOTO 4x6 */}
      {data.foto_url_signed && (
        <Image
          src={data.foto_url_signed}
          style={styles.foto}
        />
      )}

      {/* Judul */}
      <Text style={styles.title}>SURAT KETERANGAN</Text>
      <Text style={styles.subtitle}>No: {data.nomor || '-'}</Text>

      {/* Data pribadi */}
      <View style={styles.row}>
        <Text style={styles.label}>Nama</Text>
        <Text style={styles.value}>: {data.nama || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>NIK</Text>
        <Text style={styles.value}>: {data.nik || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Jenis Kelamin</Text>
        <Text style={styles.value}>: {data.jenis_kelamin || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tempat, Tanggal Lahir</Text>
        <Text style={styles.value}>: {data.tempat_lahir || '-'}, {formatTanggalIndonesia(data.tanggal_lahir)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pekerjaan</Text>
        <Text style={styles.value}>: {data.pekerjaan || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pendidikan</Text>
        <Text style={styles.value}>: {data.pendidikan || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Alamat KTP</Text>
        <Text style={styles.value}>: {data.alamat_sesuai_ktp || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Alamat Domisili</Text>
        <Text style={styles.value}>: {data.alamat_domisili || '-'}</Text>
      </View>

      {/* Isi Surat */}
      <Text style={styles.isiSurat}>
        Berdasarkan permohonan pada tanggal {formatTanggalIndonesia(data.tanggal_permohonan)} dengan alasan:
      </Text>
      <Text style={styles.isiSurat}>
        "{data.alasan_permohonan || '-'}"
      </Text>

      {/* Penutup */}
      <Text style={styles.isiSurat}>
        Demikian surat keterangan ini dibuat untuk digunakan sebagaimana mestinya.
      </Text>

      {/* Blok tanda tangan */}
      <View style={styles.signatureBlock}>
        <Text>
          {data.pejabat && ` ${data.pejabat},`}
        </Text>
        <Text>
          {data.tanggal && formatTanggalIndonesia(data.tanggal)}
        </Text>
        <Text style={{ marginTop: 60, fontWeight: 'bold' }}>
          {data.pejabat || 'Pejabat Berwenang'}
        </Text>
      </View>
    </Page>
  </Document>
);

export default SuratKeteranganPDF;

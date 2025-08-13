import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Optional: register a TTF font if you need Times New Roman
Font.register({
  family: 'Times',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v26/STIXTwoText-Regular.ttf',
});

const styles = StyleSheet.create({
  body: {
    padding: 36,
    fontFamily: 'Times',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  bold: { fontWeight: 'bold' },
  underline: { textDecoration: 'underline' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 120 },
  value: { flex: 1 },
});

export default function LetterPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.body}>
        {/* Kop Surat */}
        <View style={styles.header}>
          <Text style={styles.bold}>PENGADILAN NEGERI CIBINONG</Text>
          <Text>Jl. Tegar Beriman No. 5, Cibinong, Kab. Bogor – Jawa Barat</Text>
          <Text>Telp. 021-87905153, 021-87905154  Fax. 021-87905808</Text>
          <Text>Website : pn-cibinong.go.id  Email : info.pncibinong@gmail.com</Text>
          <Text style={{ marginTop: 20, fontSize: 14, fontWeight: 'bold' }}>
            SURAT KETERANGAN
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
            TIDAK PERNAH SEBAGAI TERPIDANA
          </Text>
          <Text>Nomor : {data.noSurat}</Text>
        </View>

        <Text style={{ marginBottom: 20 }}>
          Ketua Pengadilan Negeri Cibinong menerangkan bahwa :
        </Text>

        {/* Data Pemohon */}
        <View style={styles.row}>
          <Text style={styles.label}>Nama</Text>
          <Text>: {data.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jenis Kelamin</Text>
          <Text>: {data.jk}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tempat / Tgl. Lahir</Text>
          <Text>: {data.tempatTglLahir}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pekerjaan</Text>
          <Text>: {data.pekerjaan}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat</Text>
          <Text>: {data.alamat}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pendidikan</Text>
          <Text>: {data.pendidikan}</Text>
        </View>

        <Text style={{ marginTop: 20 }}>
          Berdasarkan hasil pemeriksaan Register Perkara Pidana pengadilan menerangkan bahwa
          yang bersangkutan <Text style={styles.bold}>TIDAK PERNAH SEBAGAI TERPIDANA</Text>.
        </Text>

        <Text style={{ marginTop: 30, alignSelf: 'flex-end' }}>
          Cibinong, {data.tanggalCetak}
        </Text>
        <Text style={{ marginTop: 70, alignSelf: 'flex-end' }}>Ketua</Text>
      </Page>
    </Document>
  );
}
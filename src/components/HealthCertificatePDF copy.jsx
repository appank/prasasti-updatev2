import React from 'react';
import {
  Page, Text, View, Document, StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 12 },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 120, fontWeight: 'bold' },
  value: { flex: 1 },
});

export default function HealthCertificatePDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>SERTIFIKAT KESEHATAN</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Nomor: {data.no}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Nama Lengkap:</Text>
          <Text style={styles.value}>{data.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Usia:</Text>
          <Text style={styles.value}>{data.usia} tahun</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kondisi Kesehatan:</Text>
          <Text style={styles.value}>{data.kondisi}</Text>
        </View>

        <Text style={{ marginTop: 30 }}>
          Tanggal: {data.tanggal}
        </Text>
        <Text>Dokter: {data.dokter}</Text>
      </Page>
    </Document>
  );
}
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Alert,
  AlertIcon,
  Text,
  Select,
  Textarea,
  Grid,
  Card,
  CardBody,
  Badge,
  Icon,
  Flex,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Progress,
  Image,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaVenusMars, 
  FaGraduationCap, 
  FaBriefcase, 
  FaHome, 
  FaFileAlt, 
  FaCamera, 
  FaFilePdf, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaDownload,
  FaEye,
  FaArrowLeft,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Validation functions
const validators = {
  nama: (value) => {
    if (!value) return "Nama lengkap wajib diisi";
    if (value.length < 3) return "Nama minimal 3 karakter";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Nama hanya boleh mengandung huruf dan spasi";
    return "";
  },
  nik: (value) => {
    if (!value) return "NIK wajib diisi";
    if (!/^\d{16}$/.test(value)) return "NIK harus 16 digit angka";
    return "";
  },
  tempat_lahir: (value) => {
    if (!value) return "Tempat lahir wajib diisi";
    if (value.length < 2) return "Tempat lahir terlalu pendek";
    return "";
  },
  jenis_kelamin: (value) => {
    if (!value) return "Jenis kelamin wajib dipilih";
    return "";
  },
  pendidikan: (value) => {
    if (!value) return "Pendidikan wajib dipilih";
    return "";
  },
  pekerjaan: (value) => {
    if (!value) return "Pekerjaan wajib diisi";
    return "";
  },
  jabatan: (value) => {
    if (!value) return "Jabatan wajib diisi";
    return "";
  },
  alamat_sesuai_ktp: (value) => {
    if (!value) return "Alamat sesuai KTP wajib diisi";
    if (value.length < 10) return "Alamat minimal 10 karakter";
    return "";
  },
  alamat_domisili: (value) => {
    if (!value) return "Alamat domisili wajib diisi";
    if (value.length < 10) return "Alamat minimal 10 karakter";
    return "";
  },
  alasan_permohonan: (value) => {
    if (!value) return "Alasan permohonan wajib diisi";
    if (value.length < 20) return "Alasan permohonan minimal 20 karakter";
    return "";
  }
};

const DemoUserDashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tanggal_permohonan: new Date().toISOString().substr(0, 10),
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

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [berkasFile, setBerkasFile] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [demoStatus, setDemoStatus] = useState('form'); // 'form', 'pending', 'approved', 'rejected'

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, blue.900, purple.900, pink.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');

  const steps = [
    { title: 'Data Pribadi', icon: FaUser },
    { title: 'Alamat & Pekerjaan', icon: FaHome },
    { title: 'Dokumen', icon: FaFileAlt }
  ];

  const validateField = (name, value) => {
    if (validators[name]) {
      return validators[name](value);
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
    
    // Mark field as touched
    setTouchedFields({ ...touchedFields, [name]: true });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'berkas') {
        if (file.type !== 'application/pdf') {
          setErrors({ ...errors, berkas: 'File harus berformat PDF' });
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setErrors({ ...errors, berkas: 'Ukuran file maksimal 10MB' });
          return;
        }
        setErrors({ ...errors, berkas: '' });
        setBerkasFile(file);
      } else if (type === 'foto') {
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          setErrors({ ...errors, foto: 'File harus berformat JPG, JPEG, atau PNG' });
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          setErrors({ ...errors, foto: 'Ukuran file maksimal 2MB' });
          return;
        }
        setErrors({ ...errors, foto: '' });
        setFotoFile(file);
      }
    }
  };

  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    if (!fotoFile) {
      newErrors.foto = 'Foto wajib diupload';
      isValid = false;
    }
    if (!berkasFile) {
      newErrors.berkas = 'Berkas pendukung wajib diupload';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    // Demo submission - change status to show different states
    setDemoStatus('pending');
    
    // Simulate status changes
    setTimeout(() => setDemoStatus('approved'), 3000);
  };

  const getStepProgress = () => {
    const step1Fields = ['nama', 'nik', 'tempat_lahir', 'jenis_kelamin', 'pendidikan'];
    const step2Fields = ['pekerjaan', 'jabatan', 'alamat_sesuai_ktp', 'alamat_domisili', 'alasan_permohonan'];
    const step3Fields = ['foto', 'berkas'];

    const step1Complete = step1Fields.every(field => formData[field] && !errors[field]);
    const step2Complete = step2Fields.every(field => formData[field] && !errors[field]);
    const step3Complete = fotoFile && berkasFile && !errors.foto && !errors.berkas;

    let progress = 0;
    if (step1Complete) progress += 33;
    if (step2Complete) progress += 33;
    if (step3Complete) progress += 34;

    return progress;
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Header */}
      <Flex align="center" justify="space-between" p={6} bg="white" shadow="sm">
        <Button 
          leftIcon={<Icon as={FaArrowLeft} />} 
          variant="ghost" 
          onClick={() => navigate('/')}
        >
          Kembali ke Login
        </Button>
        <Heading size="md" color="blue.600">DEMO - Dashboard Pengguna</Heading>
        <Box />
      </Flex>

      <Box maxW="6xl" mx="auto" p={8}>
        <VStack spacing={8} align="stretch">
          {/* Demo Status Buttons */}
          <Card bg="gray.100" shadow="sm">
            <CardBody>
              <Text fontWeight="bold" mb={3} color="gray.700">🎯 Demo Controls:</Text>
              <HStack spacing={4} wrap="wrap">
                <Button size="sm" colorScheme="blue" onClick={() => setDemoStatus('form')}>
                  Show Form
                </Button>
                <Button size="sm" colorScheme="orange" onClick={() => setDemoStatus('pending')}>
                  Show Pending Status
                </Button>
                <Button size="sm" colorScheme="green" onClick={() => setDemoStatus('approved')}>
                  Show Approved Status
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => setDemoStatus('rejected')}>
                  Show Rejected Status
                </Button>
              </HStack>
            </CardBody>
          </Card>

          <Box textAlign="center">
            <Heading 
              as="h1" 
              size="2xl" 
              bgGradient="linear(to-r, blue.600, purple.600)" 
              bgClip="text"
              mb={2}
            >
              Dashboard Pengguna
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Kelola pengajuan surat keterangan Anda dengan mudah
            </Text>
          </Box>

          {demoStatus === 'form' ? (
            <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
              <CardBody p={8}>
                {/* Progress Steps */}
                <VStack spacing={6} mb={8}>
                  <HStack spacing={4} w="full" justify="center">
                    {steps.map((step, index) => (
                      <Flex key={index} align="center" flex={index < steps.length - 1 ? 1 : 0}>
                        <Flex
                          align="center"
                          justify="center"
                          w={12}
                          h={12}
                          borderRadius="full"
                          bg={currentStep >= index ? "blue.500" : "gray.200"}
                          color={currentStep >= index ? "white" : "gray.500"}
                          transition="all 0.3s"
                        >
                          <Icon as={step.icon} boxSize={5} />
                        </Flex>
                        <VStack spacing={1} ml={3} align="start">
                          <Text fontSize="sm" fontWeight="semibold" color={currentStep >= index ? "blue.600" : "gray.500"}>
                            Step {index + 1}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {step.title}
                          </Text>
                        </VStack>
                        {index < steps.length - 1 && (
                          <Box flex={1} h="2px" bg="gray.200" mx={4}>
                            <Box
                              h="full"
                              bg="blue.500"
                              w={currentStep > index ? "100%" : "0%"}
                              transition="width 0.3s"
                            />
                          </Box>
                        )}
                      </Flex>
                    ))}
                  </HStack>
                  
                  <Box w="full">
                    <Progress value={getStepProgress()} colorScheme="blue" size="lg" borderRadius="full" />
                    <Text textAlign="center" mt={2} fontSize="sm" color="gray.600">
                      {getStepProgress()}% Complete
                    </Text>
                  </Box>
                </VStack>

                <VStack as="form" onSubmit={handleSubmit} spacing={8} align="stretch">
                  {/* Step 1: Data Pribadi */}
                  {currentStep === 0 && (
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" color="blue.600" textAlign="center">
                        <Icon as={FaUser} mr={3} />
                        Data Pribadi
                      </Heading>
                      
                      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                        <FormControl isInvalid={errors.nama && touchedFields.nama}>
                          <FormLabel>
                            <Icon as={FaUser} mr={2} />
                            Nama Lengkap
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={FaUser} color="gray.400" />
                            </InputLeftElement>
                            <Input 
                              name="nama" 
                              value={formData.nama}
                              onChange={handleChange}
                              placeholder="Masukkan nama lengkap"
                              focusBorderColor="blue.500"
                              _hover={{ borderColor: "blue.300" }}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.nama}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.nik && touchedFields.nik}>
                          <FormLabel>
                            <Icon as={FaIdCard} mr={2} />
                            NIK
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={FaIdCard} color="gray.400" />
                            </InputLeftElement>
                            <Input 
                              name="nik" 
                              value={formData.nik}
                              onChange={handleChange}
                              placeholder="16 digit NIK"
                              maxLength={16}
                              focusBorderColor="blue.500"
                              _hover={{ borderColor: "blue.300" }}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.nik}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.tempat_lahir && touchedFields.tempat_lahir}>
                          <FormLabel>
                            <Icon as={FaMapMarkerAlt} mr={2} />
                            Tempat Lahir
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={FaMapMarkerAlt} color="gray.400" />
                            </InputLeftElement>
                            <Input 
                              name="tempat_lahir" 
                              value={formData.tempat_lahir}
                              onChange={handleChange}
                              placeholder="Tempat lahir"
                              focusBorderColor="blue.500"
                              _hover={{ borderColor: "blue.300" }}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.tempat_lahir}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Tanggal Lahir</FormLabel>
                          <Input
                            type="date"
                            name="tanggal_lahir"
                            value={formData.tanggal_lahir}
                            onChange={handleChange}
                            focusBorderColor="blue.500"
                            _hover={{ borderColor: "blue.300" }}
                          />
                        </FormControl>

                        <FormControl isInvalid={errors.jenis_kelamin && touchedFields.jenis_kelamin}>
                          <FormLabel>
                            <Icon as={FaVenusMars} mr={2} />
                            Jenis Kelamin
                          </FormLabel>
                          <Select
                            name="jenis_kelamin"
                            value={formData.jenis_kelamin}
                            onChange={handleChange}
                            placeholder="Pilih jenis kelamin"
                            focusBorderColor="blue.500"
                            _hover={{ borderColor: "blue.300" }}
                          >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </Select>
                          <FormErrorMessage>{errors.jenis_kelamin}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.pendidikan && touchedFields.pendidikan}>
                          <FormLabel>
                            <Icon as={FaGraduationCap} mr={2} />
                            Pendidikan
                          </FormLabel>
                          <Select
                            name="pendidikan"
                            value={formData.pendidikan}
                            onChange={handleChange}
                            placeholder="Pilih pendidikan terakhir"
                            focusBorderColor="blue.500"
                            _hover={{ borderColor: "blue.300" }}
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
                          <FormErrorMessage>{errors.pendidikan}</FormErrorMessage>
                        </FormControl>
                      </Grid>
                    </VStack>
                  )}

                  {/* Step 2: Alamat & Pekerjaan */}
                  {currentStep === 1 && (
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" color="blue.600" textAlign="center">
                        <Icon as={FaHome} mr={3} />
                        Alamat & Pekerjaan
                      </Heading>
                      
                      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                        <FormControl isInvalid={errors.pekerjaan && touchedFields.pekerjaan}>
                          <FormLabel>
                            <Icon as={FaBriefcase} mr={2} />
                            Pekerjaan
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={FaBriefcase} color="gray.400" />
                            </InputLeftElement>
                            <Input 
                              name="pekerjaan" 
                              value={formData.pekerjaan}
                              onChange={handleChange}
                              placeholder="Pekerjaan saat ini"
                              focusBorderColor="blue.500"
                              _hover={{ borderColor: "blue.300" }}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.pekerjaan}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.jabatan && touchedFields.jabatan}>
                          <FormLabel>Jabatan</FormLabel>
                          <Input 
                            name="jabatan" 
                            value={formData.jabatan}
                            onChange={handleChange}
                            placeholder="Jabatan/posisi"
                            focusBorderColor="blue.500"
                            _hover={{ borderColor: "blue.300" }}
                          />
                          <FormErrorMessage>{errors.jabatan}</FormErrorMessage>
                        </FormControl>
                      </Grid>

                      <FormControl isInvalid={errors.alamat_sesuai_ktp && touchedFields.alamat_sesuai_ktp}>
                        <FormLabel>
                          <Icon as={FaHome} mr={2} />
                          Alamat Sesuai KTP
                        </FormLabel>
                        <Textarea 
                          name="alamat_sesuai_ktp" 
                          value={formData.alamat_sesuai_ktp}
                          onChange={handleChange}
                          placeholder="Alamat lengkap sesuai KTP"
                          rows={3}
                          focusBorderColor="blue.500"
                          _hover={{ borderColor: "blue.300" }}
                        />
                        <FormErrorMessage>{errors.alamat_sesuai_ktp}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.alamat_domisili && touchedFields.alamat_domisili}>
                        <FormLabel>
                          <Icon as={FaHome} mr={2} />
                          Alamat Domisili
                        </FormLabel>
                        <Textarea 
                          name="alamat_domisili" 
                          value={formData.alamat_domisili}
                          onChange={handleChange}
                          placeholder="Alamat tempat tinggal saat ini"
                          rows={3}
                          focusBorderColor="blue.500"
                          _hover={{ borderColor: "blue.300" }}
                        />
                        <FormErrorMessage>{errors.alamat_domisili}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.alasan_permohonan && touchedFields.alasan_permohonan}>
                        <FormLabel>
                          <Icon as={FaFileAlt} mr={2} />
                          Alasan Permohonan
                        </FormLabel>
                        <Textarea 
                          name="alasan_permohonan" 
                          value={formData.alasan_permohonan}
                          onChange={handleChange}
                          placeholder="Jelaskan alasan pengajuan surat keterangan (minimal 20 karakter)"
                          rows={4}
                          focusBorderColor="blue.500"
                          _hover={{ borderColor: "blue.300" }}
                        />
                        <FormErrorMessage>{errors.alasan_permohonan}</FormErrorMessage>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {formData.alasan_permohonan.length}/20 karakter minimum
                        </Text>
                      </FormControl>
                    </VStack>
                  )}

                  {/* Step 3: Dokumen */}
                  {currentStep === 2 && (
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" color="blue.600" textAlign="center">
                        <Icon as={FaFileAlt} mr={3} />
                        Upload Dokumen
                      </Heading>
                      
                      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                        <FormControl isInvalid={errors.foto}>
                          <FormLabel>
                            <Icon as={FaCamera} mr={2} />
                            Upload Foto
                          </FormLabel>
                          <Card bg="gray.50" border="2px dashed" borderColor="gray.300" _hover={{ borderColor: "blue.300" }}>
                            <CardBody textAlign="center" py={8}>
                              <Icon as={FaCamera} boxSize={8} color="gray.400" mb={2} />
                              <Input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, 'foto')}
                                display="none"
                                id="foto-upload"
                              />
                              <label htmlFor="foto-upload">
                                <Button as="span" colorScheme="blue" variant="outline" cursor="pointer">
                                  Pilih Foto
                                </Button>
                              </label>
                              <Text fontSize="sm" color="gray.500" mt={2}>
                                JPG, JPEG, PNG • Max 2MB
                              </Text>
                              {fotoFile && (
                                <Badge colorScheme="green" mt={2}>
                                  {fotoFile.name}
                                </Badge>
                              )}
                            </CardBody>
                          </Card>
                          <FormErrorMessage>{errors.foto}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.berkas}>
                          <FormLabel>
                            <Icon as={FaFilePdf} mr={2} />
                            Upload Berkas Pendukung
                          </FormLabel>
                          <Card bg="gray.50" border="2px dashed" borderColor="gray.300" _hover={{ borderColor: "blue.300" }}>
                            <CardBody textAlign="center" py={8}>
                              <Icon as={FaFilePdf} boxSize={8} color="gray.400" mb={2} />
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileChange(e, 'berkas')}
                                display="none"
                                id="berkas-upload"
                              />
                              <label htmlFor="berkas-upload">
                                <Button as="span" colorScheme="blue" variant="outline" cursor="pointer">
                                  Pilih File PDF
                                </Button>
                              </label>
                              <Text fontSize="sm" color="gray.500" mt={2}>
                                PDF • Max 10MB
                              </Text>
                              {berkasFile && (
                                <Badge colorScheme="green" mt={2}>
                                  {berkasFile.name}
                                </Badge>
                              )}
                            </CardBody>
                          </Card>
                          <FormErrorMessage>{errors.berkas}</FormErrorMessage>
                        </FormControl>
                      </Grid>

                      <Card bg="blue.50" border="1px" borderColor="blue.200">
                        <CardBody>
                          <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.800">
                            📋 Dokumen yang diperlukan dalam 1 file PDF:
                          </Text>
                          <VStack align="start" spacing={1} pl={4}>
                            <Text fontSize="sm" color="blue.700">• KTP / SIM / Passport</Text>
                            <Text fontSize="sm" color="blue.700">• SKCK</Text>
                            <Text fontSize="sm" color="blue.700">• Ijazah Terakhir</Text>
                            <Text fontSize="sm" color="blue.700">• Surat Permohonan Pembuatan Surat Keterangan</Text>
                            <Text fontSize="sm" color="blue.700">• Surat Pernyataan Bermaterai bahwa Pemohon Tidak Pernah Dipidana</Text>
                            <Text fontSize="sm" color="blue.700">
                              • Bukti Pembayaran Surat Keterangan (Rp10.000)
                              <Text as="span" fontStyle="italic" color="blue.600" display="block" ml={2}>
                                *Untuk Bukti Pembayaran bisa dikirim ke nomor rekening BRI XXX-XXX-XXX
                              </Text>
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  )}

                  {/* Navigation Buttons */}
                  <Flex justify="space-between" mt={8}>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      isDisabled={currentStep === 0}
                      leftIcon={<Icon as={FaEye} />}
                    >
                      Sebelumnya
                    </Button>
                    
                    {currentStep < 2 ? (
                      <Button
                        colorScheme="blue"
                        onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
                        rightIcon={<Icon as={FaEye} />}
                      >
                        Selanjutnya
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        colorScheme="green"
                        size="lg"
                        leftIcon={<Icon as={FaCheckCircle} />}
                        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                        transition="all 0.2s"
                      >
                        Kirim Pengajuan (Demo)
                      </Button>
                    )}
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <StatusDisplay status={demoStatus} />
          )}
        </VStack>
      </Box>
    </Box>
  );
};

// Enhanced Status Display Component
const StatusDisplay = ({ status }) => {
  const getStatusInfo = () => {
    if (status === 'approved') {
      return {
        title: "Pengajuan Disetujui! 🎉",
        description: "Selamat! Pengajuan surat keterangan Anda telah disetujui oleh admin.",
        color: "green",
        icon: FaCheckCircle,
        bgGradient: "linear(to-r, green.400, emerald.500)",
      };
    } else if (status === 'rejected') {
      return {
        title: "Pengajuan Ditolak ❌",
        description: "Maaf, pengajuan Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.",
        color: "red",
        icon: FaTimesCircle,
        bgGradient: "linear(to-r, red.400, pink.500)",
      };
    } else {
      return {
        title: "Menunggu Verifikasi ⏳",
        description: "Pengajuan Anda sedang dalam proses verifikasi oleh admin.",
        color: "orange",
        icon: FaClock,
        bgGradient: "linear(to-r, orange.400, yellow.500)",
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <VStack spacing={6} align="stretch">
      <Card 
        bg="white" 
        shadow="2xl" 
        borderRadius="2xl" 
        overflow="hidden"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="6px"
          bgGradient={statusInfo.bgGradient}
        />
        <CardBody p={8}>
          <VStack spacing={6}>
            <Flex
              align="center"
              justify="center"
              w={20}
              h={20}
              borderRadius="full"
              bgGradient={statusInfo.bgGradient}
              color="white"
              shadow="lg"
            >
              <Icon as={statusInfo.icon} boxSize={10} />
            </Flex>
            
            <VStack spacing={3} textAlign="center">
              <Heading size="xl" color="gray.800">
                {statusInfo.title}
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="md">
                {statusInfo.description}
              </Text>
            </VStack>

            {/* Tampilkan alasan penolakan untuk demo rejected status */}
            {status === 'rejected' && (
              <Box
                w="full"
                p={4}
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="lg"
              >
                <Text fontSize="sm" fontWeight="semibold" color="red.800" mb={2}>
                  Alasan Penolakan:
                </Text>
                <Text fontSize="sm" color="red.700" whiteSpace="pre-wrap">
                  Dokumen tidak lengkap. Harap melengkapi berkas KTP dan SKCK yang masih berlaku serta pastikan foto yang diupload jelas dan tidak buram.
                </Text>
              </Box>
            )}

            {status === 'approved' && (
              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={FaDownload} />}
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
                bgGradient="linear(to-r, green.500, emerald.600)"
              >
                Unduh Surat Keterangan (Demo)
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Demo Documents */}
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        <Card bg="white" shadow="lg" borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={4}>
              <Icon as={FaFilePdf} boxSize={8} color="red.500" />
              <Heading size="md" color="gray.800">Berkas Pendukung</Heading>
              <Button colorScheme="blue" variant="outline" leftIcon={<Icon as={FaEye} />}>
                Lihat Berkas (Demo)
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" shadow="lg" borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={4}>
              <Box
                w={24}
                h={24}
                borderRadius="xl"
                overflow="hidden"
                shadow="md"
                border="3px solid"
                borderColor="blue.200"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaCamera} boxSize={8} color="gray.400" />
              </Box>
              <Heading size="md" color="gray.800">Foto Demo</Heading>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );
};

export default DemoUserDashboard;
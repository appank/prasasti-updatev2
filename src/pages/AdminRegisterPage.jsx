import { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Image,
  Heading,
  Alert,
  AlertIcon,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/bg.png'; // <─ gambar background admin
import logo from '../assets/Prasasti-logo.png'; // <─ logo admin

const AdminRegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, role: 'admin' },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      if (profileError) throw profileError;

      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      bgImage={`url(${bgImage})`}
      bgSize="cover"
      bgPos="center"
      position="relative"
    >
      {/* Overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.700" zIndex={0} />

      {/* Logo (sem position absolute) */}
      <Image
        src={logo}
        alt="Logo Prasasti PN CBI"
        height={{ base: '90px', md: '110px', lg: '130px' }}
        objectFit="contain"
        mb={{ base: 8, md: 10, lg: 12 }} // <- ini ngatur jarak bawah logo ke box
        zIndex={1}
      />

      {/* Box Login */}
      <Box
        position="relative"
        zIndex={1}
        p={10}
        maxW="sm"
        w="full"
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.08)"
        backdropFilter="blur(12px)"
        boxShadow="dark-lg"
        border="1px solid rgba(255,255,255,0.1)"
      >
        <VStack spacing={6} as="form" onSubmit={handleRegister}>
          <Heading color="white" fontSize="2xl">
            Create Admin Account
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {success && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Admin account created! Please check email for verification.
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel color="whiteAlpha.900">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="whiteAlpha.100"
              border={0}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              _focus={{ bg: 'whiteAlpha.200', boxShadow: '0 0 0 2px #9F7AEA' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="whiteAlpha.900">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="whiteAlpha.100"
              border={0}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              _focus={{ bg: 'whiteAlpha.200', boxShadow: '0 0 0 2px #9F7AEA' }}
            />
          </FormControl>

          <Button
            type="submit"
            isLoading={loading}
            colorScheme="purple"
            width="full"
            size="lg"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Register Admin
          </Button>

          <Text color="whiteAlpha.800" fontSize="sm">
            Already have an admin account?{' '}
            <ChakraLink as={Link} to="/admin/login" color="purple.300">
              Login here
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminRegisterPage;
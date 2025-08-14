import { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Image,
  Alert,
  AlertIcon,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from '../assets/bg.png';
import logo from '../assets/Prasasti-logo.png';

const VerifikatorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Check if user has verifikator role
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (user && user.role === 'verifikator') {
          navigate('/verifikator');
        } else {
          setError('Akses ditolak. Anda bukan verifikator.');
          await supabase.auth.signOut();
        }
      }
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

      {/* Logo */}
      <Image
        src={logo}
        alt="Logo Prasasti PN CBI"
        height={{ base: '90px', md: '110px', lg: '130px' }}
        objectFit="contain"
        mb={{ base: 8, md: 10, lg: 12 }}
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
        <VStack spacing={6} as="form" onSubmit={handleLogin}>
          <Heading color="white" fontSize="2xl">
            Verifikator Login
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
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
              _focus={{ bg: 'whiteAlpha.200', boxShadow: '0 0 0 2px #F56565' }}
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
              _focus={{ bg: 'whiteAlpha.200', boxShadow: '0 0 0 2px #F56565' }}
            />
          </FormControl>

          <Button
            type="submit"
            isLoading={loading}
            colorScheme="red"
            width="full"
            size="lg"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Login
          </Button>

          <Text color="whiteAlpha.800" fontSize="sm">
            Belum punya akun verifikator?{' '}
            <ChakraLink as={Link} to="/verifikator/register" color="red.300">
              Daftar di sini
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default VerifikatorLoginPage;
import React, { useState, useEffect, Image } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useToast,
} from '@chakra-ui/react';
import logo from '../assets/prasasti.png';

const DashboardTopbar = ({ logoutRedirect = '/login' }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        toast({
          title: 'Error',
          description: 'User not found.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(logoutRedirect);
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="100%"
      p={4}
      bg="white"
      boxShadow="sm"
    >
      <Box>
        <Box>
          <img
            src={logo}
            alt="Dashboard"
            style={{ height: 40 }}  // atur tinggi sesuai keinginan
          />
        </Box>
      </Box>
      <Flex align="center">
        <Text mr={4}>{user?.email}</Text>
        <Menu>
          <MenuButton as={Avatar} size="sm" cursor="pointer" />
          <MenuList>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default DashboardTopbar;

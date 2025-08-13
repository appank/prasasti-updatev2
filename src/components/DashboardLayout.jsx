
import { Stack, Badge, Box, Flex, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import { supabase } from "../supabaseClient";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      {/* Topbar */}
      {/* <Topbar /> */}
      {/* Konten halaman */}
      <Box flex="1" py={1}>
        {children}
      </Box>
      {/* <Box position="fixed" bottom="4" right="4">
        <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
      </Box> */}
    </Flex>
  );
};

export default DashboardLayout;

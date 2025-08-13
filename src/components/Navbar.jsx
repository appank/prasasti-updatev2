import { Flex, Image, Text, Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    };

    getSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsAdmin(false);
      } else {
        // Re-check role on auth change
        getSessionAndRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Flex
      className="navbar"
      align={"center"}
      justify={"space-between"}
      fontWeight={"bold"}
      p={"30px"}
      position={"fixed"}
      top={"0px"}
      w={"100%"}
      bg="white"
      zIndex={10}
      boxShadow="sm"
    >
      <Link to="/"><Text>Home</Text></Link>
      <Flex gap={"10px"} align={"center"}>
        {session ? (
          <Menu>
            <MenuButton as={Button} variant="ghost">
              <Image
                w={"35px"}
                h={"35px"}
                borderRadius={"50%"}
                src={session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`}
                referrerPolicy="no-referrer"
                alt="profile-picture"
              />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleDashboardClick}>Dashboard</MenuItem>
              <MenuItem as={Link} to="/surat-keterangan">Surat Keterangan</MenuItem>
              <MenuItem as={Link} to="/sertifikat">Sertifikat</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button as={Link} to="/login" colorScheme="teal">
            Login
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

export default Navbar;

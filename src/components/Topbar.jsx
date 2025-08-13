import {
  Flex,
  Button,
  Image,
  IconButton,
  Text,
  Stack,
  useBreakpointValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { FiAlignLeft } from "react-icons/fi";
import profileImg from "../assets/prasasti.png";
import { Link as ScrollLink } from "react-scroll";

const Topbar = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure(); // ⬅️ untuk buka/tutup drawer

  const navLinks = (direction = "column") => (
    <Stack direction={direction} spacing={6}>
      <ScrollLink
        to="home"
        smooth={true}
        duration={500}
        offset={-70}
        style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}
        onClick={onClose}
      >
        Home
      </ScrollLink>
      <ScrollLink
        to="about2"
        smooth={true}
        duration={500}
        offset={-70}
        style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}
        onClick={onClose}
      >
        About
      </ScrollLink>
      <ScrollLink
        to="services"
        smooth={true}
        duration={500}
        offset={-70}
        style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}
        onClick={onClose}
      >
        Services
      </ScrollLink>
      <ScrollLink
        to="portfolio"
        smooth={true}
        duration={500}
        offset={-70}
        style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}
        onClick={onClose}
      >
        Portfolio
      </ScrollLink>
      <ScrollLink
        to="paket"
        smooth={true}
        duration={500}
        offset={-70}
        style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}
        onClick={onClose}
      >
        Paket
      </ScrollLink>
    </Stack>
  );

  return (
    <>
      <Flex
        as="header"
        justify="space-between"
        align="center"
        //blur bg
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(5px)"
        
        boxShadow="sm"
        position="sticky"
        top={0}
        px={7}
        zIndex={10}
      >
         <Image
          src={profileImg}
          // kamu bisa atur ukuran di sini
          w={{ base: "120px", md: "180px" }}   // lebar lebih besar
          h="50px"
          paddingBlock={2}
          objectFit="contain"
          alt="logo"
        // mb={{ base: 6, md: 0 }}
        />
        {/* Brand */}
        {/* <Text fontSize="2xl" fontWeight="bold" color="blue.700">
          ARSIP
        </Text> */}

        {/* Navigation */}
        {isMobile ? (
           <IconButton
        icon={<FiAlignLeft size={24} />} // kamu bisa atur ukuran di sini
        variant="ghost"
        onClick={onOpen}
        aria-label="Open menu"
        display={{ base: "block", md: "none" }} // hanya tampil di mobile
      />
        ) : (
          navLinks("row")  // ⬅️ Di PC arah row
        )}
      </Flex>

      {/* Drawer untuk mobile */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Navigasi Cepat</DrawerHeader>
          <DrawerBody>
            {navLinks("column")} {/* ⬅️ Di mobile arah column */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Topbar;

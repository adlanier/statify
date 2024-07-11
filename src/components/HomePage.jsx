import React from 'react';
import { Flex, Heading, Text, Button, Box } from '@chakra-ui/react';


const HomePage = ({ setCurrentPage }) => (
    <Flex direction="column" align="center" h="100vh" color="white" overflowY="auto" p={[4, 6, 8]} bg="black">
      <Heading as="h1" mt={[4, 6, 8]} color="#1DB954" textAlign="center">Statify</Heading>
      <Text mt={[4, 6, 8]} fontSize={["md", "lg", "xl"]} textAlign="center" p={[4, 6, 8]}>
        Statify is a higher or lower guessing game where you guess if a random Spotify artist has a higher or lower amount of monthly listeners than the current Spotify artist.
      </Text>
      <Text mt={[4, 6, 8]} fontSize={["md", "lg", "xl"]} textAlign="center" p={[4, 6, 8]}>
        How high of a streak can you get?
      </Text>
      <Button mt={[4, 6, 8]} size="lg" colorScheme="spotifyGreen" onClick={() => setCurrentPage('game')}>Start Game</Button>
  
      <Box position="relative" bottom="-10" bg="gray" px="3" py="1" borderRadius="md" boxShadow="sm">
        <Text textAlign="center" fontSize="sm">
          Contact us: <a href="mailto:statify.lol@gmail.com">statify.lol@gmail.com</a>
        </Text>
      </Box>
    </Flex>
  );

  export default HomePage;

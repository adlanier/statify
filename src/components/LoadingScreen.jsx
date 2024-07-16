import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

const LoadingScreen = () => (
    <Flex direction="column" align="center" justify="center" h="100vh" bg="black" color="white">
      <Heading as="h1" color="#1DB954">Statify</Heading>
      <img src="/statify.png" alt="Spotify Logo" className="spin" style={{ width: '100px', marginTop: '20px' }} />
      <Text color="#1DB954" mt={8}>Grabbing a lot of artists...</Text>
    </Flex>
  );

export default LoadingScreen;

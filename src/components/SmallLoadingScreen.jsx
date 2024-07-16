import React from 'react';
import { Flex } from '@chakra-ui/react';

const SmallLoadingScreen = () => (
    <Flex direction="column" align="center" justify="center" h="100vh" bg="black" color="white">
      <img src="/statify.png" alt="Spotify Logo" className="spin" style={{ width: '100px', marginTop: '20px' }} />
    </Flex>
  );

export default SmallLoadingScreen;

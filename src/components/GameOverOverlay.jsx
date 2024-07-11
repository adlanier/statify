import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

const GameOverOverlay = ({ score, resetGame, handleBackToHome }) => (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.8)"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
      zIndex="10"
      overflowY="auto"
    >
      <Text fontSize={["2xl", "3xl", "4xl"]} mb={4}>Game Over!</Text>
      <Text fontSize={["xl", "2xl"]} mb={8}>Your Score: {score}</Text>
      <Button size="lg" colorScheme="whiteAlpha" onClick={resetGame} mb={4}>Play Again</Button>
      <Button size="lg" colorScheme="whiteAlpha" onClick={handleBackToHome}>Back to Home</Button>
    </Box>
  );

  export default GameOverOverlay;

import React from 'react';
import { Box } from '@chakra-ui/react';

const ScoreDisplay = ({ score }) => (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      bg="#1DB954"
      color="black"
      borderRadius="8px"
      p="12px 24px"
      fontSize={["1rem", "1.5rem"]}
      zIndex="10"
    >
      Score: {score}
    </Box>
  );

export default ScoreDisplay;

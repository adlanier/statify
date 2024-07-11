import React from 'react';
import { Box, Stack, Button } from '@chakra-ui/react';

const NextArtistBox = ({ artist, gameOver, handleGuess }) => (
    <Box
      h={["auto", "100%"]}
      w={["100%", "50%"]}
      textAlign="center"
      p={[4, 6, 8]}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '10px',
        margin: '10px'
      }}
    >
      <div
        style={{
          backgroundImage: `url(${artist.artistImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          borderRadius: '10px'
        }}
      />
      <div
        style={{
          position: 'relative',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          fontSize: ['1rem', '1.5rem', '2.2rem'],
        }}
      >
        {gameOver ? null : (
          <div>
            <div style={{ textAlign: 'center' }}>Does <br /> <Box as="b" fontSize={["2rem", "2.5rem", "3rem"]}>{artist.artistName}</Box> <br /> have a higher or lower amount of monthly listeners?</div>
            <div style={{ marginTop: '20px' }}>
              <Stack spacing={4} direction={["column", "row"]} justify="center" mt={4}>
                <Button
                  size="lg"
                  colorScheme="whiteAlpha"
                  onClick={() => handleGuess(true)}
                  _hover={{ bg: "#1DB954.400", color: "white" }}
                >
                  Higher &#128200;
                </Button>
                <Button
                  size="lg"
                  colorScheme="whiteAlpha"
                  onClick={() => handleGuess(false)}
                  _hover={{ bg: "#1DB954.400", color: "white" }}
                >
                  Lower &#128201;
                </Button>
              </Stack>
            </div>
          </div>
        )}
      </div>
    </Box>
  );

export default NextArtistBox;

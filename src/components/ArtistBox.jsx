import React from 'react';
import { Box } from '@chakra-ui/react';

const ArtistBox = ({ artist }) => {
    if (!artist) {
      return null;
    }
  
    return (
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
          <Box as="b" fontSize={["2rem", "2.5rem", "3rem"]}>{artist.artistName}</Box>
          <br />
          has 
          <br />
          <Box as="b" fontSize={["2rem", "2.5rem", "3rem"]}>{artist.monthlyListeners}</Box>
          <br />
           monthly listeners
        </div>
      </Box>
    );
  };

export default ArtistBox;
import { Box, Button, ChakraProvider, Flex, Heading, Text, Stack } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';


const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const PLAYLIST_ID = '37i9dQZEVXbLRQDuF5jeBp';

function App() {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true); // Track the initial mount 

    useEffect(() => {
    if (isInitialMount.current) {
      fetchPlaylistTracks();
      isInitialMount.current = false; // Set to false after the first mount
    }
  }, []);

  const fetchAccessToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
    });
    return response.data.access_token;
  };

  const fetchPlaylistTracks = async () => {
    try {
      const accessToken = await fetchAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      let fetchedTracks = response.data.items.map(item => ({
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.name).join(', '),
        popularity: item.track.popularity,
        cover: item.track.album.images[0].url // Assuming the first image is the cover
      }));
      setTracks(shuffleArray(fetchedTracks));
      setLoading(false);
      setCurrentIndex(0); // Set currentIndex to 0 after tracks are fetched
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  };

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleGuess = (guessHigher) => {
    if (!tracks.length || currentIndex >= tracks.length - 1) {
      setGameOver(true);
      return;
    }

    const currentTrack = tracks[currentIndex];
    const nextTrack = tracks[currentIndex + 1];

    const isCorrect = (guessHigher && nextTrack.popularity > currentTrack.popularity) ||
      (!guessHigher && nextTrack.popularity < currentTrack.popularity);

    if (isCorrect) {
      setScore(score + 1);
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  if (loading) return <Box textAlign="center" m="20">Loading...</Box>;

  const currentTrack = tracks[currentIndex];
  const nextTrack = tracks[currentIndex + 1] || {}; // Fallback for when reaching the end of the array

const resetGame = () => {
  setTracks(shuffleArray([...tracks])); // Shuffle tracks again
  setScore(0);
  setCurrentIndex(0);
  setGameOver(false);
};


return (
  <ChakraProvider>
    <Flex direction="column" align="center" h="100vh" bg="black">
      <Heading as="h1" color="green" textAlign="center" fontFamily="Proxima Nova">Statify</Heading>

      <Flex justify="center" align="center" h="100vh" w="100%" className="App" p={5}>
        {/* Box for current track */}
        <Box
          h="100%" 
          w="100%" 
          textAlign="center" 
          p={5}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '10px',
            margin: '10px'
          }}
        >
          {/* Background image with filter */}
          <div
            style={{
              backgroundImage: `url(${currentTrack.cover})`,
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
          {/* Text content */}
          <div
            style={{
              position: 'relative',
              top: 100,
              zIndex: 2,
              color: 'white',
              textAlign: 'center',
              padding: '20px',
              fontSize: '2.2rem',
            }}
            fontFamily="Proxima Nova"
          >
            <b>{currentTrack.name}</b> by <b>{currentTrack.artists}</b>
            <br />
            has a popularity score of {currentTrack.popularity}
          </div>
        </Box>

        {/* VS circle */}
        {!gameOver && (
            <div
              style={{
                position: 'absolute',
                background: 'green',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'black',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                zIndex: 20,
fontFamily: 'Proxima Nova'
              }}
              fontFamily="Proxima Nova"
            >
              VS
            </div>
          )}

        {/* Box for next track */}
        <Box
          h="100%" 
          w="100%" 
          textAlign="center"
          p={5}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '10px',
            margin: '10px'
          }}
        >
          {/* Background image with filter */}
          <div
            style={{
              backgroundImage: `url(${nextTrack.cover})`,
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
          {/* Text content */}
          <div
            style={{
              position: 'relative',
              top: 100,
              zIndex: 2,
              color: 'white',
              textAlign: 'center',
              padding: '20px',
              fontSize: '2.2rem',
              fontFamily: 'Proxima Nova'
            }}
          >
            {gameOver ? null : (
              <div>
                <div style={{ textAlign: 'center' }}><b>Does "{nextTrack.name}"</b> by <b>{nextTrack.artists}</b></div>
                <div style={{ textAlign: 'center' }}>have a higher or lower popularity score?</div>
                <div style={{ marginTop: '20px' }}>
                <Stack spacing={4} direction="row" justify="center" mt={4}>
                    <Button
                      size="lg"
                      colorScheme="whiteAlpha"
                      onClick={() => handleGuess(true)}
                      _hover={{ bg: "green.400", color: "white" }}
                    >
                      Higher &#128200;
                    </Button>
                    <Button
                      size="lg"
                      colorScheme="whiteAlpha"
                      onClick={() => handleGuess(false)}
                      _hover={{ bg: "green.400", color: "white" }}
                    >
                      Lower &#128201;
                    </Button>
                  </Stack>
                </div>
              </div>
            )}
          </div>
        </Box>
      </Flex>

     {/* Score Display */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'green',
          color: 'black',
          borderRadius: '8px',
          padding: '12px 24px',  // Increased padding for larger size
          fontSize: '1.5rem',    // Increased font size for larger size
          zIndex: 10,
          fontFamily: 'Proxima Nova'
        }}
      >
        Score: {score}
      </div>

      

      {gameOver && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.8)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          color="white"
          zIndex="10"
          fontFamily="Proxima Nova"
        >
          <Text fontSize="4xl" mb={4}>Game Over!</Text>
          <Text fontSize="2xl" mb={8}>Your Score: {score}</Text>
          <Button size="lg" colorScheme="whiteAlpha" onClick={resetGame}>Play Again</Button>
          </Box>
      )}
    </Flex>
  </ChakraProvider>
);
}


export default App;



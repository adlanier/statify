import { Box, Button, ChakraProvider, Flex, Heading, Text } from '@chakra-ui/react';
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


return (
    <ChakraProvider>
      <Heading as="h1" textAlign="center">Statify</Heading>

      <Flex justify="space-between" align="center" h="100vh" className="App" p={5} position="relative">
        {/* Box for current track */}
        <Box 
          h="100%" 
          w="50%" 
          textAlign="center" 
          p={5} 
          style={{ 
            position: 'relative', // Ensure relative positioning for nested elements
            overflow: 'hidden', // Optional: Ensure no overflow of content
            borderRadius: '10px' // Optional: Rounded corners
          }}
        >
          {/* Background image with filter */}
          <div 
            style={{ 
              backgroundImage: `url(${currentTrack.cover})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              filter: 'brightness(0.55)', // Adjust brightness as needed
              width: '100%', 
              height: '100%',
              position: 'absolute', 
              top: 0, 
              left: 0,
              zIndex: 1, // Ensure background is behind text
              borderRadius: '10px' // Optional: Rounded corners
            }}
          />
          
          {/* Text content */}
          <div 
            style={{ 
              position: 'relative', // Ensure relative positioning for nested elements
              zIndex: 2, // Ensure text is above background
              color: 'white', // Text color
              textAlign: 'center', // Center text
              padding: '20px', // Padding around text
              fontSize: '2.2rem', // Adjust font size as needed
            }}
          >
            <b>{currentTrack.name}</b> by <b>{currentTrack.artists}</b>
            <br />
            has a popularity score of {currentTrack.popularity}
          </div>
        </Box>

        {/* Box for next track */}
        <Box 
          h="100%" 
          w="50%" 
          textAlign="center" 
          p={5} 
          style={{ 
            position: 'relative', // Ensure relative positioning for nested elements
            overflow: 'hidden', // Optional: Ensure no overflow of content
            borderRadius: '10px' // Optional: Rounded corners
          }}
        >
          {/* Background image with filter */}
          <div 
            style={{ 
              backgroundImage: `url(${nextTrack.cover})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              filter: 'brightness(0.55)', // Adjust brightness as needed
              width: '100%', 
              height: '100%',
              position: 'absolute', 
              top: 0, 
              left: 0,
              zIndex: 1, // Ensure background is behind text
              borderRadius: '10px' // Optional: Rounded corners
            }}
          />
          
          {/* Text content */}
          <div 
            style={{ 
              position: 'relative', // Ensure relative positioning for nested elements
              zIndex: 2, // Ensure text is above background
              color: 'white', // Text color
              textAlign: 'center', // Center text
              padding: '20px', // Padding around text
              fontSize: '2.2rem', // Adjust font size as needed
            }}
          >
            {gameOver ? (
              <div>
                Game Over! Your score: {score}
                <Button size="lg" colorScheme="white" ml={4} onClick={() => window.location.reload()}>Play Again</Button>
              </div>
            ) : (
              <div>
                Does "<b>{nextTrack.name}</b> by <b>{nextTrack.artists}</b>" have a higher or lower popularity score?
                <div style={{ marginTop: '20px' }}>
                  <Button size="xlg" colorScheme="white" onClick={() => handleGuess(true)}>Higher &#128200;</Button>
                  <Button size="xlg" colorScheme="white" ml={24} onClick={() => handleGuess(false)}>Lower &#128201;</Button>
                </div>
              </div>
            )}
          </div>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default App;
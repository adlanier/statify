import { Box, Button, ChakraProvider, Flex, Heading, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const PLAYLIST_ID = '37i9dQZEVXbLRQDuF5jeBp';

function App() {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylistTracks();
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
  }

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
      <Flex justify="space-between" align="center" h="100vh" className="App" p={5}>
        <Box h="100%" w="50%" textAlign="center" p={5} style={{ backgroundImage: `url(${currentTrack.cover})`, backgroundSize: '100% 100%', filter: 'blur(3px)', backdropFilter: 'blur(10px)' }}>
          <Heading as="h1">Spotify Popularity Game</Heading>
          <Text fontSize="xl">{currentTrack.name} - {currentTrack.artists}</Text>
          <Text fontSize="lg">Popularity: {currentTrack.popularity}</Text>
        </Box>
        {!gameOver && (
          <Box h="100%" w="50%" textAlign="center" p={5} style={{ backgroundImage: `url(${nextTrack.cover})`, backgroundSize: '100% 100%', filter: 'blur(3px)', backdropFilter: 'blur(10px)' }}>
            <Text fontSize="xl">{nextTrack.name} - {nextTrack.artists}</Text>
          </Box>
        )}
      </Flex>
      <Flex justify="center" position="absolute" left="0" right="0" bottom="20px">
        {gameOver ? (
          <>
            <Heading as="h2">Game Over! Your score: {score}</Heading>
            <Button colorScheme="blue" onClick={() => window.location.reload()}>Play Again</Button>
          </>
        ) : (
          <>
            <Button colorScheme="blue" mr={4} onClick={() => handleGuess(true)}>Higher</Button>
            <Button colorScheme="blue" onClick={() => handleGuess(false)}>Lower</Button>
          </>
        )}
      </Flex>
    </ChakraProvider>
  );
}

export default App;
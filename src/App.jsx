import { Box, Button, ChakraProvider, Flex, Heading, Text, Stack } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const PLAYLIST_ID = '37i9dQZEVXbLRQDuF5jeBp';

function App() {
  const [artists, setArtists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Fetching playlist tracks...');
      fetchPlaylistTracks();
      isInitialMount.current = false;
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
    console.log('Access token fetched:', response.data.access_token);
    return response.data.access_token;
  };

  const fetchArtistDetails = async (artistIds, accessToken) => {
    const artistDetails = [];
    for (const artistId of artistIds) {
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      artistDetails.push(response.data);
    }
    return artistDetails;
  };

  const fetchPlaylistTracks = async () => {
    try {
        const accessToken = await fetchAccessToken();
        console.log('Access token:', accessToken);
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        let fetchedArtists = response.data.items.map(item => ({
            artistId: item.track.artists[0].id,
            artistName: item.track.artists[0].name,
        }));

        console.log('Artists fetched from Spotify:', fetchedArtists);

        // Remove duplicate artists
        fetchedArtists = fetchedArtists.filter((artist, index, self) =>
            index === self.findIndex((a) => a.artistId === artist.artistId)
        );

        // Fetch additional details (including images) for each artist
        const artistIds = fetchedArtists.map(artist => artist.artistId);
        const artistDetails = await fetchArtistDetails(artistIds, accessToken);

        // Fetch monthly listeners for each artist
        const artistListenersData = await fetchMonthlyListeners(artistIds);

        console.log('Monthly listeners data:', artistListenersData);

        // Add monthly listeners and image URL to fetched artists
        fetchedArtists = fetchedArtists.map(artist => {
            const artistDetail = artistDetails.find(detail => detail.id === artist.artistId);
            const artistData = artistListenersData.find(data => data.url.includes(artist.artistId));
            return {
                ...artist,
                artistImage: artistDetail.images[0] ? artistDetail.images[0].url : 'https://via.placeholder.com/300',
                monthlyListeners: artistData ? artistData.monthly_listeners.replace(' .', '') : 'N/A' // This line removes the trailing dots
            };
        });

        console.log('Artists with monthly listeners:', fetchedArtists);

        setArtists(shuffleArray(fetchedArtists));
        setLoading(false);
        setCurrentIndex(0);
    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
    }
};


  const fetchMonthlyListeners = async (artistIds) => {
    try {
      console.log('Fetching monthly listeners for artist IDs:', artistIds);
      const urls = artistIds.map(id => `https://open.spotify.com/artist/${id}`);
      const response = await axios.post('http://127.0.0.1:5000/api/artists', { urls });
      console.log('Monthly listeners response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly listeners:', error);
      return [];
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
    if (!artists.length || currentIndex >= artists.length - 1) {
      setGameOver(true);
      return;
    }

    const currentArtist = artists[currentIndex];
    const nextArtist = artists[currentIndex + 1];

    const isCorrect = (guessHigher && nextArtist.monthlyListeners > currentArtist.monthlyListeners) ||
      (!guessHigher && nextArtist.monthlyListeners < currentArtist.monthlyListeners);

    if (isCorrect) {
      setScore(score + 1);
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  if (loading) return <Box textAlign="center" m="20">Loading...</Box>;

  const currentArtist = artists[currentIndex];
  const nextArtist = artists[currentIndex + 1] || {};

  const resetGame = () => {
    setArtists(shuffleArray([...artists]));
    setScore(0);
    setCurrentIndex(0);
    setGameOver(false);
  };

  return (
    <ChakraProvider>
      <Flex direction="column" align="center" h="100vh" bg="black">
        <Heading as="h1" color="green" textAlign="center" fontFamily="Proxima Nova" mt={6}>Statify</Heading>

        <Flex justify="center" align="center" h="100vh" w="100%" className="App" p={5}>
          {/* Box for current artist */}
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
                backgroundImage: `url(${currentArtist.artistImage})`,
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
              <b>{currentArtist.artistName}</b>
              <br />
              has <b>{currentArtist.monthlyListeners}</b> monthly listeners
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

          {/* Box for next artist */}
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
                backgroundImage: `url(${nextArtist.artistImage})`,
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
                  <div style={{ textAlign: 'center' }}><b>Does "{nextArtist.artistName}"</b> have a higher or lower amount of monthly listeners?</div>
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




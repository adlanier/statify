import { Box, Button, ChakraProvider, Flex, Heading, Text, Stack, Progress } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const PLAYLIST_ID = '1B01wTbtbkpFF4mFbwqEmK';

function App() {
  const [artists, setArtists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Fetching playlist tracks...');
      fetchPlaylistTracks();
      isInitialMount.current = false;
    }
  }, []);

  const delay = ms => new Promise(res => setTimeout(res, ms)); 

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
    for (const [index, artistId] of artistIds.entries()) {
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      artistDetails.push(response.data);
      setLoadingProgress(Math.round(((index + 1) / artistIds.length) * 95)); 
      await delay(300); 
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

      fetchedArtists = fetchedArtists.filter((artist, index, self) =>
        index === self.findIndex((a) => a.artistId === artist.artistId)
      );

      const artistIds = fetchedArtists.map(artist => artist.artistId);
      const artistDetails = await fetchArtistDetails(artistIds, accessToken);

      const artistListenersData = await fetchMonthlyListeners(artistIds);

      console.log('Monthly listeners data:', artistListenersData);

      fetchedArtists = fetchedArtists.map(artist => {
        const artistDetail = artistDetails.find(detail => detail.id === artist.artistId);
        const artistData = artistListenersData.find(data => data.url.includes(artist.artistId));
        return {
          ...artist,
          artistImage: artistDetail.images[0] ? artistDetail.images[0].url : 'https://via.placeholder.com/300',
          monthlyListeners: artistData ? artistData.monthly_listeners.replace(' .', '') : 'N/A'
        };
      });

      console.log('Artists with monthly listeners:', fetchedArtists);

      setArtists(shuffleArray(fetchedArtists));
      setLoadingProgress(100); 
      await delay(500); 
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

  const parseMonthlyListeners = (value) => {
    if (value.endsWith('M')) {
      return parseFloat(value.slice(0, -1)) * 1e6;
    }
    if (value.endsWith('K')) {
      return parseFloat(value.slice(0, -1)) * 1e3;
    }
    return parseFloat(value);
  };
  
  const handleGuess = (guessHigher) => {
    if (!artists.length || currentIndex >= artists.length - 1) {
      setGameOver(true);
      return;
    }
  
    const currentArtist = artists[currentIndex];
    const nextArtist = artists[currentIndex + 1];
  
    const currentArtistListeners = parseMonthlyListeners(currentArtist.monthlyListeners);
    const nextArtistListeners = parseMonthlyListeners(nextArtist.monthlyListeners);
  
    const isCorrect = (guessHigher && nextArtistListeners > currentArtistListeners) ||
      (!guessHigher && nextArtistListeners < currentArtistListeners);
  
    if (isCorrect) {
      setScore(score + 1);
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  const resetGameState = () => {
    setArtists(shuffleArray([...artists]));
    setScore(0);
    setCurrentIndex(0);
    setGameOver(false);
  };

  const resetGame = () => {
    resetGameState();
  };

  const handleBackToHome = () => {
    resetGameState();
    setCurrentPage('home');
  };

  if (loading) return <LoadingScreen progress={loadingProgress} />;

  const currentArtist = artists[currentIndex];
  const nextArtist = artists[currentIndex + 1] || {};

  return (
    <ChakraProvider>
      {currentPage === 'home' ? (
        <HomePage setCurrentPage={setCurrentPage} />
      ) : (
        <GamePage
          currentArtist={currentArtist}
          nextArtist={nextArtist}
          score={score}
          gameOver={gameOver}
          handleGuess={handleGuess}
          resetGame={resetGame}
          handleBackToHome={handleBackToHome}
          setCurrentPage={setCurrentPage}
        />
      )}
    </ChakraProvider>
  );
}

const LoadingScreen = ({ progress }) => (
  <Flex direction="column" align="center" justify="center" h="100vh" bg="black" color="white">
    <Heading as="h1" color="green">Statify</Heading>
    <Progress colorScheme="green" size="lg" width="80%" value={progress} mt={8} />
    <Text color="green">Grabbing a lot of artists...</Text>
  </Flex>
);

const HomePage = ({ setCurrentPage }) => (
  <Flex direction="column" align="center" h="100vh" bg="black" color="white" overflowY="auto" p={[4, 6, 8]}>
    <Heading as="h1" mt={[4, 6, 8]} color="green" textAlign="center">Statify</Heading>
    <Text mt={[4, 6, 8]} fontSize={["md", "lg", "xl"]} textAlign="center" p={[4, 6, 8]}>
      Welcome to Statify! Statify is a higher or lower guessing game where you guess if a random Spotify artist has a higher or lower amount of monthly listeners than the current Spotify artist. 
    </Text>
    <Text mt={[4, 6, 8]} fontSize={["md", "lg", "xl"]} textAlign="center" p={[4, 6, 8]}>
      How high of a streak can you get?
    </Text>
    <Button mt={[4, 6, 8]} size="lg" colorScheme="green" onClick={() => setCurrentPage('game')}>Start Game</Button>
    <Text  mt={[4, 6, 8]}>
      Please report any bugs or concerns to adrianlanier33@gmail.com
    </Text>
  </Flex>
);

const GamePage = ({ currentArtist, nextArtist, score, gameOver, handleGuess, resetGame, handleBackToHome }) => (
  <Flex direction="column" align="center" h="100vh" bg="black" overflowY="auto" p={[4, 6, 8]}>
    <Heading as="h1" color="green" textAlign="center" fontFamily="Proxima Nova" mt={[4, 6, 8]}>Statify</Heading>

    <Flex direction={["column", "row"]} justify="center" align="center" flex="1" w="100%" className="App" p={[4, 6, 8]}>
      {/* Box for current artist */}
      <ArtistBox artist={currentArtist} />

      {!gameOver && (
        <VSBox />
      )}

      {/* Box for next artist */}
      <NextArtistBox artist={nextArtist} gameOver={gameOver} handleGuess={handleGuess} />
    </Flex>

    <ScoreDisplay score={score} />

    {gameOver && (
      <GameOverOverlay score={score} resetGame={resetGame} handleBackToHome={handleBackToHome} />
    )}
  </Flex>
);

const ArtistBox = ({ artist }) => (
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
        top: 100,
        zIndex: 2,
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        fontSize: '2.2rem',
        fontFamily: 'Proxima Nova'
      }}
    >
      <b>{artist.artistName}</b>
      <br />
      has <b>{artist.monthlyListeners}</b> monthly listeners
    </div>
  </Box>
);

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
          <div style={{ textAlign: 'center' }}><b>Does "{artist.artistName}"</b> have a higher or lower amount of monthly listeners?</div>
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
);

const VSBox = () => (
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
  >
    VS
  </div>
);

const ScoreDisplay = ({ score }) => (
  <div
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'green',
      color: 'black',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '1.5rem',
      zIndex: 10,
      fontFamily: 'Proxima Nova'
    }}
  >
    Score: {score}
  </div>
);

const GameOverOverlay = ({ score, resetGame, handleBackToHome }) => (
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
    overflowY="auto"
  >
    <Text fontSize={["2xl", "4xl"]} mb={4}>Game Over!</Text>
    <Text fontSize={["xl", "2xl"]} mb={8}>Your Score: {score}</Text>
    <Button size="lg" colorScheme="whiteAlpha" onClick={resetGame} mb={4}>Play Again</Button>
    <Button size="lg" colorScheme="whiteAlpha" onClick={handleBackToHome}>Back to Home</Button>
  </Box>
);

export default App;

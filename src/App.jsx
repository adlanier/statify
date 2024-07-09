import { Box, Button, ChakraProvider, Flex, Heading, Text, Stack, Progress } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import './App.css';

const BATCH_SIZE = 3; // Initial number of artists to load

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const OG_ARTIST_IDS = [
  '6eUKZXaKkcviH0Ku9w2n3V', '3TVXtAsR1Inumwj472S9r4', '246dkjvS1zLTtiykXe5h60', 
  '2YZyLoL8N0Wb9xBt1NhZWg','06HL4z0CvFAxyc27GXpf02','6qqNVTkY8uBg9cP3Jd7DAH',
  '66CXWjxzNUsdJxJ2JdwvnR', '06HL4z0CvFAxyc27GXpf02',
  '1uNFoZAHBGtllmzznpCI3s', '6qqNVTkY8uBg9cP3Jd7DAH', '1Xyo4u8uXC1ZmMpatF05PJ',
  '6M2wZ9GZgrQXHCFfjv46we', '4q3ewBCX7sLwd24euuV69X', '1vyhD5VmyZ7KMfW5gqLgo5', '7n2wHs1TKAczGzO7Dd2rGr',
  '0du5cEVh5yTK9QJze8zA0C', '4kYSro6naA4h99UJvo89HB', '5K4W6rqBFWDnAN6FQUkS6x', '5pKCCKE2ajJHZ9KAiaK11H',
  '1HY2Jd0NmPuamShAr6KMms', '04gDigrS5kc9YWfZHwBETP', '6LuN9FCkKOj5PcnpouEgny', '53XhwfbYqKCa1cC15pYq2q',
  '7dGJo4pcD2V6oG8kP0tJRR', '0C8ZW7ezQVs4URX5aX7Kqx', '26VFTg2z8YR0cCuwLzESi2', '4nDoRrQiYLoBzwC5BhVJzF',
  '5cj0lLjcoR7YOSnhnX0Po5', '5WUlDfRSoLAfcVSX1WnrxN', '56ZTgzPBDge0OvCGgMO3OY', '6KImCVD70vtIoJWnq6nGn3',
  '6S2OmqARrzebs0tKUEyXyp', '0Y5tJX1MQlPlqiwlOH1tJY', '1RyvyyTE3xzB2ZywiAwp0i', '7jVv8c5Fj3E9VhNjxT4snq',
  '55Aa2cqylxrFIXC767Z865', '7bXgB6jMjp9ATFy66eO08Z', '1URnnhqYAYcrqrcwql10ft', '0hCNtLu0JehylgoiP8L4Gh',
  '6vWDO969PvNqNYHIOW5v0m', '6jJ0s89eD6GaHleKKya26X', '4dpARuHxo51G3z768sgnrY', '3Nrfpe0tUJi4K4DXYWgMUX',
  '41MozSoPIsD1dJM0CLPjZF', '00FQb4jTyendYWaN8pK0wa', '0EmeFodog0BfCgMzAIvKQp', '5YGY8feqx7naU7z4HrwZM6',
   '4VhL8KLjVso4vLfOLVViTb', '4NHQUGzhtTLFvgF5SZesLK', '1dfeR4HaWDbWqFHLkxsg1d','2cnMpRsOVqtPMfq7YiFE6K','0ECwFtbIWEVNwjlrfc6xoL','6DCIj8jNaNpBz8e5oKFPtp','5NGO30tJxFlKixkPSgXcFE','0rvjqX7ttXeg3mTy8Xscbt','6PfSUFtkMVoDkx4MQkzOi3','3gd8FJtBJtkRxdfbTu19U2','3bYcjbVAN3rAuU3TMzw2mB','16oZKvXb6WkQlVAjwo2Wbg','79hrYiudVcFyyxyJW0ipTy','3mIj9lX2MWuHmhNCA7LSCW','7GlBOeep6PqTfFi59PTUUN','2RQXRUsr4IW1f3mKyKsy4B','1eEfMU2AhEo7XnKgL7c304','1QAJqy2dA3ihHBFIHRphZj','26T3LtbuGT1Fu9m0eRq5X3','77tT1kLj6mCWtFNqiOmP9H','34EP7KEpOjXcM2TCat1ISk','3Rq3YOF9YG9YfCWD4D56RZ','4V8LLVI7PbaPR0K2TGSxFF'
];
let ARTIST_IDS = [...OG_ARTIST_IDS];



function App() {

  const [artists, setArtists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [seenArtists, setSeenArtists] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);
  const [loadedIn, setLoadedIn] = useState(false);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Fetching artist details...');
      fetchInitialArtists();
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
    return response.data.access_token;
  };

  const fetchInitialArtists = async () => {
    await fetchRandomArtists(BATCH_SIZE);
    setLoadedIn(true);
    setCurrentIndex(0);
  };
  
  const fetchRandomArtists = async (count) => {
    try {
      const accessToken = await fetchAccessToken();
      let artistDetails = [];
      let newSeenArtists = new Set(seenArtists);
  
      while (artistDetails.length < count) {
        let remainingArtists = ARTIST_IDS.filter(artistId => !newSeenArtists.has(artistId));
  
        if (remainingArtists.length === 0) {
          console.log("Replenish artists...");
          newSeenArtists = new Set();  // Clear seen artists
          ARTIST_IDS = [...OG_ARTIST_IDS];
          shuffleArray(ARTIST_IDS);
          remainingArtists = ARTIST_IDS;
        }
  
        const randomIndex = Math.floor(Math.random() * remainingArtists.length);
        const artistId = remainingArtists[randomIndex];
  
        if (!artistId) break;
  
        const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'id,name,images'
          }
        });
  
        artistDetails.push(response.data);
        newSeenArtists.add(artistId);
        ARTIST_IDS.splice(ARTIST_IDS.indexOf(artistId), 1);
      }
  
      const artistListenersData = await fetchMonthlyListeners(artistDetails.map(artist => artist.id));
  
      const fetchedArtists = artistDetails.map((artistDetail) => {
        const artistData = artistListenersData.find(data => data.url.includes(artistDetail.id));
        return {
          artistId: artistDetail.id,
          artistName: artistDetail.name,
          artistImage: artistDetail.images[0] ? `${artistDetail.images[0].url}?w=300&h=300&fit=scale` : 'https://via.placeholder.com/300',
          monthlyListeners: artistData ? artistData.monthly_listeners.replace(' .', '') : 'N/A'
        };
      });
  
      setSeenArtists(newSeenArtists);
      setArtists(prevArtists => {
        const updatedArtists = [...prevArtists, ...shuffleArray(fetchedArtists)];
        return updatedArtists;
      });
    } catch (error) {
      console.error('Error fetching artist details:', error.response?.data || error.message);
    }
  };
  
const fetchMonthlyListeners = async (artistIds) => {
  console.log(artistIds);
  try {
      console.log('Fetching monthly listeners for artist IDs:', artistIds);
      const batchSize = 10;  
      let allResults = [];

      for (let i = 0; i < artistIds.length; i += batchSize) {
          const batch = artistIds.slice(i, i + batchSize);
          const urls = batch.map(id => `https://open.spotify.com/artist/${id}`);
          const response = await axios.post('https://statify-flask.vercel.app/api/artists', { urls }, {
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          allResults = [...allResults, ...response.data];
      }

      console.log('Monthly listeners response:', allResults);
      return allResults;
  } catch (error) {
      console.error('Error fetching monthly listeners:', error);
      return [];
  }
};

const shuffleArray = (array) => {
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
  
  const handleGuess = async (guessHigher) => {
    if (!artists.length || currentIndex >= artists.length - 1) {
      setGameOver(true);
      return;
    }
  
    const currentArtist = artists[currentIndex];
    const nextArtist = artists[currentIndex + 1];
  
    const currentArtistListeners = parseMonthlyListeners(currentArtist.monthlyListeners);
    const nextArtistListeners = parseMonthlyListeners(nextArtist.monthlyListeners);
  
    const isCorrect = (guessHigher && nextArtistListeners > currentArtistListeners) ||
      (!guessHigher && nextArtistListeners < currentArtistListeners) ||
      (currentArtistListeners === nextArtistListeners); // Treat equality as correct guess
  
    if (isCorrect) {
      setScore(score + 1);
      setCurrentIndex(currentIndex + 1);
      if (artists.length - currentIndex <= 3) {
        await fetchRandomArtists(4);  // Load four more random artists
      }
    } else {
      setGameOver(true);
    }
  };
  

  const handleBackToHome = () => {
    setCurrentPage('home');
    fetchInitialArtists();
  };

  
  const resetGameState = () => {
    setArtists([]);
    setScore(0);
    setCurrentIndex(-1);
    setGameOver(false);
    setSeenArtists(new Set());  // Clear seen artists
    ARTIST_IDS = [...OG_ARTIST_IDS];
    shuffleArray(ARTIST_IDS);  // Reshuffle artist IDs
  };
  
  const resetGame = async () => {
    setIsLoading(true);
    resetGameState();
    await fetchInitialArtists();
    setIsLoading(false);
  };
  
  

  if (!loadedIn) return <LoadingScreen />; 
  if (isLoading) return <SmallLoadingScreen />;

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

const LoadingScreen = () => (
  <Flex direction="column" align="center" justify="center" h="100vh" bg="black" color="white">
    <Heading as="h1" color="#1DB954">Statify</Heading>
    <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify Logo" className="spin" style={{ width: '100px', marginTop: '20px' }} />
    <Text color="#1DB954" mt={8}>Grabbing a lot of artists...</Text>
  </Flex>
);

const SmallLoadingScreen = () => (
  <Flex direction="column" align="center" justify="center" h="100vh" bg="black" color="white">
    <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify Logo" className="spin" style={{ width: '100px', marginTop: '20px' }} />
  </Flex>
);





const HomePage = ({ setCurrentPage }) => (
  <Flex direction="column" align="center" h="100vh" bg="black" color="white" overflowY="auto" p={[4, 6, 8]}>
    <Heading as="h1" mt={[4, 6, 8]} color="#1DB954" textAlign="center">Statify</Heading>
    <Text mt={[4, 6, 8]} fontSize={["md", "lg", "xl"]} textAlign="center" p={[4, 6, 8]}>
      Welcome to Statify! Statify is a higher or lower guessing game where you guess if a random Spotify artist has a higher or lower amount of monthly listeners than the current Spotify artist. 
    </Text>
    <Text mt={[4, 6, 8]} fontSize={["md", "lg", "xl"]} textAlign="center" p={[4, 6, 8]}>
      How high of a streak can you get?
    </Text>
    <Button mt={[4, 6, 8]} size="lg" colorScheme="green" onClick={() => setCurrentPage('game')}>Start Game</Button>
    <Text mt={[4, 6, 8]}>
      Please report any bugs or concerns to adrianlanier33@gmail.com
    </Text>
  </Flex>
);


const GamePage = ({ currentArtist, nextArtist, score, gameOver, handleGuess, resetGame, handleBackToHome }) => (
  <Flex direction="column" align="center" h="100vh" bg="black" overflowY="auto" p={[4, 6, 8]}>
    <Heading as="h1" color="#1DB954" textAlign="center" fontFamily="Proxima Nova" mt={[4, 6, 8]}>Statify</Heading>

    <Flex direction={["column", "row"]} justify="center" align="center" flex="1" w="100%" className="App" p={[4, 6, 8]}>
      {currentArtist && <ArtistBox artist={currentArtist} />}
      {!gameOver && <VSBox />}
      {nextArtist && <NextArtistBox artist={nextArtist} gameOver={gameOver} handleGuess={handleGuess} />}
    </Flex>

    <ScoreDisplay score={score} />

    {gameOver && (
      <GameOverOverlay score={score} resetGame={resetGame} handleBackToHome={handleBackToHome} />
    )}
  </Flex>
);




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
          fontFamily: 'Proxima Nova'
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
        fontFamily: 'Proxima Nova'
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




const VSBox = () => (
  <Box
    position="absolute"
    bg="#1DB954"
    top={["80%", "50%"]}
    left="50%"
    transform="translate(-50%, -50%)"
    color="black"
    borderRadius="50%"
    w={["60px", "80px"]}
    h={["60px", "80px"]}
    display="flex"
    justifyContent="center"
    alignItems="center"
    fontSize={["1rem", "1.5rem"]}
    fontWeight="bold"
    zIndex="20"
    fontFamily="Proxima Nova"
  >
    VS
  </Box>
);



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
    fontFamily="Proxima Nova"
  >
    Score: {score}
  </Box>
);



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
    fontFamily="Proxima Nova"
    overflowY="auto"
  >
    <Text fontSize={["2xl", "3xl", "4xl"]} mb={4}>Game Over!</Text>
    <Text fontSize={["xl", "2xl"]} mb={8}>Your Score: {score}</Text>
    <Button size="lg" colorScheme="whiteAlpha" onClick={resetGame} mb={4}>Play Again</Button>
    <Button size="lg" colorScheme="whiteAlpha" onClick={handleBackToHome}>Back to Home</Button>
  </Box>
);




export default App;

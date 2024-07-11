import { Box, Button, ChakraProvider, Flex, Heading, Text, Stack, Progress } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import './App.css';
import theme from './theme';
import { OG_ARTIST_IDS } from './ArtistIDs';


import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import LoadingScreen from './components/LoadingScreen';
import SmallLoadingScreen from './components/SmallLoadingScreen';




const BATCH_SIZE = 3; // Initial number of artists to load

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
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
  const [preFetchedBatch, setPreFetchedBatch] = useState([]);


  useEffect(() => {
    if (isInitialMount.current) {
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
  
  const fetchRandomArtists = async (count,preFetch = false) => {
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

      // Preload images
      preloadImages(fetchedArtists.map(artist => artist.artistImage));
  
      setSeenArtists(newSeenArtists);
      
      if (preFetch) {
        setPreFetchedBatch(fetchedArtists);
      } else {
        setArtists(prevArtists => {
          const updatedArtists = [...prevArtists, ...shuffleArray(fetchedArtists)];
          return updatedArtists;
        });
      }
    } catch (error) {
      console.error('Error fetching artist details:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (loadedIn && artists.length > 0 && preFetchedBatch.length === 0) {
      fetchRandomArtists(BATCH_SIZE, true);  // Pre-fetch the next batch
    }
  }, [artists, loadedIn]);
  
const fetchMonthlyListeners = async (artistIds) => {
  //console.log(artistIds);
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
        if (preFetchedBatch.length > 0) {
          setArtists(prevArtists => [...prevArtists, ...preFetchedBatch]);
          setPreFetchedBatch([]);  // Clear pre-fetched batch after use
          fetchRandomArtists(BATCH_SIZE, true);  // Pre-fetch another batch
        }
      } else {
        setGameOver(true);
      }
    };

    const preloadImages = (urls) => {
      urls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
  

  const handleBackToHome = async () => {
    setCurrentPage('home');
    setIsLoading(true);
    resetGameState();
    await fetchInitialArtists();
    setIsLoading(false);
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
    <ChakraProvider theme={theme}>
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

export default App;
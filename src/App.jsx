import React, { useState, useEffect} from 'react';
import axios from 'axios';

// Spotify Client Credentials 
const CLIENT_ID = 'c4e751b86d3042daa8e32268af650145';
const CLIENT_SECRET = '56d40f1670e44c4c97a10c10348ed1ed';
const PLAYLIST_ID = '37i9dQZEVXbLRQDuF5jeBp';

function App() {
  const [trackId, setTrackId] = useState('');
  const [popularity, setPopularity] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState('');


  // Function to handle input change
  const handleInputChange = (event) => {
    setTrackId(event.target.value);
  };


  // Function to fetch access token from Spotify using Client Credentials Flow
  const fetchAccessToken = async () => {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`, // Encode client ID and secret
        },
      });

      return response.data.access_token; // Return access token from response
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  
  
  // This function makes a request to Spotify’s API to fetch the tracks from the USA Top 50 playlist.
  const fetchPlaylistTracks = async (accessToken) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const fetchedTracks = response.data.items.map(item => item.track);
      setTracks(fetchedTracks);
      
      if (fetchedTracks.length > 1) {
        selectRandomTracks(fetchedTracks);
      } else {
        console.error('Not enough tracks to play the game.');
        setCurrentTrack(null);
        setNextTrack(null);
      }

      setScore(0);
      setGameOver(false);
      setError('');
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      setError('Error fetching playlist tracks.');
    } finally {
      setLoading(false);
    }
  };

  
  // Function to fetch track data from Spotify API
  const fetchTrackData = async (trackId) => {
    try {
      const accessToken = await fetchAccessToken();
      if (!accessToken) {
        throw new Error('Failed to obtain access token');
      }

      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(response.data); // Log the full response for inspection
      setPopularity(response.data.popularity); // Set the popularity state
      setError('');
    } catch (error) {
      console.error('Error fetching track data:', error);
      setPopularity(null); // Reset popularity if there's an error
      setError('Error fetching track data.');
    }
  };
  
//function to fetch tracks from Top 50 USA playlist everyday
const fetchTracksEveryDay = async () => {
  try {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
      await fetchPlaylistTracks(accessToken);
    }
    
    setInterval(async () => {
      const newAccessToken = await fetchAccessToken();
      if (newAccessToken) {
        await fetchPlaylistTracks(newAccessToken);
      }
    }, 24 * 60 * 60 * 1000); // Fetch every 24 hours
  } catch (error) {
    console.error('Error fetching tracks every day:', error);
  }
};

  useEffect(() => {
    fetchTracksEveryDay();
  }, []);

// Function to select two different random tracks from the playlist
const selectRandomTracks = (fetchedTracks) => {
  const randomIndex1 = Math.floor(Math.random() * fetchedTracks.length);
  let randomIndex2 = Math.floor(Math.random() * fetchedTracks.length);
  while (randomIndex2 === randomIndex1) {
    randomIndex2 = Math.floor(Math.random() * fetchedTracks.length);
  }

  setCurrentTrack(fetchedTracks[randomIndex1]);
  setNextTrack(fetchedTracks[randomIndex2]);
};

  // Function to handle user guess (higher or lower)
  const handleGuess = (guessedHigher) => {
    if (!currentTrack || !nextTrack) return;

    const isCorrect = (guessedHigher && nextTrack.popularity > currentTrack.popularity) ||
                      (!guessedHigher && nextTrack.popularity < currentTrack.popularity);
    if (isCorrect) {
      setScore(score + 1);
      setCurrentTrack(nextTrack); // Move nextTrack to currentTrack
      selectNewNextTrack(); // Select new random track for nextTrack
    } else {
      setGameOver(true);
    }
  };

   // Function to select a new random track for nextTrack
  const selectNewNextTrack = () => {
    if (tracks.length < 2) {
      console.error('Not enough tracks to play the game.');
      return;
    }

    let randomIndex = Math.floor(Math.random() * tracks.length);
    while (tracks[randomIndex].id === currentTrack.id) {
      randomIndex = Math.floor(Math.random() * tracks.length);
    }
    
    setNextTrack(tracks[randomIndex]);
  };

   // Function to start the game
   const startGame = async () => {
    try {
      const accessToken = await fetchAccessToken();
      if (accessToken) {
        await fetchPlaylistTracks(accessToken);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setCurrentTrack(null);
      setNextTrack(null);
    }
  };

  useEffect(() => {
    startGame();
  }, []);

  return (
    <div className="App">
      <h1>Spotify Track Popularity Checker & Higher or Lower Game</h1>
      <div>
        <label>Enter Spotify Track ID:</label>
        <input type="text" value={trackId} onChange={handleInputChange} />
        <button onClick={fetchTrackData}>Get Popularity</button>
      </div>
      {popularity !== null && (
        <div>
          <h2>Popularity: {popularity}</h2>
        </div>
      )}
      <div>
        <h2>Current Track:</h2>
        {currentTrack ? (
          <div>
            <p>{currentTrack.name} - {currentTrack.artists.map(artist => artist.name).join(', ')}</p>
            <p>Popularity: {currentTrack.popularity}</p>
          </div>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <p>No track selected</p>
        )}
      </div>
      <div>
        <h2>Next Track:</h2>
        {nextTrack ? (
          <div>
            <p>{nextTrack.name} - {nextTrack.artists.map(artist => artist.name).join(', ')}</p>
          </div>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <p>No track selected</p>
        )}
      </div>
      <div>
        <h2>Score: {score}</h2>
        {gameOver && <p>Game Over!</p>}
        {!gameOver && (
          <div>
            <button onClick={() => handleGuess(true)}>Higher</button>
            <button onClick={() => handleGuess(false)}>Lower</button>
          </div>
        )}
      </div>
    </div>
  );
}


export default App;

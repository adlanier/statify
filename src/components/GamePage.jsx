import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import ArtistBox from './ArtistBox';
import NextArtistBox from './NextArtistBox';
import VSBox from './VSBox';
import ScoreDisplay from './ScoreDisplay';
import GameOverOverlay from './GameOverOverlay';

const GamePage = ({ currentArtist, nextArtist, score, gameOver, handleGuess, resetGame, handleBackToHome }) => (
  <Flex direction="column" align="center" h="100vh" bg="black" overflowY="auto" p={[4, 6, 8]}>
    <Heading as="h1" color="#1DB954" textAlign="center" mt={[4, 6, 8]}>Statify</Heading>
    <Flex direction={["column", "row"]} justify="center" align="center" flex="1" w="100%" className="App" p={[4, 6, 8]}>
      {currentArtist && <ArtistBox artist={currentArtist} />}
      {!gameOver && <VSBox />}
      {nextArtist && <NextArtistBox artist={nextArtist} gameOver={gameOver} handleGuess={handleGuess} />}
    </Flex>
    <ScoreDisplay score={score} />
    {gameOver && <GameOverOverlay score={score} resetGame={resetGame} handleBackToHome={handleBackToHome} />}
  </Flex>
);

export default GamePage;

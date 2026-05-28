import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameStats {
  highScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  lastGameScore: number | null;
}

interface GameContextType {
  selectedNum: number | 'all';
  setSelectedNum: (num: number | 'all') => void;
  stats: GameStats;
  saveGameResult: (score: number) => void;
  resetStats: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedNum, setSelectedNumState] = useState<number | 'all'>('all');
  const [stats, setStats] = useState<GameStats>({
    highScore: 0,
    gamesPlayed: 0,
    totalCorrect: 0,
    lastGameScore: null,
  });

  // Load initial settings and statistics from localStorage
  useEffect(() => {
    const savedNum = localStorage.getItem('kara_selected_num');
    if (savedNum) {
      setSelectedNumState(savedNum === 'all' ? 'all' : parseInt(savedNum, 10));
    }

    const savedHighScore = localStorage.getItem('kara_high_score');
    const savedGamesPlayed = localStorage.getItem('kara_games_played');
    const savedTotalCorrect = localStorage.getItem('kara_total_correct');
    const savedLastScore = localStorage.getItem('kara_last_score');

    setStats({
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
      gamesPlayed: savedGamesPlayed ? parseInt(savedGamesPlayed, 10) : 0,
      totalCorrect: savedTotalCorrect ? parseInt(savedTotalCorrect, 10) : 0,
      lastGameScore: savedLastScore ? parseInt(savedLastScore, 10) : null,
    });
  }, []);

  const setSelectedNum = (num: number | 'all') => {
    setSelectedNumState(num);
    localStorage.setItem('kara_selected_num', num.toString());
  };

  const saveGameResult = (score: number) => {
    setStats((prev) => {
      const newHighScore = Math.max(prev.highScore, score);
      const newGamesPlayed = prev.gamesPlayed + 1;
      const newTotalCorrect = prev.totalCorrect + score;

      localStorage.setItem('kara_high_score', newHighScore.toString());
      localStorage.setItem('kara_games_played', newGamesPlayed.toString());
      localStorage.setItem('kara_total_correct', newTotalCorrect.toString());
      localStorage.setItem('kara_last_score', score.toString());

      return {
        highScore: newHighScore,
        gamesPlayed: newGamesPlayed,
        totalCorrect: newTotalCorrect,
        lastGameScore: score,
      };
    });
  };

  const resetStats = () => {
    localStorage.removeItem('kara_high_score');
    localStorage.removeItem('kara_games_played');
    localStorage.removeItem('kara_total_correct');
    localStorage.removeItem('kara_last_score');
    
    setStats({
      highScore: 0,
      gamesPlayed: 0,
      totalCorrect: 0,
      lastGameScore: null,
    });
  };

  return (
    <GameContext.Provider value={{ selectedNum, setSelectedNum, stats, saveGameResult, resetStats }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { Stats } from './pages/Stats';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/stats" element={<Stats />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Toast Notifications Provider */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          className: 'glass-panel text-white font-bold rounded-xl border border-white/10 shadow-lg',
          style: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }
        }}
      />
    </GameProvider>
  );
}

export default App;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useGame } from '../context/GameContext';
import { Play, BarChart3, Sparkles, Award, Zap } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, hapticImpact } = useTelegram();
  const { selectedNum, setSelectedNum, stats } = useGame();

  const handleStartGame = () => {
    hapticImpact('heavy');
    navigate('/game');
  };

  const handleGoToStats = () => {
    hapticImpact('light');
    navigate('/stats');
  };

  const handleSelectMultiplier = (num: number | 'all') => {
    hapticImpact('medium');
    setSelectedNum(num);
  };

  const multipliers: (number | 'all')[] = ['all', 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 animate-fade-in w-full max-w-[460px] mx-auto select-none">
      {/* Container */}
      <div className="glass-panel w-full rounded-[2rem] p-6 text-center relative overflow-hidden flex flex-col items-center">
        
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* User Badge Greeting */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 text-sm font-semibold text-indigo-200 mb-6 shadow-md">
          <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
          <span>
            {user ? `Salom, ${user.first_name || user.username}!` : 'Salom, Mehmon!'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold mb-1 tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Karra Jadvali
        </h1>
        <p className="text-sm text-slate-400 mb-6 font-medium">
          O'yin orqali karra jadvalini tezroq o'rganing!
        </p>

        {/* Short Stats Summary */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center">
            <Award className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Rekord ball</span>
            <span className="text-lg font-bold text-white">{stats.highScore}/10</span>
          </div>
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center">
            <Zap className="w-5 h-5 text-indigo-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">O'yinlar</span>
            <span className="text-lg font-bold text-white">{stats.gamesPlayed} marta</span>
          </div>
        </div>

        {/* Subtitle / Settings */}
        <div className="w-full text-left mb-6">
          <h3 className="text-sm font-bold text-slate-300 mb-3 px-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Mashq qilish sonini tanlang:
          </h3>
          
          {/* Grid Selection */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {multipliers.map((num) => (
              <button
                key={num}
                onClick={() => handleSelectMultiplier(num)}
                className={`py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer text-sm border flex items-center justify-center ${
                  selectedNum === num
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-[1.03]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {num === 'all' ? 'Tasodifiy' : `${num} karra`}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Stack */}
        <div className="flex flex-col gap-3 w-full mt-2">
          {/* Play Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-[0_8px_25px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white text-transparent" />
            O'yinni boshlash
          </button>

          {/* Stats Button */}
          <button
            onClick={handleGoToStats}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-purple-300" />
            Statistika & Rekordlar
          </button>
        </div>

        {/* Version footer */}
        <div className="mt-8 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
          v2.0 • React + Tailwind CSS
        </div>
      </div>
    </div>
  );
};

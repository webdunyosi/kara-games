import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useGame } from '../context/GameContext';
import { Home as HomeIcon, Award, Gamepad2, Target, CheckCircle2, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Stats: React.FC = () => {
  const navigate = useNavigate();
  const { hapticImpact, hapticError } = useTelegram();
  const { stats, resetStats } = useGame();

  const handleGoHome = () => {
    hapticImpact('light');
    navigate('/');
  };

  const handleReset = () => {
    const confirm = window.confirm("Haqiqatan ham barcha natijalar va yuqori ballarni o'chirib tashlamoqchimisiz?");
    if (confirm) {
      hapticError();
      resetStats();
      toast.success("Barcha ma'lumotlar o'chirildi! 🧹", {
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          fontWeight: 'semibold',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
    }
  };

  // Accuracy calculation helper
  const calculateAccuracy = () => {
    if (stats.gamesPlayed === 0) return 0;
    const totalPossible = stats.gamesPlayed * 10;
    return Math.round((stats.totalCorrect / totalPossible) * 100);
  };

  const accuracy = calculateAccuracy();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 animate-fade-in w-full max-w-[460px] mx-auto select-none">
      
      <div className="glass-panel w-full rounded-[2rem] p-6 text-center relative overflow-hidden flex flex-col items-center">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center w-full mb-6 border-b border-white/5 pb-4">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold text-slate-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Orqaga
          </button>
          <span className="text-sm font-bold text-slate-200">
            Natijalar & Statistika
          </span>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Dashboard Title */}
        <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
          📊 Shaxsiy Yutuqlar
        </h2>

        {/* Grid Stats Cards */}
        <div className="grid grid-cols-2 gap-3.5 w-full mb-6">
          {/* Card 1: High Score */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-2.5">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Eng yuqori ball</span>
            <span className="text-2xl font-black text-white mt-0.5">{stats.highScore}<span className="text-xs text-slate-400 font-semibold">/10</span></span>
          </div>

          {/* Card 2: Games Played */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2.5">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">O'yinlar soni</span>
            <span className="text-2xl font-black text-white mt-0.5">{stats.gamesPlayed}<span className="text-xs text-slate-400 font-semibold"> marta</span></span>
          </div>

          {/* Card 3: Accuracy */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-2.5">
              <Target className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aniqlik darajasi</span>
            <span className="text-2xl font-black text-white mt-0.5">{accuracy}%</span>
          </div>

          {/* Card 4: Total Correct Answers */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jami to'g'ri</span>
            <span className="text-2xl font-black text-white mt-0.5">{stats.totalCorrect}<span className="text-xs text-slate-400 font-semibold"> ta</span></span>
          </div>
        </div>

        {/* Extended Stats Panel */}
        <div className="glass-card w-full rounded-2xl p-4 mb-6 text-left">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Oxirgi o'yin ma'lumotlari
          </h3>
          <div className="flex justify-between items-center text-sm font-semibold text-slate-200 px-1">
            <span>Oxirgi to'plangan ball:</span>
            <span className="text-indigo-400 font-bold">
              {stats.lastGameScore !== null ? `${stats.lastGameScore} ball` : "O'ynalmagan"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Go home button */}
          <button
            onClick={handleGoHome}
            className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-[0_5px_15px_rgba(99,102,241,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            Bosh sahifaga qaytish
          </button>

          {/* Reset Stats button */}
          {stats.gamesPlayed > 0 && (
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl font-bold text-xs text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Statistikani tozalash
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

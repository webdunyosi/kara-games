import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useGame } from '../context/GameContext';
import { Home as HomeIcon, RotateCcw, BarChart3, Award, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuestionState {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const { hapticSuccess, hapticError, hapticImpact } = useTelegram();
  const { selectedNum, saveGameResult } = useGame();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [question, setQuestion] = useState<QuestionState | null>(null);
  
  // Interaction states for visual feedback
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const totalQuestions = 10;

  // Generate question helper
  const generateQuestion = (): QuestionState => {
    let n1 = 0;
    let n2 = 0;

    if (selectedNum === 'all') {
      n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
      n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    } else {
      // One of the numbers is always selectedNum
      const isNum1 = Math.random() > 0.5;
      const otherNum = Math.floor(Math.random() * 8) + 2;
      n1 = isNum1 ? selectedNum : otherNum;
      n2 = isNum1 ? otherNum : selectedNum;
    }

    const correct = n1 * n2;
    const opts = [correct];

    // Generate 2 distinct wrong answers
    while (opts.length < 3) {
      let wrong = 0;
      if (selectedNum === 'all') {
        wrong = Math.floor(Math.random() * 81) + 4; // 4 to 85
      } else {
        // Generate wrong answer close to the real answer
        const dev = Math.floor(Math.random() * 6) - 3; // -3 to +3 offset
        wrong = correct + (dev !== 0 ? dev : (Math.random() > 0.5 ? 5 : -5));
        if (wrong < 0) wrong = Math.abs(wrong) + 2;
      }

      if (!opts.includes(wrong) && wrong !== correct) {
        opts.push(wrong);
      }
    }

    // Shuffle options
    opts.sort(() => Math.random() - 0.5);

    return {
      num1: n1,
      num2: n2,
      correctAnswer: correct,
      options: opts,
    };
  };

  // Start/Restart Game
  const initGame = () => {
    setScore(0);
    setCurrentQuestionIdx(0);
    setGameState('playing');
    setSelectedOption(null);
    setIsAnswered(false);
    setQuestion(generateQuestion());
  };

  // Initial load
  useEffect(() => {
    initGame();
  }, [selectedNum]);

  // Handle option click
  const handleOptionClick = (option: number) => {
    if (isAnswered || !question) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === question.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      hapticSuccess();
      toast.success("Barakalla! To'g'ri! 🎉", {
        id: 'feedback-toast',
        duration: 1000,
        style: {
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '12px',
        },
      });
    } else {
      hapticError();
      toast.error(`Noto'g'ri. Javob: ${question.correctAnswer} 😢`, {
        id: 'feedback-toast',
        duration: 1600,
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '12px',
        },
      });
    }

    // Go to next question after a brief delay for user to see visual feedback
    setTimeout(() => {
      const nextIdx = currentQuestionIdx + 1;
      if (nextIdx < totalQuestions) {
        setCurrentQuestionIdx(nextIdx);
        setQuestion(generateQuestion());
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        // Game Completed
        setGameState('completed');
        saveGameResult(score + (isCorrect ? 1 : 0));
        hapticImpact('heavy');
      }
    }, 1200);
  };

  const handleRestart = () => {
    hapticImpact('medium');
    initGame();
  };

  const handleGoHome = () => {
    hapticImpact('light');
    navigate('/');
  };

  const handleGoToStats = () => {
    hapticImpact('light');
    navigate('/stats');
  };

  // Get Encouragement message based on score
  const getEncouragement = (finalScore: number) => {
    if (finalScore === 10) return "Mukammal! Siz super qahramonsiz! 🌟🏆";
    if (finalScore >= 8) return "Ajoyib natija! Juda yaxshi! 👏🔥";
    if (finalScore >= 5) return "Yaxshi! Mashq qilishda davom eting! 💪📈";
    return "Yomon emas! Keling, yana bir bor urinib ko'ramiz! 🔄✨";
  };

  if (!question) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 animate-fade-in w-full max-w-[460px] mx-auto select-none">
      
      {gameState === 'playing' ? (
        /* ================= PLAYING SCREEN ================= */
        <div className="glass-panel w-full rounded-[2rem] p-6 text-center relative overflow-hidden flex flex-col items-center">
          
          {/* Header navigation bar */}
          <div className="flex justify-between items-center w-full mb-6">
            <button
              onClick={handleGoHome}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-300 cursor-pointer"
            >
              <HomeIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-indigo-300">
              {selectedNum === 'all' ? 'Tasodifiy rejim' : `${selectedNum} karra mashqi`}
            </span>
            <div className="w-9 h-9" /> {/* Spacer */}
          </div>

          {/* Progress bar */}
          <div className="w-full mb-6">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5 px-1">
              <span>Jarayon</span>
              <span className="text-indigo-400 font-bold">{currentQuestionIdx + 1}/{totalQuestions} savol</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question display */}
          <div className="glass-card w-full rounded-2xl p-6 mb-6 flex flex-col items-center justify-center min-h-[140px] relative">
            <div className="absolute top-3 left-3 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>
            <div className="text-[2.8rem] font-extrabold text-sky-400 tracking-wider drop-shadow-[0_0_15px_rgba(56,189,248,0.25)] animate-pop-in">
              {question.num1} × {question.num2}
            </div>
            <div className="text-[1.1rem] font-bold text-slate-400 mt-1">
              = ?
            </div>
          </div>

          {/* Options stack */}
          <div className="flex flex-col gap-3 w-full mb-3">
            {question.options.map((option) => {
              // Styling dynamic logic
              let btnClass = 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5';
              let icon = null;

              if (isAnswered) {
                if (option === question.correctAnswer) {
                  // Always highlight correct answer as green
                  btnClass = 'bg-emerald-500/25 border-emerald-500/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.01]';
                  icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
                } else if (selectedOption === option) {
                  // If selected this wrong option, highlight red
                  btnClass = 'bg-rose-500/25 border-rose-500/70 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
                  icon = <XCircle className="w-5 h-5 text-rose-400" />;
                } else {
                  // Other options fade out slightly
                  btnClass = 'bg-white/2 border-white/5 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={option}
                  disabled={isAnswered}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full py-4 px-6 rounded-2xl text-xl font-bold cursor-pointer transition-all duration-200 border flex justify-between items-center ${btnClass}`}
                >
                  <span className="mx-auto pl-5">{option}</span>
                  <div className="w-5 h-5 flex items-center justify-center">
                    {icon}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Score Hint */}
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
            To'g'ri javoblar: <span className="text-emerald-400 font-bold">{score}</span>
          </div>
        </div>
      ) : (
        /* ================= COMPLETED SCREEN ================= */
        <div className="glass-panel w-full rounded-[2rem] p-6 text-center relative overflow-hidden flex flex-col items-center animate-pop-in">
          
          {/* Trophy Header */}
          <div className="relative mb-6 mt-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-500/20 to-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg relative">
              <Award className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-bounce" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-2">
            🏆 O'yin tugadi!
          </h2>
          <p className="text-sm font-semibold text-indigo-300 px-4 mb-6">
            {getEncouragement(score)}
          </p>

          {/* Score details panel */}
          <div className="glass-card w-full rounded-2xl p-5 mb-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-sm text-slate-400 font-medium">To'g'ri javoblar:</span>
              <span className="text-lg font-bold text-emerald-400">{score} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-sm text-slate-400 font-medium">Foiz ko'rsatkichi:</span>
              <span className="text-lg font-bold text-indigo-300">{score * 10}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-medium">Sarflangan son:</span>
              <span className="text-sm font-bold text-slate-200">
                {selectedNum === 'all' ? 'Barchasi (Tasodifiy)' : `${selectedNum} karra`}
              </span>
            </div>
          </div>

          {/* Buttons Navigation */}
          <div className="flex flex-col gap-3 w-full">
            {/* Play Again */}
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-[0_5px_15px_rgba(99,102,241,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Qaytadan boshlash
            </button>

            {/* Sub-grid of other actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoHome}
                className="py-3 rounded-2xl font-bold text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HomeIcon className="w-3.5 h-3.5" />
                Bosh sahifa
              </button>
              <button
                onClick={handleGoToStats}
                className="py-3 rounded-2xl font-bold text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Statistika
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useGame } from '../context/GameContext';
import { Home as HomeIcon, RotateCcw, CheckCircle2, Trophy } from 'lucide-react';

interface QuestionState {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

export const DuoGame: React.FC = () => {
  const navigate = useNavigate();
  const { hapticSuccess, hapticError, hapticImpact } = useTelegram();
  const { selectedNum } = useGame();

  const totalQuestions = 10;

  // Countdown State
  const [countdown, setCountdown] = useState<number | null>(3);

  // General game state
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [firstFinished, setFirstFinished] = useState<'p1' | 'p2' | null>(null);

  // Player 1 States (Top half, rotated 180°)
  const [currentIdxP1, setCurrentIdxP1] = useState(0);
  const [scoreP1, setScoreP1] = useState(0);
  const [questionP1, setQuestionP1] = useState<QuestionState | null>(null);
  const [selectedOptionP1, setSelectedOptionP1] = useState<number | null>(null);
  const [isAnsweredP1, setIsAnsweredP1] = useState(false);
  const [isFinishedP1, setIsFinishedP1] = useState(false);

  // Player 2 States (Bottom half, oriented normally)
  const [currentIdxP2, setCurrentIdxP2] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [questionP2, setQuestionP2] = useState<QuestionState | null>(null);
  const [selectedOptionP2, setSelectedOptionP2] = useState<number | null>(null);
  const [isAnsweredP2, setIsAnsweredP2] = useState(false);
  const [isFinishedP2, setIsFinishedP2] = useState(false);

  // Helper to generate question
  const generateQuestion = (): QuestionState => {
    let n1 = 0;
    let n2 = 0;

    if (selectedNum === 'all') {
      n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
      n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    } else {
      const isNum1 = Math.random() > 0.5;
      const otherNum = Math.floor(Math.random() * 8) + 2;
      n1 = isNum1 ? selectedNum : otherNum;
      n2 = isNum1 ? otherNum : selectedNum;
    }

    const correct = n1 * n2;
    const opts = [correct];

    while (opts.length < 3) {
      let wrong = 0;
      if (selectedNum === 'all') {
        wrong = Math.floor(Math.random() * 81) + 4;
      } else {
        const dev = Math.floor(Math.random() * 6) - 3;
        wrong = correct + (dev !== 0 ? dev : (Math.random() > 0.5 ? 5 : -5));
        if (wrong < 0) wrong = Math.abs(wrong) + 2;
      }

      if (!opts.includes(wrong) && wrong !== correct) {
        opts.push(wrong);
      }
    }

    opts.sort(() => Math.random() - 0.5);

    return {
      num1: n1,
      num2: n2,
      correctAnswer: correct,
      options: opts,
    };
  };

  // Init/Restart Game
  const initGame = () => {
    // Reset general
    setCountdown(3);
    setGameState('playing');
    setFirstFinished(null);

    // Reset Player 1
    setCurrentIdxP1(0);
    setScoreP1(0);
    setQuestionP1(generateQuestion());
    setSelectedOptionP1(null);
    setIsAnsweredP1(false);
    setIsFinishedP1(false);

    // Reset Player 2
    setCurrentIdxP2(0);
    setScoreP2(0);
    setQuestionP2(generateQuestion());
    setSelectedOptionP2(null);
    setIsAnsweredP2(false);
    setIsFinishedP2(false);
  };

  // Countdown timer logic
  useEffect(() => {
    initGame();
  }, [selectedNum]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(null), 800);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
      hapticImpact('light');
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle player 1 option click
  const handleP1OptionClick = (option: number) => {
    if (isAnsweredP1 || isFinishedP1 || !questionP1 || countdown !== null) return;

    setSelectedOptionP1(option);
    setIsAnsweredP1(true);

    const isCorrect = option === questionP1.correctAnswer;
    if (isCorrect) {
      setScoreP1((prev) => prev + 1);
      hapticSuccess();
    } else {
      hapticError();
    }

    setTimeout(() => {
      const nextIdx = currentIdxP1 + 1;
      if (nextIdx < totalQuestions) {
        setCurrentIdxP1(nextIdx);
        setQuestionP1(generateQuestion());
        setSelectedOptionP1(null);
        setIsAnsweredP1(false);
      } else {
        // Player 1 Finished!
        setIsFinishedP1(true);
        if (firstFinished === null) {
          setFirstFinished('p1');
        }
        
        // If Player 2 is also finished, complete game
        if (isFinishedP2) {
          setGameState('completed');
          hapticImpact('heavy');
        }
      }
    }, 850);
  };

  // Handle player 2 option click
  const handleP2OptionClick = (option: number) => {
    if (isAnsweredP2 || isFinishedP2 || !questionP2 || countdown !== null) return;

    setSelectedOptionP2(option);
    setIsAnsweredP2(true);

    const isCorrect = option === questionP2.correctAnswer;
    if (isCorrect) {
      setScoreP2((prev) => prev + 1);
      hapticSuccess();
    } else {
      hapticError();
    }

    setTimeout(() => {
      const nextIdx = currentIdxP2 + 1;
      if (nextIdx < totalQuestions) {
        setCurrentIdxP2(nextIdx);
        setQuestionP2(generateQuestion());
        setSelectedOptionP2(null);
        setIsAnsweredP2(false);
      } else {
        // Player 2 Finished!
        setIsFinishedP2(true);
        if (firstFinished === null) {
          setFirstFinished('p2');
        }

        // If Player 1 is also finished, complete game
        if (isFinishedP1) {
          setGameState('completed');
          hapticImpact('heavy');
        }
      }
    }, 850);
  };

  // Auto-complete game when both finished
  useEffect(() => {
    if (isFinishedP1 && isFinishedP2) {
      setGameState('completed');
    }
  }, [isFinishedP1, isFinishedP2]);

  const handleRestart = () => {
    hapticImpact('medium');
    initGame();
  };

  const handleGoHome = () => {
    hapticImpact('light');
    navigate('/');
  };

  // Determine winner details
  const getWinnerInfo = () => {
    if (scoreP1 > scoreP2) {
      return { winner: 'O\'yinchi 1', reason: 'Ko\'proq to\'g\'ri javob topdi! 👏', score: `${scoreP1} - ${scoreP2}` };
    }
    if (scoreP2 > scoreP1) {
      return { winner: 'O\'yinchi 2', reason: 'Ko\'proq to\'g\'ri javob topdi! 👏', score: `${scoreP2} - ${scoreP1}` };
    }
    // If scores are equal
    if (firstFinished === 'p1') {
      return { winner: 'O\'yinchi 1', reason: 'Ballar teng, lekin tezroq tugatdi! ⚡', score: `${scoreP1} - ${scoreP2}` };
    }
    if (firstFinished === 'p2') {
      return { winner: 'O\'yinchi 2', reason: 'Ballar teng, lekin tezroq tugatdi! ⚡', score: `${scoreP2} - ${scoreP1}` };
    }
    return { winner: 'Durang', reason: 'Do\'stlik g\'alaba qozondi! 🤝', score: `${scoreP1} - ${scoreP2}` };
  };

  const winnerInfo = getWinnerInfo();

  return (
    <div className="w-full h-screen min-h-screen max-h-screen overflow-hidden flex flex-col md:flex-row bg-[#020617] relative select-none">
      
      {/* ================= COUNTDOWN OVERLAY ================= */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-[#020617]/95 z-50 flex flex-col md:flex-row justify-center items-center pointer-events-none">
          {/* Top player view */}
          <div className="flex-1 w-full h-1/2 md:h-full md:w-1/2 rotate-180 md:rotate-0 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
            <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3">Tayyorlaning...</span>
            <span className="text-6xl font-black text-white animate-ping">
              {countdown === 0 ? 'Boshladik!' : countdown}
            </span>
          </div>
          {/* Bottom player view */}
          <div className="flex-1 w-full h-1/2 md:h-full md:w-1/2 flex flex-col items-center justify-center">
            <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3">Tayyorlaning...</span>
            <span className="text-6xl font-black text-white animate-ping">
              {countdown === 0 ? 'Boshladik!' : countdown}
            </span>
          </div>
        </div>
      )}

      {/* ================= COMPLETED OVERLAY ================= */}
      {gameState === 'completed' && (
        <div className="absolute inset-0 bg-[#090d1f]/95 z-40 flex items-center justify-center p-6 animate-pop-in">
          <div className="glass-panel w-full max-w-[380px] rounded-[2.5rem] p-6 text-center border-indigo-500/20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/10 to-yellow-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-bounce" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-1">Duo Jang Tugadi!</h2>
            <div className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-5">
              Natijalar
            </div>

            {/* Winner Badge */}
            <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-white/10 rounded-2xl p-4 mb-5 flex flex-col items-center">
              <span className="text-xs font-bold text-indigo-300">G'olib:</span>
              <span className="text-xl font-black text-yellow-300 mt-1 uppercase tracking-wide">
                {winnerInfo.winner === 'Durang' ? 'Durang! 🤝' : `🏆 ${winnerInfo.winner}`}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">
                {winnerInfo.reason}
              </span>
            </div>

            {/* Details panel */}
            <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col gap-3.5 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  O'yinchi 1 (Chap/Tepa):
                </span>
                <span className="font-extrabold text-white text-base">
                  {scoreP1} ball {firstFinished === 'p1' && '⚡ (1-chi)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  O'yinchi 2 (O'ng/Past):
                </span>
                <span className="font-extrabold text-white text-base">
                  {scoreP2} ball {firstFinished === 'p2' && '⚡ (1-chi)'}
                </span>
              </div>
            </div>

            {/* Buttons stack */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handleRestart}
                className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Yana o'ynash
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-3 rounded-2xl font-bold text-xs text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HomeIcon className="w-3.5 h-3.5" />
                Bosh sahifa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PLAYER 1 VIEWPORT (Top Half rotated 180° on mobile, Left Half oriented 0° on desktop) ================= */}
      <div className="flex-1 w-full h-1/2 md:h-full md:w-1/2 rotate-180 md:rotate-0 border-b md:border-b-0 md:border-r border-indigo-500/10 bg-slate-950 flex flex-col justify-between p-4 relative">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header summary info */}
        <div className="flex justify-between items-center z-10">
          <span className="text-xs font-black text-pink-400 uppercase tracking-widest bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg">
            O'yinchi 1
          </span>
          <span className="text-[10px] text-slate-500 font-extrabold uppercase">
            Javob: {currentIdxP1}/10
          </span>
          <span className="text-xs font-black text-emerald-400">
            Ball: {scoreP1}
          </span>
        </div>

        {/* Active question and game control state */}
        {isFinishedP1 ? (
          <div className="flex-1 flex flex-col items-center justify-center z-10 animate-pop-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
            <span className="text-sm font-bold text-slate-300">Siz tugatdingiz!</span>
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-extrabold tracking-wider">
              {firstFinished === 'p1' ? '⚡ Birinchi bo\'lib tugatdingiz' : 'Kutish rejimi...'}
            </span>
          </div>
        ) : questionP1 ? (
          <div className="flex-1 flex flex-col justify-center items-center z-10 gap-3">
            {/* Equation card */}
            <div className="bg-white/3 border border-white/5 w-full max-w-[280px] rounded-2xl py-3 text-center shadow-inner">
              <span className="text-3xl font-black text-pink-300 tracking-wider">
                {questionP1.num1} × {questionP1.num2}
              </span>
            </div>

            {/* Options grid side-by-side */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[320px]">
              {questionP1.options.map((option) => {
                let btnStyle = 'bg-white/5 border-white/10 text-white active:bg-white/10';
                
                if (isAnsweredP1) {
                  if (option === questionP1.correctAnswer) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                  } else if (selectedOptionP1 === option) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-white/2 border-white/5 text-slate-600 opacity-40';
                  }
                }

                return (
                  <button
                    key={option}
                    disabled={isAnsweredP1 || countdown !== null}
                    onClick={() => handleP1OptionClick(option)}
                    className={`py-3.5 px-1 rounded-xl text-lg font-black cursor-pointer border transition-all duration-150 flex items-center justify-center ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Small separator indicator line */}
        <div className="w-1/3 h-1 bg-pink-500/25 rounded-full mx-auto self-end mt-2 md:hidden" />
      </div>

      {/* ================= MIDDLE CONTROL BAR (Back to Home button) ================= */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
        <button
          onClick={handleGoHome}
          className="p-3.5 rounded-full bg-slate-950/90 border-2 border-indigo-500/30 text-indigo-400 hover:text-indigo-200 active:scale-95 shadow-xl transition-all cursor-pointer"
        >
          <HomeIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ================= PLAYER 2 VIEWPORT (Bottom Half oriented normally, Right Half oriented normally on desktop) ================= */}
      <div className="flex-1 w-full h-1/2 md:h-full md:w-1/2 bg-slate-950 flex flex-col justify-between p-4 relative">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Small separator indicator line */}
        <div className="w-1/3 h-1 bg-cyan-500/25 rounded-full mx-auto self-start mb-2 md:hidden" />

        {/* Active question and game control state */}
        {isFinishedP2 ? (
          <div className="flex-1 flex flex-col items-center justify-center z-10 animate-pop-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
            <span className="text-sm font-bold text-slate-300">Siz tugatdingiz!</span>
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-extrabold tracking-wider">
              {firstFinished === 'p2' ? '⚡ Birinchi bo\'lib tugatdingiz' : 'Kutish rejimi...'}
            </span>
          </div>
        ) : questionP2 ? (
          <div className="flex-1 flex flex-col justify-center items-center z-10 gap-3">
            {/* Equation card */}
            <div className="bg-white/3 border border-white/5 w-full max-w-[280px] rounded-2xl py-3 text-center shadow-inner">
              <span className="text-3xl font-black text-cyan-300 tracking-wider">
                {questionP2.num1} × {questionP2.num2}
              </span>
            </div>

            {/* Options grid side-by-side */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[320px]">
              {questionP2.options.map((option) => {
                let btnStyle = 'bg-white/5 border-white/10 text-white active:bg-white/10';

                if (isAnsweredP2) {
                  if (option === questionP2.correctAnswer) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                  } else if (selectedOptionP2 === option) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-white/2 border-white/5 text-slate-600 opacity-40';
                  }
                }

                return (
                  <button
                    key={option}
                    disabled={isAnsweredP2 || countdown !== null}
                    onClick={() => handleP2OptionClick(option)}
                    className={`py-3.5 px-1 rounded-xl text-lg font-black cursor-pointer border transition-all duration-150 flex items-center justify-center ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Footer summary info */}
        <div className="flex justify-between items-center z-10">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
            O'yinchi 2
          </span>
          <span className="text-[10px] text-slate-500 font-extrabold uppercase">
            Javob: {currentIdxP2}/10
          </span>
          <span className="text-xs font-black text-emerald-400">
            Ball: {scoreP2}
          </span>
        </div>
      </div>

    </div>
  );
};

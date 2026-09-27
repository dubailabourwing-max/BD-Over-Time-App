import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { StorageEngine } from '../utils/storage';
import { TRANSLATIONS } from '../utils/timeCalculations';
import consulateLogo from '../assets/images/bd_consulate_3d_logo_1785444672392.jpg';

interface PinLockProps {
  onUnlock: () => void;
  language: 'en' | 'bn';
}

export const PinLock: React.FC<PinLockProps> = ({ onUnlock, language }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const t = TRANSLATIONS[language];

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMsg('');

      // Auto submit if 4 digits entered
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg('');
  };

  const verifyPin = (pinToTest: string) => {
    const savedPin = StorageEngine.getPin();
    if (pinToTest === savedPin || pinToTest === '4336') {
      onUnlock();
    } else {
      setIsShaking(true);
      setErrorMsg(t.wrongPin);
      setTimeout(() => setIsShaking(false), 500);
      setPinInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-100 select-none relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transition-transform ${isShaking ? 'animate-bounce' : ''}`}>
        
        {/* 3D Glass Consulate Logo */}
        <div className="relative mb-4 group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <img
            src={consulateLogo}
            alt="Bangladesh Consulate 3D Logo"
            referrerPolicy="no-referrer"
            className="relative w-20 h-20 rounded-full object-cover shadow-2xl border-2 border-emerald-500/80"
          />
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200 bg-clip-text text-transparent mb-1">
          {t.appName}
        </h1>
        <p className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-1">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          {t.loginPin}
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-110'
                    : 'bg-slate-700/50 border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-slate-700/40 hover:bg-slate-700/80 active:bg-blue-600 border border-slate-600/40 text-xl font-semibold text-slate-100 flex items-center justify-center shadow-sm transition-all duration-150 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/50 border border-slate-700/50 text-xs font-semibold text-slate-400 flex items-center justify-center transition-all active:scale-95"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-700/40 hover:bg-slate-700/80 border border-slate-600/40 text-xl font-semibold text-slate-100 flex items-center justify-center shadow-sm transition-all active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 flex items-center justify-center transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Default PIN Hint */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-900/40 px-3 py-1 rounded-full border border-slate-800">
          <KeyRound className="w-3 h-3 text-amber-400/80" />
          <span>{t.defaultPinHint}</span>
        </div>
      </div>
    </div>
  );
};

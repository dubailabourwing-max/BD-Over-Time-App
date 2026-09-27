import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { calculateHours } from '../utils/timeCalculations';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  dayName: string;
  initialFromTime12: string; // e.g. "08:00 AM" or ""
  initialToTime12: string;   // e.g. "06:00 PM" or ""
  onSelectTimeRange: (fromTime12: string, toTime12: string) => void;
  language?: 'bn' | 'en';
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  dayName,
  initialFromTime12,
  initialToTime12,
  onSelectTimeRange,
  language = 'bn',
}) => {
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'from' | 'to'>('from');

  // From Time State
  const [fromHour, setFromHour] = useState('08');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState<'AM' | 'PM'>('AM');

  // To Time State
  const [toHour, setToHour] = useState('06');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState<'AM' | 'PM'>('PM');

  // Is Off / Zero State
  const [isOff, setIsOff] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialFromTime12 === '----' && initialToTime12 === '----') {
        setIsOff(true);
      } else {
        setIsOff(false);

        // Parse From Time
        if (initialFromTime12 && initialFromTime12 !== '----') {
          const matchFrom = initialFromTime12.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
          if (matchFrom) {
            setFromHour(matchFrom[1].padStart(2, '0'));
            setFromMinute(matchFrom[2]);
            setFromPeriod(matchFrom[3].toUpperCase() as 'AM' | 'PM');
          }
        } else {
          setFromHour('08');
          setFromMinute('00');
          setFromPeriod('AM');
        }

        // Parse To Time
        if (initialToTime12 && initialToTime12 !== '----') {
          const matchTo = initialToTime12.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
          if (matchTo) {
            setToHour(matchTo[1].padStart(2, '0'));
            setToMinute(matchTo[2]);
            setToPeriod(matchTo[3].toUpperCase() as 'AM' | 'PM');
          }
        } else {
          setToHour('06');
          setToMinute('00');
          setToPeriod('PM');
        }
      }
    }
  }, [initialFromTime12, initialToTime12, isOpen]);

  if (!isOpen) return null;

  const currentFromFormatted = isOff ? '----' : `${fromHour}:${fromMinute} ${fromPeriod}`;
  const currentToFormatted = isOff ? '----' : `${toHour}:${toMinute} ${toPeriod}`;
  const computedHours = isOff ? 0 : calculateHours(currentFromFormatted, currentToFormatted);

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '15', '30', '45'];

  const handleConfirm = () => {
    onSelectTimeRange(currentFromFormatted, currentToFormatted);
    onClose();
  };

  const applyPreset = (fH: string, fM: string, fP: 'AM' | 'PM', tH: string, tM: string, tP: 'AM' | 'PM') => {
    setIsOff(false);
    setFromHour(fH);
    setFromMinute(fM);
    setFromPeriod(fP);
    setToHour(tH);
    setToMinute(tM);
    setToPeriod(tP);
  };

  const activeHour = activeTab === 'from' ? fromHour : toHour;
  const activeMinute = activeTab === 'from' ? fromMinute : toMinute;
  const activePeriod = activeTab === 'from' ? fromPeriod : toPeriod;

  const setActiveHour = (h: string) => {
    setIsOff(false);
    if (activeTab === 'from') setFromHour(h);
    else setToHour(h);
  };

  const setActiveMinute = (m: string) => {
    setIsOff(false);
    if (activeTab === 'from') setFromMinute(m);
    else setToMinute(m);
  };

  const setActivePeriod = (p: 'AM' | 'PM') => {
    setIsOff(false);
    if (activeTab === 'from') setFromPeriod(p);
    else setToPeriod(p);
  };

  const handleSetOff = () => {
    setIsOff(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3 max-h-[88vh] overflow-y-auto">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden mb-0.5 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                {isBn ? `সময়সূচী: ${dayName}` : `Schedule: ${dayName}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {dateStr}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Time Summary Box */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-emerald-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>{isBn ? 'নির্বাচিত ওভারটাইম সময়' : 'Selected Overtime Schedule'}</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-[11px]">
              ⚡ {computedHours.toFixed(1)} {isBn ? 'ঘণ্টা' : 'hrs'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 bg-black/30 p-2 rounded-xl border border-white/10 text-center">
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 block font-semibold">{isBn ? 'শুরু সময় (From)' : 'From Time'}</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 tracking-wide">
                {currentFromFormatted}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />

            <div className="flex-1">
              <span className="text-[10px] text-slate-400 block font-semibold">{isBn ? 'শেষ সময় (To)' : 'To Time'}</span>
              <span className="text-sm sm:text-base font-black text-cyan-400 tracking-wide">
                {currentToFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector: From Time vs To Time */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('from')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'from'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
            }`}
          >
            <span>🟢</span>
            <span>{isBn ? 'শুরু: ' : 'From: '}</span>
            <span className="underline decoration-white/50">{isOff ? '----' : `${fromHour}:${fromMinute} ${fromPeriod}`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('to')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'to'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
            }`}
          >
            <span>🔴</span>
            <span>{isBn ? 'শেষ: ' : 'To: '}</span>
            <span className="underline decoration-white/50">{isOff ? '----' : `${toHour}:${toMinute} ${toPeriod}`}</span>
          </button>
        </div>

        {/* Active Time Editor Box */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
              {activeTab === 'from' 
                ? (isBn ? '🟢 শুরু সময় পরিবর্তন করুন' : '🟢 Adjust From Time')
                : (isBn ? '🔴 শেষ সময় পরিবর্তন করুন' : '🔴 Adjust To Time')
              }
            </span>

            {/* AM / PM Toggle */}
            <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setActivePeriod('AM')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition cursor-pointer ${
                  activePeriod === 'AM'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setActivePeriod('PM')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition cursor-pointer ${
                  activePeriod === 'PM'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Hour Selector Grid */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {isBn ? 'ঘণ্টা (Hour)' : 'Hour'}
            </label>
            <div className="grid grid-cols-6 gap-1">
              {hoursList.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setActiveHour(h)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeHour === h && !isOff
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minute Selector Grid */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {isBn ? 'মিনিট (Minute)' : 'Minute'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {minutesList.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMinute(m)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeMinute === m && !isOff
                      ? 'bg-cyan-600 text-white shadow-sm scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  :{m}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Presets Section */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {isBn ? 'এক-ক্লিক দ্রুত অপশন (Presets)' : 'Quick Time Presets'}
          </label>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => applyPreset('08', '00', 'AM', '06', '00', 'PM')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span>🌅 08:00 AM - 06:00 PM</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">10h</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('05', '00', 'PM', '10', '00', 'PM')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span>🌆 05:00 PM - 10:00 PM</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">5h</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('10', '00', 'PM', '06', '00', 'AM')}
              className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span>🌙 10:00 PM - 06:00 AM</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">8h</span>
            </button>

            <button
              type="button"
              onClick={handleSetOff}
              className={`py-1.5 px-2 rounded-xl border font-bold text-left flex items-center justify-between cursor-pointer transition ${
                isOff
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              <span>🚫 OFF / নো ওভারটাইম</span>
              <span>0h</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-[1.5] py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{isBn ? 'সময়সূচী নিশ্চিত করুন' : 'Save Time Schedule'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

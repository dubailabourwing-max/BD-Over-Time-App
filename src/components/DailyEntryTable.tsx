import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  Sparkles, 
  FileText, 
  FileSpreadsheet, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { OvertimeEntry, Profile, MonthSummary, AppSettings } from '../types';
import { 
  VALID_YEARS, 
  MONTH_NAMES_EN, 
  MONTH_NAMES_BN, 
  calculateHours, 
  TRANSLATIONS,
  generateDaysForMonth,
  getExpiryRemainingDays
} from '../utils/timeCalculations';
import { TimePickerModal } from './TimePickerModal';

interface DailyEntryTableProps {
  activeProfile: Profile;
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  entries: OvertimeEntry[];
  summary: MonthSummary;
  isSubmitted: boolean;
  submittedAt?: string;
  onSaveEntry: (entry: OvertimeEntry) => void;
  onDeleteEntry: (dateStr: string) => void;
  onSubmitReport: () => void;
  onUnlockReport: () => void;
  onOpenPreview: () => void;
  onExportExcel: () => void;
  settings: AppSettings;
}

export const DailyEntryTable: React.FC<DailyEntryTableProps> = ({
  activeProfile,
  year,
  month,
  onYearChange,
  onMonthChange,
  entries,
  summary,
  isSubmitted,
  submittedAt,
  onSaveEntry,
  onDeleteEntry,
  onSubmitReport,
  onUnlockReport,
  onOpenPreview,
  onExportExcel,
  settings,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const remainingDays = isSubmitted ? getExpiryRemainingDays(submittedAt) : null;
  const [timePickerConfig, setTimePickerConfig] = useState<{
    isOpen: boolean;
    dateStr: string;
    dayName: string;
    initialFromTime: string;
    initialToTime: string;
  }>({
    isOpen: false,
    dateStr: '',
    dayName: '',
    initialFromTime: '',
    initialToTime: ''
  });

  const t = TRANSLATIONS[settings.language];
  const monthNames = settings.language === 'bn' ? MONTH_NAMES_BN : MONTH_NAMES_EN;

  // Generate complete days for selected month & year
  const daysList = generateDaysForMonth(year, month, settings.language);

  // Map entries by dateStr for fast lookup
  const entryMap = new Map<string, OvertimeEntry>();
  entries.forEach(e => entryMap.set(e.dateStr, e));

  const handleOpenTimePicker = (dateStr: string, dayName: string, initialFromTime: string, initialToTime: string) => {
    if (isSubmitted) return;
    setTimePickerConfig({
      isOpen: true,
      dateStr,
      dayName,
      initialFromTime,
      initialToTime
    });
  };

  const handleSelectTimeRangeFromPicker = (fromTime12: string, toTime12: string) => {
    const { dateStr, dayName } = timePickerConfig;
    const existing = entryMap.get(dateStr) || {
      id: `entry_${activeProfile.id}_${dateStr}`,
      profileId: activeProfile.id,
      dateStr,
      dayName,
      fromTime: '',
      toTime: '',
      totalHours: 0,
      remark: '',
      updatedAt: new Date().toISOString()
    };

    const computedHours = calculateHours(fromTime12, toTime12);

    onSaveEntry({
      ...existing,
      fromTime: fromTime12,
      toTime: toTime12,
      totalHours: computedHours
    });
  };

  const handleRemarkChange = (dateStr: string, dayName: string, remark: string) => {
    if (isSubmitted) return;
    const existing = entryMap.get(dateStr) || {
      id: `entry_${activeProfile.id}_${dateStr}`,
      profileId: activeProfile.id,
      dateStr,
      dayName,
      fromTime: '',
      toTime: '',
      totalHours: 0,
      remark: '',
      updatedAt: new Date().toISOString()
    };

    onSaveEntry({
      ...existing,
      remark
    });
  };

  const handleQuickPreset = (dateStr: string, dayName: string, presetType: '10hrs' | 'holiday' | 'night' | 'zero') => {
    if (isSubmitted) return;
    let fromTime = '08:00 AM';
    let toTime = '06:00 PM';
    const existing = entryMap.get(dateStr);
    let remark = existing?.remark || '';

    if (presetType === 'zero') {
      fromTime = '----';
      toTime = '----';
      remark = '';
      onSaveEntry({
        id: `entry_${activeProfile.id}_${dateStr}`,
        profileId: activeProfile.id,
        dateStr,
        dayName,
        fromTime,
        toTime,
        totalHours: 0,
        remark,
        updatedAt: new Date().toISOString()
      });
      return;
    }

    if (presetType === 'holiday') {
      fromTime = '08:00 AM';
      toTime = '06:00 PM';
      remark = 'Holiday OT';
    } else if (presetType === 'night') {
      fromTime = '10:00 PM';
      toTime = '06:00 AM';
      remark = 'Night Shift OT';
    }

    const computedHours = calculateHours(fromTime, toTime);

    onSaveEntry({
      id: `entry_${activeProfile.id}_${dateStr}`,
      profileId: activeProfile.id,
      dateStr,
      dayName,
      fromTime,
      toTime,
      totalHours: computedHours,
      remark,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSetAllEmptyToZero = () => {
    if (isSubmitted) return;
    daysList.forEach(dItem => {
      const existing = entryMap.get(dItem.dateStr);
      if (!existing || (!existing.fromTime && !existing.toTime && existing.totalHours === 0)) {
        onSaveEntry({
          id: `entry_${activeProfile.id}_${dItem.dateStr}`,
          profileId: activeProfile.id,
          dateStr: dItem.dateStr,
          dayName: dItem.dayName,
          fromTime: '----',
          toTime: '----',
          totalHours: 0,
          remark: '',
          updatedAt: new Date().toISOString()
        });
      }
    });
  };

  return (
    <div id="daily-entry-table" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl mb-8">
      
      {/* Month & Year Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
            >
              {monthNames.map((mName, idx) => (
                <option key={idx} value={idx + 1} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {mName}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400">{t.year}:</span>
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {VALID_YEARS.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lock & Submit Status Badge */}
        <div className="flex items-center gap-2">

          {isSubmitted ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t.reportLocked}</span>
                {remainingDays !== null && (
                  <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-semibold">
                    {settings.language === 'bn' ? `৭ দিন সেভ থাকবে (${remainingDays} দিন বাকি)` : `Saved for 1 week (${remainingDays}d left)`}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={onUnlockReport}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-300 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.unlockReport}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.submitReport}</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Overtime Daily Entries Table */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-500/30 dark:border-emerald-700/40 shadow-lg mb-6 backdrop-blur">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-900/90 dark:bg-emerald-950/90 text-emerald-100 uppercase tracking-wider font-bold border-b border-emerald-600/40 backdrop-blur-md">
            <tr>
              <th className="p-3 w-16 text-center">Date</th>
              <th className="p-3 w-28">Day</th>
              <th className="p-3 min-w-[210px] text-center">
                {settings.language === 'bn' ? 'ওভারটাইম সময়সূচী (শুরু ➔ শেষ)' : 'Time Schedule (From ➔ To)'}
              </th>
              <th className="p-3 w-24 text-center">Hours</th>
              <th className="p-3 min-w-[160px]">Remark</th>
              <th className="p-3 w-32 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100/40 dark:divide-emerald-900/40 font-medium">
            {daysList.map((dItem) => {
              const entry = entryMap.get(dItem.dateStr);
              const hasData = entry && (entry.fromTime || entry.toTime || entry.totalHours > 0);
              const isFriday = dItem.dayName.toLowerCase().includes('fri') || dItem.dayName.includes('শুক্রবার');

              return (
                <tr
                  key={dItem.dateStr}
                  className={`transition hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 ${
                    hasData
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40'
                      : isFriday
                      ? 'bg-amber-50/50 dark:bg-amber-950/30'
                      : 'bg-white/80 dark:bg-slate-900/80'
                  }`}
                >
                  {/* Date number */}
                  <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                    <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                      hasData ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {dItem.dayNumber}
                    </span>
                  </td>

                  {/* Day Name */}
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    <span className={isFriday ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                      {dItem.dayName}
                    </span>
                  </td>

                  {/* Combined From & To Time Selector */}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleOpenTimePicker(dItem.dateStr, dItem.dayName, entry?.fromTime || '', entry?.toTime || '')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                        entry?.fromTime || entry?.toTime
                          ? 'bg-gradient-to-r from-emerald-50 via-white to-cyan-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-emerald-400 dark:border-emerald-600 text-slate-800 dark:text-slate-100 hover:border-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {entry?.fromTime || entry?.toTime ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">{entry.fromTime || '--:--'}</span>
                          <span className="text-slate-400 text-[10px]">➔</span>
                          <span className="text-cyan-700 dark:text-cyan-300 font-extrabold">{entry.toTime || '--:--'}</span>
                        </div>
                      ) : (
                        <span>{settings.language === 'bn' ? 'সময়সূচী নির্বাচন করুন (From - To)' : 'Select Time (From - To)'}</span>
                      )}
                    </button>
                  </td>

                  {/* Computed Total Hours */}
                  <td className="p-3 text-center font-extrabold text-sm">
                    {entry && entry.totalHours > 0 ? (
                      <span className="text-blue-600 dark:text-cyan-400 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                        {entry.totalHours.toFixed(1)} hrs
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700">-</span>
                    )}
                  </td>

                  {/* Remark Select/Input */}
                  <td className="p-2">
                    <select
                      disabled={isSubmitted}
                      value={(entry?.remark === 'Over Time') ? '' : (entry?.remark ?? '')}
                      onChange={(e) => handleRemarkChange(dItem.dateStr, dItem.dayName, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="">{settings.language === 'bn' ? '-- খালি (Blank / None) --' : '-- Blank / None --'}</option>
                      <option value="OFF / No OT (00)">OFF / No OT (00)</option>
                      <option value="Regular OT">Regular OT</option>
                      <option value="Holiday OT">Holiday OT</option>
                      <option value="Night Shift OT">Night Shift OT</option>
                      <option value="Double OT">Double OT</option>
                      <option value="Normal Work">Normal Work</option>
                      <option value="Driver Duty">Driver Duty</option>
                      <option value="Official Duty">Official Duty</option>
                      <option value="Over Time">Over Time</option>
                    </select>
                  </td>

                  {/* Quick Action / Presets */}
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={isSubmitted}
                        title="Set 00 (No OT)"
                        onClick={() => handleQuickPreset(dItem.dateStr, dItem.dayName, 'zero')}
                        className="px-2 py-1 text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                      >
                        🚫 00
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitted}
                        title="Quick 10 Hrs OT (08:00 AM - 06:00 PM)"
                        onClick={() => handleQuickPreset(dItem.dateStr, dItem.dayName, '10hrs')}
                        className="px-2 py-1 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 rounded-lg hover:bg-blue-200 transition"
                      >
                        +10h
                      </button>

                      {hasData && !isSubmitted && (
                        <button
                          type="button"
                          title="Clear entry"
                          onClick={() => onDeleteEntry(dItem.dateStr)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary Bar */}
      <div className="bg-emerald-950/80 dark:bg-emerald-950/90 border border-emerald-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-lg">
        
        {/* Total stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto text-center md:text-left">
          <div>
            <p className="text-[11px] text-emerald-200/80 font-semibold">{t.totalWorkingDays}</p>
            <p className="text-base font-extrabold text-white">{summary.totalWorkingDays} Days</p>
          </div>
          <div>
            <p className="text-[11px] text-emerald-200/80 font-semibold">{t.totalOtDays}</p>
            <p className="text-base font-extrabold text-amber-300">{summary.totalOtDays} Days</p>
          </div>
          <div>
            <p className="text-[11px] text-emerald-200/80 font-semibold">{t.totalOtHours}</p>
            <p className="text-base font-extrabold text-emerald-300">{summary.totalOtHours} Hours</p>
          </div>
          <div>
            <p className="text-[11px] text-emerald-200/80 font-semibold">{t.grandTotal}</p>
            <p className="text-base font-extrabold text-teal-200">{summary.grandTotalHours} Hours</p>
          </div>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-center md:justify-end">
          {isSubmitted ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.reportLocked}</span>
                {remainingDays !== null && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-medium">
                    {settings.language === 'bn' ? `(৭ দিন সংরক্ষণ, বাকি: ${remainingDays} দিন)` : `(1-wk save, ${remainingDays}d left)`}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={onUnlockReport}
                className="px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.unlockReport}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 border border-emerald-300/40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              <span>{t.submitReport}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPreview}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 border border-emerald-400/40 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t.previewReport} & {t.generatePdf}</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="py-2.5 px-3.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 border border-teal-500/40 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>.XLSX</span>
          </button>
        </div>

      </div>

      {/* Time Picker Modal Trigger */}
      <TimePickerModal
        isOpen={timePickerConfig.isOpen}
        onClose={() => setTimePickerConfig(prev => ({ ...prev, isOpen: false }))}
        dateStr={timePickerConfig.dateStr}
        dayName={timePickerConfig.dayName}
        initialFromTime12={timePickerConfig.initialFromTime}
        initialToTime12={timePickerConfig.initialToTime}
        onSelectTimeRange={handleSelectTimeRangeFromPicker}
        language={settings.language}
      />

      {/* Confirm Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              {t.confirmSubmitTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {t.confirmSubmitMsg}
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 mb-6 text-left flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 space-y-0.5">
                <p className="font-bold">
                  {settings.language === 'bn' ? '১ সপ্তাহের অটো-মেয়াদ (Auto-Expiry)' : '1-Week Auto-Expiry Protection'}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 leading-normal">
                  {settings.language === 'bn' 
                    ? 'সাবমিট ও লক করার পর ডাটা ১ সপ্তাহ (৭ দিন) পর্যন্ত নিরাপদ থাকবে। ১ সপ্তাহ পর ডাটাগুলো স্বয়ংক্রিয়ভাবে মুছে যাবে।'
                    : 'Once locked, data will be kept safely for 1 week (7 days) and automatically cleared after 7 days.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                {t.noCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmitReport();
                  setShowSubmitModal(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition cursor-pointer"
              >
                {t.yesSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

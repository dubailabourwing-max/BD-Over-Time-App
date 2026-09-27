import React from 'react';
import { 
  Clock, 
  CalendarCheck, 
  Award, 
  TrendingUp, 
  FileCheck2, 
  FileSpreadsheet, 
  UserCheck,
  X
} from 'lucide-react';
import { Profile, MonthSummary, AppSettings } from '../types';
import { TRANSLATIONS, MONTH_NAMES_EN, MONTH_NAMES_BN } from '../utils/timeCalculations';

interface DashboardProps {
  activeProfile: Profile;
  year: number;
  month: number;
  summary: MonthSummary;
  totalPdfCount: number;
  settings: AppSettings;
  onOpenPreview: () => void;
  onExportExcel: () => void;
  onClose?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeProfile,
  year,
  month,
  summary,
  totalPdfCount,
  settings,
  onOpenPreview,
  onExportExcel,
  onClose,
}) => {
  const t = TRANSLATIONS[settings.language];
  const monthName = settings.language === 'bn' ? MONTH_NAMES_BN[month - 1] : MONTH_NAMES_EN[month - 1];

  return (
    <div className="bg-[#022b1e] text-emerald-50 rounded-[26px] p-4 sm:p-5 shadow-2xl border border-[#0d5038] relative overflow-hidden mb-6 animate-fade-in">
      {/* Background Decorative Green Hills Glow */}
      <div className="absolute -top-10 -right-10 w-56 h-56 bg-[#00d68f]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#00c985]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#0d553d] relative z-10">
        <div className="flex items-center gap-3">
          {/* Avatar Circle with Bright Mint Ring */}
          <div className="w-11 h-11 rounded-full bg-[#033b2a] border-2 border-[#00d68f] text-[#00d68f] font-bold text-base flex items-center justify-center shrink-0 shadow-md">
            {activeProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">{activeProfile.name}</h2>
              <span className="bg-[#084832] border border-[#0f684a] text-emerald-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                {activeProfile.employeeId || 'EMP-1001'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-3.5 h-3.5 text-[#00d68f]" />
              <span>{activeProfile.designation || 'Driver'} • {activeProfile.department || 'Labour Wing, Dubai, UAE.'}</span>
            </p>
          </div>
        </div>

        {/* Current Period Badge & Close Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-[#043323] border border-[#0c5c40] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#00d68f]" />
            <span className="text-xs font-semibold text-emerald-100">
              {monthName} {year}
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close Dashboard"
              className="p-1.5 rounded-full bg-[#043323] hover:bg-rose-900/60 text-emerald-300 hover:text-white border border-[#0c5c40] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Grid (Exact Image 1 layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 mb-4">
        {/* Working Days */}
        <div className="bg-[#033324] border border-[#0c593f] p-3.5 rounded-2xl flex flex-col justify-between hover:border-[#00d68f]/40 transition shadow-sm">
          <div className="flex items-center justify-between text-emerald-200/90 mb-2">
            <span className="text-[11px] font-semibold">{t.totalWorkingDays}</span>
            <CalendarCheck className="w-4 h-4 text-[#00d68f]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{summary.totalWorkingDays}</span>
            <span className="text-xs text-emerald-300/70 font-medium">Days</span>
          </div>
        </div>

        {/* OT Days */}
        <div className="bg-[#033324] border border-[#0c593f] p-3.5 rounded-2xl flex flex-col justify-between hover:border-[#e2b024]/40 transition shadow-sm">
          <div className="flex items-center justify-between text-[#e2b024] mb-2">
            <span className="text-[11px] font-semibold">{t.totalOtDays}</span>
            <Award className="w-4 h-4 text-[#e2b024]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#e2b024]">{summary.totalOtDays}</span>
            <span className="text-xs text-emerald-300/70 font-medium">Days</span>
          </div>
        </div>

        {/* Total OT Hours */}
        <div className="bg-[#033324] border border-[#0c593f] p-3.5 rounded-2xl flex flex-col justify-between hover:border-[#00d68f]/40 transition shadow-sm">
          <div className="flex items-center justify-between text-emerald-200/90 mb-2">
            <span className="text-[11px] font-semibold">{t.totalOtHours}</span>
            <TrendingUp className="w-4 h-4 text-[#00d68f]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{summary.totalOtHours}</span>
            <span className="text-xs text-emerald-300/70 font-medium">Hrs</span>
          </div>
        </div>

        {/* Saved PDFs */}
        <div className="bg-[#033324] border border-[#0c593f] p-3.5 rounded-2xl flex flex-col justify-between hover:border-[#00d68f]/40 transition shadow-sm">
          <div className="flex items-center justify-between text-emerald-200/90 mb-2">
            <span className="text-[11px] font-semibold">{t.totalPdfCount}</span>
            <FileCheck2 className="w-4 h-4 text-[#00d68f]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{totalPdfCount}</span>
            <span className="text-xs text-emerald-300/70 font-medium">Reports</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Exact Image 1 layout at bottom) */}
      <div className="flex items-center gap-3 relative z-10 pt-1">
        <button
          type="button"
          onClick={onOpenPreview}
          className="flex-1 bg-gradient-to-r from-[#00c985] to-[#00d892] hover:brightness-110 text-[#022118] font-bold text-xs sm:text-sm py-3 px-5 rounded-full shadow-lg shadow-[#00c985]/20 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{t.previewReport} & {t.generatePdf}</span>
        </button>

        <button
          type="button"
          onClick={onExportExcel}
          className="bg-[#033d2b] hover:bg-[#054b35] text-[#10ce8b] font-extrabold text-xs sm:text-sm py-3 px-4.5 rounded-2xl border border-[#0d6447] transition flex items-center justify-center gap-1.5 active:scale-98 shadow cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>.XLSX</span>
        </button>
      </div>
    </div>
  );
};

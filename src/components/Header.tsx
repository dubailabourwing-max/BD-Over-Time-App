import React from 'react';
import { 
  UserPlus, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Globe, 
  Moon, 
  Sun,
  FileText,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Profile, AppSettings } from '../types';
import { TRANSLATIONS } from '../utils/timeCalculations';
import consulateLogo from '../assets/images/bd_consulate_3d_logo_1785444672392.jpg';

interface HeaderProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenCreateProfile: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenPdfHistory: () => void;
  onOpenChat: () => void;
  onOpenInstallApp: () => void;
  activeChatCount?: number;
  onLockApp: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenCreateProfile,
  onOpenSettings,
  onOpenSearch,
  onOpenPdfHistory,
  onOpenChat,
  onOpenInstallApp,
  activeChatCount = 0,
  onLockApp,
  settings,
  onUpdateSettings,
}) => {
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const t = TRANSLATIONS[settings.language];

  const toggleLanguage = () => {
    const nextLang = settings.language === 'en' ? 'bn' : 'en';
    onUpdateSettings({ ...settings, language: nextLang });
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative group cursor-pointer" onClick={onOpenSettings} title="Open Settings">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={consulateLogo}
              alt="Bangladesh Consulate Logo"
              referrerPolicy="no-referrer"
              className="relative w-10 h-10 rounded-full object-cover shadow-md border-2 border-emerald-500/40"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
              <span>Bangladesh Consulate General</span>
            </h1>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[200px] sm:max-w-[280px]">
              Labour Welfare Wing, Dubai, UAE
            </p>
          </div>
        </div>

        {/* Center: Profile Switcher Bar */}
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-1 rounded-2xl">
          <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400 ml-1.5 shrink-0" />
          <select
            value={activeProfileId}
            onChange={(e) => {
              if (e.target.value === '__NEW__') {
                onOpenCreateProfile();
              } else {
                onSelectProfile(e.target.value);
              }
            }}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1 py-1"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {p.name} ({p.employeeId || 'Staff'})
              </option>
            ))}
            <option value="__NEW__" className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
              + {t.createProfile}
            </option>
          </select>

          <button
            type="button"
            onClick={onOpenCreateProfile}
            title={t.createProfile}
            className="p-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Install App Button */}
          <button
            type="button"
            onClick={onOpenInstallApp}
            title={settings.language === 'bn' ? 'মোবাইল অ্যাপ ইনস্টল করুন' : 'Install Mobile App'}
            className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 transition flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">{settings.language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
          </button>

          {/* Team Chat Button */}
          <button
            type="button"
            onClick={onOpenChat}
            title={settings.language === 'bn' ? 'টিম চ্যাট (৩০ মি. অটো রিমুভ)' : 'Team Chat (30 Min Auto-Clean)'}
            className="relative p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
            <span className="hidden md:inline">{settings.language === 'bn' ? 'টিম চ্যাট' : 'Chat'}</span>
            {activeChatCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md animate-bounce">
                {activeChatCount}
              </span>
            )}
          </button>

          {/* PDF History */}
          <button
            type="button"
            onClick={onOpenPdfHistory}
            title={t.pdfHistory}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Search */}
          <button
            type="button"
            onClick={onOpenSearch}
            title={t.search}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={t.language}
            className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>{settings.language.toUpperCase()}</span>
          </button>

          {/* Dark/Light Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={t.darkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={t.settings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={onLockApp}
            title={settings.language === 'bn' ? 'লগ আউট' : 'Log Out'}
            className="py-2 px-3.5 sm:px-4 rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition flex items-center gap-2 text-xs sm:text-sm font-extrabold shadow-md ml-1.5 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>{settings.language === 'bn' ? 'লগ আউট' : 'Log Out'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};

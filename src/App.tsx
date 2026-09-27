import React, { useState, useEffect } from 'react';
import { PinLock } from './components/PinLock';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DailyEntryTable } from './components/DailyEntryTable';
import { ProfileManager } from './components/ProfileManager';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { PdfHistoryModal } from './components/PdfHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { SearchFilterModal } from './components/SearchFilterModal';
import { TeamChatModal } from './components/TeamChatModal';
import { PwaInstallModal } from './components/PwaInstallModal';

import { LayoutDashboard, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { StorageEngine } from './utils/storage';
import { ChatStorage } from './utils/chatStorage';
import { calculateMonthSummary, TRANSLATIONS } from './utils/timeCalculations';
import { downloadPdf, generatePdfBlob } from './utils/exportPdf';
import { exportToExcel } from './utils/exportExcel';
import { Profile, OvertimeEntry, MonthlyReport, PdfHistoryItem, AppSettings } from './types';

export default function App() {
  // Lock state (starts locked by default so PIN lock dashboard always appears on link open/reload)
  const [isLocked, setIsLocked] = useState(true);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => StorageEngine.getSettings());

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>(() => StorageEngine.getProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => StorageEngine.getActiveProfileId());

  // Month & Year selection (default to July 2026 per prompt)
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(7);

  // Entries for active profile, month, year
  const [entries, setEntries] = useState<OvertimeEntry[]>([]);
  const [reportStatus, setReportStatus] = useState<MonthlyReport>({
    id: '',
    profileId: '',
    year: 2026,
    month: 7,
    isSubmitted: false
  });

  // PDF History
  const [pdfHistory, setPdfHistory] = useState<PdfHistoryItem[]>(() => StorageEngine.getPdfHistory());

  // Modals & View state
  const [showDashboard, setShowDashboard] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPdfHistoryModalOpen, setIsPdfHistoryModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [activeChatCount, setActiveChatCount] = useState<number>(() => ChatStorage.getMessages().length);

  // Subscribe to Chat updates for Header badge count
  useEffect(() => {
    const updateCount = () => {
      setActiveChatCount(ChatStorage.getMessages().length);
    };
    updateCount();
    const unsubscribe = ChatStorage.subscribe(updateCount);
    return () => unsubscribe();
  }, []);

  // Theme Syncing
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Load entries when profile, month, or year changes
  useEffect(() => {
    if (!activeProfileId) return;

    const loadedEntries = StorageEngine.getEntries(activeProfileId, year, month);
    setEntries(loadedEntries);

    const status = StorageEngine.getReportStatus(activeProfileId, year, month);
    setReportStatus(status);
  }, [activeProfileId, year, month]);

  // Periodic cleanup check for expired submitted reports (> 7 days)
  useEffect(() => {
    const runExpiryCheck = () => {
      const cleaned = StorageEngine.cleanupExpiredReports();
      if (cleaned && activeProfileId) {
        setEntries(StorageEngine.getEntries(activeProfileId, year, month));
        setReportStatus(StorageEngine.getReportStatus(activeProfileId, year, month));
      }
    };

    runExpiryCheck();
    const interval = setInterval(runExpiryCheck, 60000);
    window.addEventListener('focus', runExpiryCheck);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', runExpiryCheck);
    };
  }, [activeProfileId, year, month]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
    id: 'prof_1',
    name: 'Abdul Kader',
    employeeId: 'EMP-1001',
    designation: 'Driver',
    department: 'Labour Wing, Dubai, UAE.',
    createdAt: new Date().toISOString()
  };

  const summary = calculateMonthSummary(entries);

  // Handlers
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    StorageEngine.setActiveProfileId(id);
  };

  const handleCreateProfile = (name: string, empId?: string, desig?: string, dept?: string) => {
    const newProf = StorageEngine.addProfile(name, empId, desig, dept);
    setProfiles(StorageEngine.getProfiles());
    handleSelectProfile(newProf.id);
  };

  const handleUpdateProfile = (updated: Profile) => {
    StorageEngine.updateProfile(updated);
    setProfiles(StorageEngine.getProfiles());
  };

  const handleDeleteProfile = (id: string) => {
    StorageEngine.deleteProfile(id);
    const remaining = StorageEngine.getProfiles();
    setProfiles(remaining);
    if (remaining.length > 0) {
      handleSelectProfile(remaining[0].id);
    }
  };

  const handleSaveEntry = (entry: OvertimeEntry) => {
    StorageEngine.saveEntry(entry);
    setEntries(StorageEngine.getEntries(activeProfileId, year, month));
  };

  const handleDeleteEntry = (dateStr: string) => {
    StorageEngine.deleteEntry(activeProfileId, dateStr);
    setEntries(StorageEngine.getEntries(activeProfileId, year, month));
  };

  const handleSubmitReport = () => {
    StorageEngine.setReportStatus(activeProfileId, year, month, true);
    setReportStatus(StorageEngine.getReportStatus(activeProfileId, year, month));
  };

  const handleUnlockReport = () => {
    StorageEngine.setReportStatus(activeProfileId, year, month, false);
    setReportStatus(StorageEngine.getReportStatus(activeProfileId, year, month));
  };

  const handleExportExcelAction = () => {
    exportToExcel(activeProfile, year, month, entries, summary, settings);
  };

  const handleConfirmGeneratePdf = () => {
    downloadPdf(activeProfile, year, month, entries, summary, settings);

    // Save history record
    const historyItem: PdfHistoryItem = {
      id: `pdf_hist_${Date.now()}`,
      profileId: activeProfile.id,
      fileName: `${activeProfile.name.replace(/\s+/g, '_')}_${month}_${year}.pdf`,
      month: `${month}`,
      year,
      generatedAt: new Date().toISOString(),
      totalHours: summary.totalOtHours,
      totalDays: summary.totalWorkingDays
    };

    StorageEngine.addPdfHistory(historyItem);
    setPdfHistory(StorageEngine.getPdfHistory());
    setIsPreviewModalOpen(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    StorageEngine.deletePdfHistory(id);
    setPdfHistory(StorageEngine.getPdfHistory());
  };

  const handleRedownloadHistory = (item: PdfHistoryItem) => {
    const historyMonth = parseInt(item.month, 10) || month;
    const historyEntries = StorageEngine.getEntries(item.profileId, item.year, historyMonth);
    const historySummary = calculateMonthSummary(historyEntries);

    downloadPdf(activeProfile, item.year, historyMonth, historyEntries, historySummary, settings);
  };

  // Lock Screen Check
  if (isLocked) {
    return <PinLock onUnlock={() => setIsLocked(false)} language={settings.language} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-slate-100 transition-colors font-sans pb-12 relative overflow-x-hidden">
      
      {/* Background Green Hills Ambient Glow */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* App Header */}
      <Header
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onOpenCreateProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenPdfHistory={() => setIsPdfHistoryModalOpen(true)}
        onOpenChat={() => setIsChatModalOpen(true)}
        onOpenInstallApp={() => setIsPwaModalOpen(true)}
        activeChatCount={activeChatCount}
        onLockApp={() => setIsLocked(true)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-4">
        
        {/* Top Header Corner Dashboard Toggle */}
        <div className="flex items-center justify-between gap-3 mb-4 bg-slate-900/40 p-2.5 px-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">
              {activeProfile.name} ({activeProfile.designation || 'Driver'})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDashboard(!showDashboard)}
            className="py-1.5 px-3.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl shadow transition flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {showDashboard 
                ? (settings.language === 'bn' ? 'ড্যাশবোর্ড হাইড করুন' : 'Hide Dashboard') 
                : (settings.language === 'bn' ? '📊 ড্যাশবোর্ড দেখুন' : '📊 View Dashboard')}
            </span>
            <span className="bg-emerald-950 text-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
              {summary.totalOtHours} Hrs
            </span>
            {showDashboard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Dashboard Overview */}
        {showDashboard && (
          <Dashboard
            activeProfile={activeProfile}
            year={year}
            month={month}
            summary={summary}
            totalPdfCount={pdfHistory.filter(h => h.profileId === activeProfile.id).length}
            settings={settings}
            onOpenPreview={() => setIsPreviewModalOpen(true)}
            onExportExcel={handleExportExcelAction}
            onClose={() => setShowDashboard(false)}
          />
        )}

        {/* Daily Entry Table */}
        <DailyEntryTable
          activeProfile={activeProfile}
          year={year}
          month={month}
          onYearChange={setYear}
          onMonthChange={setMonth}
          entries={entries}
          summary={summary}
          isSubmitted={reportStatus.isSubmitted}
          submittedAt={reportStatus.submittedAt}
          onSaveEntry={handleSaveEntry}
          onDeleteEntry={handleDeleteEntry}
          onSubmitReport={handleSubmitReport}
          onUnlockReport={handleUnlockReport}
          onOpenPreview={() => setIsPreviewModalOpen(true)}
          onExportExcel={handleExportExcelAction}
          settings={settings}
        />

      </main>

      {/* Modals */}

      {/* Profile Manager Modal */}
      <ProfileManager
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onUpdateProfile={handleUpdateProfile}
        onDeleteProfile={handleDeleteProfile}
        settings={settings}
      />

      {/* PDF Full Live Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        profile={activeProfile}
        year={year}
        month={month}
        entries={entries}
        summary={summary}
        settings={settings}
        onEditFromPreview={() => {
          setIsPreviewModalOpen(false);
          setTimeout(() => {
            const el = document.getElementById('daily-entry-table');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }}
        onConfirmGeneratePdf={handleConfirmGeneratePdf}
        onExportExcel={handleExportExcelAction}
      />

      {/* PDF History Modal */}
      <PdfHistoryModal
        isOpen={isPdfHistoryModalOpen}
        onClose={() => setIsPdfHistoryModalOpen(false)}
        activeProfile={activeProfile}
        pdfHistory={pdfHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onRedownloadHistory={handleRedownloadHistory}
        settings={settings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => {
          setSettings(newSet);
          StorageEngine.saveSettings(newSet);
        }}
      />

      {/* Search & Filter Modal */}
      <SearchFilterModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        profiles={profiles}
        settings={settings}
        onSelectSearchResult={(profId, yr, mo) => {
          handleSelectProfile(profId);
          setYear(yr);
          setMonth(mo);
        }}
      />

      {/* Team Chat Modal */}
      <TeamChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        settings={settings}
      />

      {/* PWA / Mobile Install Guide Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        settings={settings}
      />

    </div>
  );
}

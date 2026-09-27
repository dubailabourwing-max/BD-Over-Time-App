import { Profile, OvertimeEntry, MonthlyReport, PdfHistoryItem, AppSettings } from '../types';

export const REPORT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 1 week (7 days) in milliseconds

const STORAGE_KEYS = {
  PIN: 'otbd_app_pin',
  PROFILES: 'otbd_profiles',
  ACTIVE_PROFILE_ID: 'otbd_active_profile_id',
  ENTRIES: 'otbd_overtime_entries',
  REPORTS: 'otbd_monthly_reports',
  PDF_HISTORY: 'otbd_pdf_history',
  SETTINGS: 'otbd_settings',
};

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'prof_1',
    name: 'Abdul Kader',
    employeeId: 'EMP-1001',
    designation: 'Driver',
    department: 'Labour Welfare Wing, Dubai, UAE.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_2',
    name: 'Mohammed Saiful Alam',
    employeeId: 'EMP-1002',
    designation: 'Driver',
    department: 'Labour Welfare Wing, Dubai, UAE.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof_3',
    name: 'Abul Kalam Ajad',
    employeeId: 'EMP-1003',
    designation: 'Driver',
    department: 'Labour Welfare Wing, Dubai, UAE.',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  pin: '4336',
  companyName: 'Bangladesh Consulate General',
  department: 'Labour Welfare Wing, Dubai, UAE.',
  companyAddress: 'Dubai, UAE',
  companyPhone: '+971 4 238 8199',
  companyLogoUrl: '',
  footerText: 'Certified that duties were official and do not include any private duty.',
  signatureName: 'Authorized Signatory',
  signatureDesignation: 'Labour Welfare Wing',
  footerNote: 'Bangladesh Consulate General, Dubai, UAE.',
  showPrintedDate: true,
  theme: 'light',
  language: 'en'
};

/**
 * Storage Engine Helper
 */
export const StorageEngine = {
  // PIN
  getPin(): string {
    return localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_SETTINGS.pin;
  },
  setPin(pin: string): void {
    localStorage.setItem(STORAGE_KEYS.PIN, pin);
  },

  // PROFILES
  getProfiles(): Profile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      this.setProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILES;
    }
  },
  setProfiles(profiles: Profile[]): void {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  },
  addProfile(name: string, employeeId?: string, designation?: string, department?: string): Profile {
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      id: `prof_${Date.now()}`,
      name,
      employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: designation || 'Technician',
      department: department || 'General',
      createdAt: new Date().toISOString()
    };
    profiles.push(newProfile);
    this.setProfiles(profiles);
    return newProfile;
  },
  updateProfile(updated: Profile): void {
    const profiles = this.getProfiles().map(p => p.id === updated.id ? updated : p);
    this.setProfiles(profiles);
  },
  deleteProfile(id: string): void {
    const profiles = this.getProfiles().filter(p => p.id !== id);
    this.setProfiles(profiles);
  },

  // ACTIVE PROFILE ID
  getActiveProfileId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    const profiles = this.getProfiles();
    if (active && profiles.some(p => p.id === active)) {
      return active;
    }
    return profiles[0]?.id || 'prof_1';
  },
  setActiveProfileId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
  },

  // 1-WEEK EXPIRY ENGINE
  // Automatically purges report data and unlocks report after 1 week (7 days)
  cleanupExpiredReports(): boolean {
    const rawReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!rawReports) return false;

    let reports: MonthlyReport[] = [];
    try {
      reports = JSON.parse(rawReports);
    } catch {
      return false;
    }

    const now = Date.now();
    const expiredReports = reports.filter(r => {
      if (!r.isSubmitted || !r.submittedAt) return false;
      const subTime = new Date(r.submittedAt).getTime();
      return !isNaN(subTime) && (now - subTime >= REPORT_RETENTION_MS);
    });

    if (expiredReports.length === 0) return false;

    // Purge entries belonging to expired reports
    const rawEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    let allEntries: OvertimeEntry[] = [];
    if (rawEntries) {
      try {
        allEntries = JSON.parse(rawEntries);
      } catch {
        allEntries = [];
      }
    }

    let entriesModified = false;
    expiredReports.forEach(exp => {
      const monthPad = exp.month.toString().padStart(2, '0');
      const prefix = `${exp.year}-${monthPad}`;
      const beforeCount = allEntries.length;
      allEntries = allEntries.filter(e => !(e.profileId === exp.profileId && e.dateStr.startsWith(prefix)));
      if (allEntries.length !== beforeCount) {
        entriesModified = true;
      }
    });

    if (entriesModified) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(allEntries));
    }

    // Reset the expired reports so they are unlocked and cleared
    const updatedReports = reports.map(r => {
      const isExp = expiredReports.some(exp => exp.id === r.id);
      if (isExp) {
        return {
          ...r,
          isSubmitted: false,
          submittedAt: undefined
        };
      }
      return r;
    });

    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));
    return true;
  },

  // OVERTIME ENTRIES
  getEntries(profileId?: string, year?: number, month?: number): OvertimeEntry[] {
    this.cleanupExpiredReports();
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    let allEntries: OvertimeEntry[] = [];
    if (raw) {
      try {
        allEntries = JSON.parse(raw);
        // Automatically normalize any legacy "Over Time" to blank ""
        let modified = false;
        allEntries = allEntries.map(entry => {
          if (entry.remark === 'Over Time') {
            modified = true;
            return { ...entry, remark: '' };
          }
          return entry;
        });
        if (modified) {
          localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(allEntries));
        }
      } catch {
        allEntries = [];
      }
    }

    if (!profileId) return allEntries;

    return allEntries.filter(entry => {
      if (entry.profileId !== profileId) return false;
      if (year && month) {
        const monthPad = month.toString().padStart(2, '0');
        return entry.dateStr.startsWith(`${year}-${monthPad}`);
      }
      return true;
    });
  },

  saveEntry(entry: OvertimeEntry): void {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    let allEntries: OvertimeEntry[] = raw ? JSON.parse(raw) : [];

    // Normalize 'Over Time' remark to blank ''
    const sanitizedEntry = {
      ...entry,
      remark: entry.remark === 'Over Time' ? '' : (entry.remark || '')
    };

    const index = allEntries.findIndex(
      e => e.profileId === sanitizedEntry.profileId && e.dateStr === sanitizedEntry.dateStr
    );

    if (index >= 0) {
      allEntries[index] = { ...sanitizedEntry, updatedAt: new Date().toISOString() };
    } else {
      allEntries.push({ ...sanitizedEntry, updatedAt: new Date().toISOString() });
    }

    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(allEntries));
  },

  saveMultipleEntries(entries: OvertimeEntry[]): void {
    entries.forEach(entry => this.saveEntry(entry));
  },

  deleteEntry(profileId: string, dateStr: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) return;
    let allEntries: OvertimeEntry[] = JSON.parse(raw);
    allEntries = allEntries.filter(e => !(e.profileId === profileId && e.dateStr === dateStr));
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(allEntries));
  },

  // MONTHLY REPORT LOCK
  getReportStatus(profileId: string, year: number, month: number): MonthlyReport {
    this.cleanupExpiredReports();
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    let reports: MonthlyReport[] = raw ? JSON.parse(raw) : [];
    const found = reports.find(r => r.profileId === profileId && r.year === year && r.month === month);
    if (found) return found;

    return {
      id: `report_${profileId}_${year}_${month}`,
      profileId,
      year,
      month,
      isSubmitted: false
    };
  },

  setReportStatus(profileId: string, year: number, month: number, isSubmitted: boolean): void {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    let reports: MonthlyReport[] = raw ? JSON.parse(raw) : [];
    const index = reports.findIndex(r => r.profileId === profileId && r.year === year && r.month === month);

    const reportObj: MonthlyReport = {
      id: `report_${profileId}_${year}_${month}`,
      profileId,
      year,
      month,
      isSubmitted,
      submittedAt: isSubmitted ? new Date().toISOString() : undefined
    };

    if (index >= 0) {
      reports[index] = reportObj;
    } else {
      reports.push(reportObj);
    }

    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  // PDF HISTORY
  getPdfHistory(profileId?: string): PdfHistoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PDF_HISTORY);
    let history: PdfHistoryItem[] = raw ? JSON.parse(raw) : [];
    if (profileId) {
      return history.filter(h => h.profileId === profileId);
    }
    return history;
  },

  addPdfHistory(item: PdfHistoryItem): void {
    const history = this.getPdfHistory();
    history.unshift(item); // top most recent
    localStorage.setItem(STORAGE_KEYS.PDF_HISTORY, JSON.stringify(history));
  },

  deletePdfHistory(id: string): void {
    let history = this.getPdfHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.PDF_HISTORY, JSON.stringify(history));
  },

  // SETTINGS
  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.pin) {
      this.setPin(settings.pin);
    }
  },

  // BACKUP & RESTORE
  exportBackupData(): string {
    const rawReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profiles: this.getProfiles(),
      entries: this.getEntries(),
      reports: rawReports ? JSON.parse(rawReports) : [],
      settings: this.getSettings(),
      pdfHistory: this.getPdfHistory(),
      pin: this.getPin()
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profiles && Array.isArray(data.profiles)) {
        this.setProfiles(data.profiles);
      }
      if (data.entries && Array.isArray(data.entries)) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries));
      }
      if (data.reports && Array.isArray(data.reports)) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.pdfHistory && Array.isArray(data.pdfHistory)) {
        localStorage.setItem(STORAGE_KEYS.PDF_HISTORY, JSON.stringify(data.pdfHistory));
      }
      if (data.pin) {
        this.setPin(data.pin);
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  }
};

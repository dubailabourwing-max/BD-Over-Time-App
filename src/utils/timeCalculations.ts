import { OvertimeEntry, MonthSummary } from '../types';

export const VALID_YEARS = [2026, 2027, 2028, 2029, 2030];

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

/**
 * Calculates hours difference between two time strings like "08:00 AM" and "06:00 PM"
 */
export function calculateHours(fromTime: string, toTime: string): number {
  if (!fromTime || !toTime) return 0;

  const parseTimeToMinutes = (timeStr: string): number | null => {
    const trimmed = timeStr.trim();
    if (!trimmed) return null;

    // Handle 12-hour format with AM/PM (e.g., "08:00 AM", "6:30 PM", "08:00")
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period) {
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }

    return hours * 60 + minutes;
  };

  const startMins = parseTimeToMinutes(fromTime);
  const endMins = parseTimeToMinutes(toTime);

  if (startMins === null || endMins === null) return 0;

  let diffMins = endMins - startMins;
  if (diffMins < 0) {
    // Crosses midnight
    diffMins += 24 * 60;
  }

  const hours = diffMins / 60;
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
}

/**
 * Format 24h time to 12h format e.g. "08:00" -> "08:00 AM", "18:00" -> "06:00 PM"
 */
export function format12Hour(time24: string): string {
  if (!time24) return '';
  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const padHours = hours.toString().padStart(2, '0');
  return `${padHours}:${minutes} ${period}`;
}

/**
 * Convert 12h time string back to 24h format for input pickers e.g. "06:00 PM" -> "18:00"
 */
export function convertTo24Hour(time12: string): string {
  if (!time12) return '08:00';
  const match = time12.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return '08:00';

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period) {
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Generate default array of dates for a given month & year
 * Month is 1-indexed (1 = January, 12 = December)
 */
export function generateDaysForMonth(year: number, month: number, language: 'en' | 'bn' = 'en') {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysList = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeekIndex = dateObj.getDay();
    
    const dayPad = day.toString().padStart(2, '0');
    const monthPad = month.toString().padStart(2, '0');
    const dateStr = `${year}-${monthPad}-${dayPad}`;

    const dayName = language === 'bn' 
      ? DAY_NAMES_BN[dayOfWeekIndex] 
      : DAY_NAMES_EN[dayOfWeekIndex];

    const formattedDisplayDate = `${dayPad} ${language === 'bn' ? MONTH_NAMES_BN[month - 1] : MONTH_NAMES_EN[month - 1].substring(0, 3)} ${year}`;

    daysList.push({
      dayNumber: dayPad,
      dayName,
      dateStr,
      formattedDisplayDate
    });
  }

  return daysList;
}

/**
 * Calculate summary metrics for a list of overtime entries
 */
export function calculateMonthSummary(entries: OvertimeEntry[]): MonthSummary {
  let totalWorkingDays = 0;
  let totalOtDays = 0;
  let totalOtHours = 0;

  entries.forEach((entry) => {
    const hasTime = (entry.fromTime && entry.toTime) || entry.totalHours > 0;
    if (hasTime) {
      totalWorkingDays++;
    }
    if (entry.totalHours > 0 || (entry.remark && entry.remark.toLowerCase().includes('ot'))) {
      totalOtDays++;
      totalOtHours += entry.totalHours;
    }
  });

  return {
    totalWorkingDays,
    totalOtDays,
    totalOtHours: Math.round(totalOtHours * 100) / 100,
    grandTotalHours: Math.round(totalOtHours * 100) / 100
  };
}

export function getExpiryRemainingDays(submittedAt?: string): number | null {
  if (!submittedAt) return null;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(submittedAt).getTime();
  const remaining = SEVEN_DAYS_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

/**
 * Translations Dictionary (Bengali & English)
 */
export const TRANSLATIONS = {
  en: {
    appName: 'Over Time BD',
    loginPin: 'Enter PIN to unlock',
    wrongPin: 'Incorrect PIN! Please try again.',
    defaultPinHint: 'Protected by Security PIN',
    profiles: 'Profiles',
    createProfile: '+ Create New Profile',
    selectProfile: 'Select Employee Profile',
    year: 'Year',
    month: 'Month',
    dashboard: 'Dashboard',
    dailyEntries: 'Daily Entries',
    summary: 'Monthly Summary',
    pdfHistory: 'PDF History',
    settings: 'Settings',
    search: 'Search',
    totalWorkingDays: 'Total Working Days',
    totalOtDays: 'Total OT Days',
    totalOtHours: 'Total OT Hours',
    grandTotal: 'Grand Total Hours',
    submitReport: 'Submit & Lock Report',
    unlockReport: 'Unlock & Edit',
    reportLocked: 'Report Locked',
    generatePdf: 'Generate PDF',
    exportExcel: 'Export Excel',
    previewReport: 'Preview Report',
    date: 'Date',
    day: 'Day',
    fromTime: 'From Time',
    toTime: 'To Time',
    hours: 'Total Hours',
    remark: 'Remark',
    action: 'Action',
    edit: 'Edit',
    delete: 'Delete',
    print: 'Print',
    shareWhatsapp: 'Share via WhatsApp',
    cancel: 'Cancel',
    save: 'Save Changes',
    confirmSubmitTitle: 'Lock & Submit Monthly Report (Saved for 1 Week)?',
    confirmSubmitMsg: "Once submitted and locked, this month's overtime data will stay securely saved for 1 week (7 days). After 1 week, it will automatically expire and clear. You can still unlock and edit anytime before expiry.",
    yesSubmit: 'Yes, Submit',
    noCancel: 'No, Keep Editing',
    noEntriesFound: 'No entries recorded for this month yet. Use the table below to start adding times!',
    companySettings: 'Company & PDF Header Settings',
    footerSettings: 'PDF Footer & Signatures',
    changePin: 'Change App PIN',
    backupData: 'Backup & Restore Data',
    exportBackup: 'Export Backup (JSON)',
    importBackup: 'Restore Backup',
    darkMode: 'Dark Mode',
    language: 'Language',
    todayEntries: "Today's Status",
    thisMonthHours: "This Month Hours",
    totalPdfCount: 'Saved PDFs',
    quickFill: 'Quick Fill Preset',
    normalOt: 'Over Time (10 Hrs)',
    holidayOt: 'Holiday OT',
    nightOt: 'Night Shift OT',
  },
  bn: {
    appName: 'ওভার টাইম বিডি',
    loginPin: 'অ্যাপ আনলক করতে পিন দিন',
    wrongPin: 'ভুল পিন! সঠিক পিন দিয়ে আবার চেষ্টা করুন।',
    defaultPinHint: 'সিকিউরিটি পিন দ্বারা সুরক্ষিত',
    profiles: 'প্রোফাইলসমূহ',
    createProfile: '+ নতুন প্রোফাইল তৈরি করুন',
    selectProfile: 'কর্মচারী প্রোফাইল নির্বাচন করুন',
    year: 'বছর',
    month: 'মাস',
    dashboard: 'ড্যাশবোর্ড',
    dailyEntries: 'দৈনিক এন্ট্রি',
    summary: 'মাসিক সামারি',
    pdfHistory: 'পিডিএফ হিস্ট্রি',
    settings: 'সেটিংস',
    search: 'অনুসন্ধান',
    totalWorkingDays: 'মোট কর্মদিবস',
    totalOtDays: 'মোট ওভারটাইম দিন',
    totalOtHours: 'মোট ওভারটাইম ঘণ্টা',
    grandTotal: 'সর্বমোট ওভারটাইম ঘণ্টা',
    submitReport: 'রিপোর্ট সাবমিট ও লক করুন',
    unlockReport: 'আনলক করে এডিট করুন',
    reportLocked: 'রিপোর্ট লক করা হয়েছে',
    generatePdf: 'পিডিএফ তৈরি করুন',
    exportExcel: 'এক্সেল ডাউনলোড করুন',
    previewReport: 'প্রিভিউ রিপোর্ট',
    date: 'তারিখ',
    day: 'দিন',
    fromTime: 'শুরুর সময়',
    toTime: 'শেষের সময়',
    hours: 'মোট ঘণ্টা',
    remark: 'মন্তব্য',
    action: 'অ্যাকশন',
    edit: 'এডিট',
    delete: 'মুছুন',
    print: 'প্রিন্ট',
    shareWhatsapp: 'হোয়াটসঅ্যাপ শেয়ার',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ করুন',
    confirmSubmitTitle: 'রিপোর্ট সাবমিট ও লক করবেন (১ সপ্তাহ সংরক্ষণ)?',
    confirmSubmitMsg: 'সাবমিট ও লক করার পর এই মাসের ওভারটাইম ডাটাটি ১ সপ্তাহ (৭ দিন) পর্যন্ত সংরক্ষিত থাকবে। ১ সপ্তাহ পর ডাটাগুলো স্বয়ংক্রিয়ভাবে মুছে যাবে। প্রয়োজন হলে এর মাঝেও আপনি আনলক করে এডিট করতে পারবেন।',
    yesSubmit: 'হ্যাঁ, সাবমিট করুন',
    noCancel: 'না, এডিট চালু রাখুন',
    noEntriesFound: 'এই মাসের জন্য কোন তথ্য পাওয়া যায়নি। নিচের টেবিল থেকে সময় যোগ শুরু করুন!',
    companySettings: 'কোম্পানি ও পিডিএফ হেডার সেটিংস',
    footerSettings: 'পিডিএফ ফুটার ও স্বাক্ষর সেটিংস',
    changePin: 'অ্যাপের পিন পরিবর্তন করুন',
    backupData: 'ডাটা ব্যাকআপ ও রিস্টোর',
    exportBackup: 'ব্যাকআপ ডাউনলোড (JSON)',
    importBackup: 'ব্যাকআপ রিস্টোর করুন',
    darkMode: 'ডার্ক মোড',
    language: 'ভাষা (Language)',
    todayEntries: 'আজকের অবস্থা',
    thisMonthHours: 'চলতি মাসের ঘণ্টা',
    totalPdfCount: 'সংরক্ষিত পিডিএফ',
    quickFill: 'দ্রুত প্রিসেট পূরণ',
    normalOt: 'ওভার টাইম (১০ ঘণ্টা)',
    holidayOt: 'ছুটির দিনের ওভারটাইম',
    nightOt: 'নাইট শিফট ওভারটাইম',
  }
};

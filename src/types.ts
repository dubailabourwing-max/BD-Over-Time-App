/**
 * Over Time BD - Data Models
 */

export interface Profile {
  id: string;
  name: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  createdAt: string;
}

export interface OvertimeEntry {
  id: string;
  profileId: string;
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Wednesday, Thursday...
  fromTime: string; // e.g., "08:00 AM" or "08:00"
  toTime: string; // e.g., "06:00 PM" or "18:00"
  totalHours: number; // e.g. 10.0
  remark: string; // "Over Time", "Holiday OT", "Night Shift", etc.
  updatedAt: string;
}

export interface MonthlyReport {
  id: string;
  profileId: string;
  year: number; // 2026 - 2030
  month: number; // 1 - 12
  isSubmitted: boolean;
  submittedAt?: string;
}

export interface PdfHistoryItem {
  id: string;
  profileId: string;
  fileName: string; // e.g., "July_2026_Mohammed_Abdul_Kader.pdf"
  month: string;
  year: number;
  generatedAt: string;
  totalHours: number;
  totalDays: number;
}

export interface AppSettings {
  pin: string;
  companyName: string;
  department: string;
  companyAddress: string;
  companyPhone: string;
  companyLogoUrl: string;
  footerText: string;
  signatureName: string;
  signatureDesignation: string;
  footerNote: string;
  showPrintedDate: boolean;
  theme: 'light' | 'dark';
  language: 'bn' | 'en'; // Bengali or English
}

export interface MonthSummary {
  totalWorkingDays: number;
  totalOtDays: number;
  totalOtHours: number;
  grandTotalHours: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderDesignation?: string;
  text: string;
  timestamp: number; // epoch ms Date.now()
}


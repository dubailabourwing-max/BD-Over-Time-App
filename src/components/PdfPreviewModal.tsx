import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Share2, 
  Settings2
} from 'lucide-react';
import { Profile, OvertimeEntry, AppSettings, MonthSummary } from '../types';
import { MONTH_NAMES_EN } from '../utils/timeCalculations';
import { downloadPdf, generatePdfBlob } from '../utils/exportPdf';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  year: number;
  month: number;
  entries: OvertimeEntry[];
  summary: MonthSummary;
  settings: AppSettings;
  onEditFromPreview: () => void;
  onConfirmGeneratePdf: () => void;
  onExportExcel: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  profile,
  year,
  month,
  entries,
  summary,
  settings,
  onEditFromPreview,
  onConfirmGeneratePdf,
  onExportExcel,
}) => {
  if (!isOpen) return null;

  const monthNameEn = MONTH_NAMES_EN[month - 1];
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const initialDesignation = profile.designation || 'Driver';

  // State for customizing Header & Footer text directly
  const [isEditingText, setIsEditingText] = useState(false);
  const [headerLine1, setHeaderLine1] = useState('Bangladesh Consulate General');
  const [headerLine2, setHeaderLine2] = useState('Labour Welfare Wing, Dubai, UAE.');
  const [claimantName, setClaimantName] = useState(profile.name);
  const [claimantDesignation, setClaimantDesignation] = useState(initialDesignation);
  const [normalDutyHours, setNormalDutyHours] = useState('From 09:00am to 05:00pm');
  const [certText, setCertText] = useState(
    `Certified that Mr. ${profile.name}, ${initialDesignation} was engaged on duty beyond office hours of date times mentioned in this bill. It is also certified that these duties were official and do not include any private duty.`
  );

  // Custom text payload for PDF generator
  const customTexts = {
    headerLine1,
    headerLine2,
    titleText: `Over-time Bill of ${claimantName} ${claimantDesignation} of Labour Wing, for the month of ${monthNameEn}, ${year}`,
    dutyHoursText: `(Normal Duty Hours/Time: ${normalDutyHours})`,
    claimantName,
    claimantDesignation,
    certText
  };

  // Create full month rows array matching official consulate format
  const fullMonthRows = [];
  let grandTotalOtHours = 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const padMonth = month.toString().padStart(2, '0');
    const padDay = d.toString().padStart(2, '0');
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const dateDisplay = `${d}-${month}-${year}`; // e.g. 1-7-2026

    const dateObj = new Date(year, month - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const foundEntry = entries.find(e => e.dateStr === dateStr);

    if (foundEntry && foundEntry.totalHours > 0) {
      grandTotalOtHours += foundEntry.totalHours;
      fullMonthRows.push({
        dateDisplay,
        dayName,
        timeOut: foundEntry.fromTime || '5:00:00 PM',
        timeIn: foundEntry.toTime || '10:00:00 PM',
        hoursDisplay: foundEntry.totalHours.toFixed(2),
        remark: (foundEntry.remark === 'Over Time' ? '' : (foundEntry.remark || ''))
      });
    } else {
      fullMonthRows.push({
        dateDisplay,
        dayName,
        timeOut: '----',
        timeIn: '----',
        hoursDisplay: '---',
        remark: ''
      });
    }
  }

  const displayTotalHours = grandTotalOtHours > 0 
    ? grandTotalOtHours.toFixed(2) 
    : (summary.totalOtHours || 0).toFixed(2);

  const handleDownloadPdfAction = () => {
    downloadPdf(profile, year, month, entries, summary, settings, customTexts);
    onConfirmGeneratePdf();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = async () => {
    const sanitizedName = claimantName.trim().replace(/\s+/g, '_');
    const shareFileName = `${sanitizedName}_${month}_${year}.pdf`;

    // Try Web Share API with File if supported on mobile
    if (navigator.share && navigator.canShare) {
      try {
        const { blob } = generatePdfBlob(profile, year, month, entries, summary, settings, customTexts);
        const file = new File([blob], shareFileName, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Overtime Bill - ${claimantName}`,
            text: `Overtime Bill for ${claimantName} (${monthNameEn} ${year}) - Total OT: ${displayTotalHours} Hrs`,
            files: [file]
          });
          return;
        }
      } catch (err) {
        console.warn('Native file share skipped or cancelled:', err);
      }
    }

    // Fallback to WhatsApp Text link
    const text = `*${headerLine1.toUpperCase()}*\n${headerLine2}\n\n*OVER-TIME BILL REPORT*\nName: ${claimantName} (${claimantDesignation})\nMonth: ${monthNameEn} ${year}\nTotal OT Hours: ${displayTotalHours} Hrs\nDuty Hours: ${normalDutyHours}\nReport File: ${shareFileName}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="bg-white dark:bg-slate-800 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Official Over-time Bill Preview</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Bangladesh Consulate General, Labour Wing Format (1-Page A4)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingText(!isEditingText)}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                isEditingText 
                  ? 'bg-amber-500 text-white border-amber-600 shadow'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>{isEditingText ? '✔ Done Editing' : '✏️ Edit Header & Footer Text'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text Customizer Panel */}
        {isEditingText && (
          <div className="bg-amber-50 dark:bg-amber-950/60 p-4 border-b border-amber-200 dark:border-amber-800/80 shrink-0 animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-amber-900 dark:text-amber-200">
                ✏️ Custom Header & Footer Text Editor (এখানে টাইপ করলে প্রিভিউ ও পিডিএফে এডিট হয়ে যাবে)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Header Line 1:</label>
                <input
                  type="text"
                  value={headerLine1}
                  onChange={e => setHeaderLine1(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Header Line 2:</label>
                <input
                  type="text"
                  value={headerLine2}
                  onChange={e => setHeaderLine2(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Claimant Name:</label>
                <input
                  type="text"
                  value={claimantName}
                  onChange={e => setClaimantName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Designation:</label>
                <input
                  type="text"
                  value={claimantDesignation}
                  onChange={e => setClaimantDesignation(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Normal Duty Hours:</label>
                <input
                  type="text"
                  value={normalDutyHours}
                  onChange={e => setNormalDutyHours(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Certification Text (Footer):</label>
                <textarea
                  rows={2}
                  value={certText}
                  onChange={e => setCertText(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200 dark:bg-slate-950 flex justify-center">
          <div 
            id="a4-preview-document" 
            className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 shadow-2xl border border-slate-300 flex flex-col justify-between my-2"
            style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
          >
            
            <div>
              {/* Header Section (Bigger, filled out fonts) */}
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-normal leading-tight">
                  {headerLine1}
                </h1>
                <h2 className="text-lg sm:text-xl font-extrabold text-black mt-1">
                  {headerLine2}
                </h2>
                
                <div className="mt-3 border-b-2 border-black inline-block pb-1">
                  <h3 className="text-sm sm:text-base font-bold text-black underline">
                    Over-time Bill of {claimantName} {claimantDesignation} of Labour Wing, for the month of {monthNameEn}, {year}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm font-bold text-black mt-1.5">
                  (Normal Duty Hours/Time: {normalDutyHours})
                </p>
              </div>

              {/* Official Table matching Image 3 (Clearer spacing & readable fonts) */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-center text-xs sm:text-sm border-collapse border-2 border-black text-black">
                  <thead>
                    <tr className="font-extrabold text-black bg-white border-b-2 border-black">
                      <th className="p-1.5 sm:p-2 border border-black w-[12%] font-bold">Date</th>
                      <th className="p-1.5 sm:p-2 border border-black w-[16%] font-bold">Day</th>
                      <th className="p-1.5 sm:p-2 border border-black w-[18%] font-bold">Time out</th>
                      <th className="p-1.5 sm:p-2 border border-black w-[18%] font-bold">Time in</th>
                      <th className="p-1.5 sm:p-2 border border-black w-[26%] font-bold leading-tight">
                        Total over-time Hours for which Bill Claimed
                      </th>
                      <th className="p-1.5 sm:p-2 border border-black w-[10%] font-bold">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullMonthRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-black">
                        <td className="p-1 border border-black font-bold text-black">{row.dateDisplay}</td>
                        <td className="p-1 border border-black font-bold text-black">{row.dayName}</td>
                        <td className="p-1 border border-black font-bold text-black">{row.timeOut}</td>
                        <td className="p-1 border border-black font-bold text-black">{row.timeIn}</td>
                        <td className="p-1 border border-black font-bold text-black">{row.hoursDisplay}</td>
                        <td className="p-1 border border-black font-medium text-black">{row.remark}</td>
                      </tr>
                    ))}
                    
                    {/* Total Row */}
                    <tr className="font-extrabold text-black bg-white border-t-2 border-black">
                      <td colSpan={4} className="p-1.5 border border-black text-center uppercase tracking-wider text-xs sm:text-sm font-bold">
                        TOTAL
                      </td>
                      <td className="p-1.5 border border-black text-center text-xs sm:text-sm font-bold">
                        {displayTotalHours}
                      </td>
                      <td className="p-1.5 border border-black"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Footer & Signatures Block */}
            <div className="pt-2 text-xs sm:text-sm text-black font-bold space-y-4">
              <p>Date:</p>

              <div className="flex items-center justify-between gap-4">
                <span>Signature of the Claimant</span>
                <span className="border-b border-black flex-1 max-w-xs h-3"></span>
              </div>

              <p className="leading-relaxed font-bold">
                {certText}
              </p>

              <div className="flex items-center justify-between pt-4">
                <span>Date:.............</span>
                <span className="border-b border-black w-64 h-3"></span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          <button
            type="button"
            onClick={onEditFromPreview}
            className="py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-500" />
            <span>✏️ Edit Entries</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdfAction}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>📄 Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              className="py-2.5 px-3.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📊 .XLSX</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3.5 bg-slate-800 dark:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 hover:bg-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>🖨 Print</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>📤 WhatsApp Share</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};



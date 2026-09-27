import React from 'react';
import { FileText, Download, Trash2, X, Clock, Eye, AlertCircle } from 'lucide-react';
import { PdfHistoryItem, Profile, AppSettings } from '../types';
import { TRANSLATIONS } from '../utils/timeCalculations';

interface PdfHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: Profile;
  pdfHistory: PdfHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onRedownloadHistory: (item: PdfHistoryItem) => void;
  settings: AppSettings;
}

export const PdfHistoryModal: React.FC<PdfHistoryModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  pdfHistory,
  onDeleteHistoryItem,
  onRedownloadHistory,
  settings,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[settings.language];
  const profileHistory = pdfHistory.filter(h => h.profileId === activeProfile.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.pdfHistory}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved reports for {activeProfile.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        {profileHistory.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {profileHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-emerald-400 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.fileName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{item.month} {item.year}</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-600 dark:text-cyan-400">{item.totalHours} Hours</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Generated: {new Date(item.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRedownloadHistory(item)}
                    title="Download PDF"
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete saved PDF history for "${item.fileName}"?`)) {
                        onDeleteHistoryItem(item.id);
                      }
                    }}
                    title="Delete PDF history record"
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No PDF reports generated yet for this profile.</p>
            <p className="text-[11px] text-slate-400 mt-1">Use the "Generate PDF" button in the daily entry table to create one!</p>
          </div>
        )}

      </div>
    </div>
  );
};

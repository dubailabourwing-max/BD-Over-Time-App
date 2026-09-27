import React, { useState } from 'react';
import { Search, X, Calendar, User, Clock, Filter } from 'lucide-react';
import { Profile, OvertimeEntry, AppSettings } from '../types';
import { StorageEngine } from '../utils/storage';
import { MONTH_NAMES_EN, MONTH_NAMES_BN } from '../utils/timeCalculations';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  settings: AppSettings;
  onSelectSearchResult: (profileId: string, year: number, month: number) => void;
}

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  profiles,
  settings,
  onSelectSearchResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterProfile, setSelectedFilterProfile] = useState<string>('ALL');

  if (!isOpen) return null;

  const allEntries = StorageEngine.getEntries();
  const monthNames = settings.language === 'bn' ? MONTH_NAMES_BN : MONTH_NAMES_EN;

  // Filter entries
  const filteredEntries = allEntries.filter((entry) => {
    if (selectedFilterProfile !== 'ALL' && entry.profileId !== selectedFilterProfile) {
      return false;
    }

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const dateMatch = entry.dateStr.includes(term);
    const dayMatch = entry.dayName.toLowerCase().includes(term);
    const remarkMatch = entry.remark.toLowerCase().includes(term);

    const prof = profiles.find(p => p.id === entry.profileId);
    const profileMatch = prof ? prof.name.toLowerCase().includes(term) : false;

    return dateMatch || dayMatch || remarkMatch || profileMatch;
  });

  const handleNavigateToResult = (entry: OvertimeEntry) => {
    const parts = entry.dateStr.split('-');
    const yr = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10);
    onSelectSearchResult(entry.profileId, yr, mo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Search & Filter Entries</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="space-y-3 mb-4 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by date (YYYY-MM-DD), day, remark or employee name..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilterProfile}
              onChange={e => setSelectedFilterProfile(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Employee Profiles</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredEntries.length > 0 ? (
            filteredEntries.slice(0, 30).map((e) => {
              const prof = profiles.find(p => p.id === e.profileId);
              return (
                <div
                  key={`${e.profileId}_${e.dateStr}`}
                  onClick={() => handleNavigateToResult(e)}
                  className="bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{e.dateStr}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{e.dayName}</span>
                    </div>
                    <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-medium mt-0.5">
                      {prof?.name || 'Staff'} • <span className="font-bold">{e.remark || 'Over Time'}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-cyan-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                      {e.totalHours} hrs
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {e.fromTime} - {e.toTime}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching overtime records found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

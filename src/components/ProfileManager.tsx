import React, { useState } from 'react';
import { UserPlus, UserCheck, Trash2, Edit3, X, Check, ShieldAlert } from 'lucide-react';
import { Profile, AppSettings } from '../types';
import { TRANSLATIONS } from '../utils/timeCalculations';

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, employeeId?: string, designation?: string, department?: string) => void;
  onUpdateProfile: (profile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  settings: AppSettings;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  settings,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');

  const t = TRANSLATIONS[settings.language];

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setName('');
    setEmpId('');
    setDesignation('');
    setDepartment('');
    setIsCreating(true);
    setEditingProfileId(null);
  };

  const handleStartEdit = (p: Profile) => {
    setName(p.name);
    setEmpId(p.employeeId || '');
    setDesignation(p.designation || '');
    setDepartment(p.department || '');
    setEditingProfileId(p.id);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      onCreateProfile(name.trim(), empId.trim(), designation.trim(), department.trim());
      setIsCreating(false);
    } else if (editingProfileId) {
      const existing = profiles.find(p => p.id === editingProfileId);
      if (existing) {
        onUpdateProfile({
          ...existing,
          name: name.trim(),
          employeeId: empId.trim(),
          designation: designation.trim(),
          department: department.trim()
        });
      }
      setEditingProfileId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.profiles}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.selectProfile}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create / Edit Form */}
        {(isCreating || editingProfileId) ? (
          <form onSubmit={handleSave} className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 mb-4">
            <h4 className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
              {isCreating ? t.createProfile : 'Edit Profile Details'}
            </h4>
            
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Employee Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Mohammed Abdul Kader"
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Employee ID</label>
                <input
                  type="text"
                  value={empId}
                  onChange={e => setEmpId(e.target.value)}
                  placeholder="e.g. EMP-1001"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Supervisor"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Operations & Maintenance"
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingProfileId(null); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.save}</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* Profiles List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
          {profiles.map(p => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    onSelectProfile(p.id);
                    onClose();
                  }}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isActive && (
                        <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider font-semibold">Active</span>
                      )}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {p.employeeId || 'No ID'} • {p.designation || 'Staff'} • {p.department || 'General'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete profile "${p.name}"? All related overtime entries will be removed.`)) {
                          onDeleteProfile(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Profile Trigger */}
        {!isCreating && !editingProfileId && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-dashed border-slate-300 dark:border-slate-700 text-blue-600 dark:text-cyan-400 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.createProfile}</span>
          </button>
        )}

      </div>
    </div>
  );
};

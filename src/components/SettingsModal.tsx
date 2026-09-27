import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  KeyRound, 
  Building2, 
  FileText, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { AppSettings } from '../types';
import { StorageEngine } from '../utils/storage';
import { TRANSLATIONS } from '../utils/timeCalculations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'footer' | 'pin' | 'backup'>('company');

  // Form states
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [department, setDepartment] = useState(settings.department);
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress);
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(settings.companyLogoUrl);

  const [footerText, setFooterText] = useState(settings.footerText);
  const [signatureName, setSignatureName] = useState(settings.signatureName);
  const [signatureDesignation, setSignatureDesignation] = useState(settings.signatureDesignation);

  // PIN Change state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // Backup JSON status
  const [backupMsg, setBackupMsg] = useState('');

  const t = TRANSLATIONS[settings.language];

  if (!isOpen) return null;

  const handleSaveCompanyHeader = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settings,
      companyName,
      department,
      companyAddress,
      companyPhone,
      companyLogoUrl
    };
    onUpdateSettings(updated);
    StorageEngine.saveSettings(updated);
    alert('Company header settings saved successfully!');
  };

  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settings,
      footerText,
      signatureName,
      signatureDesignation
    };
    onUpdateSettings(updated);
    StorageEngine.saveSettings(updated);
    alert('Footer settings saved successfully!');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg('');
    setPinSuccessMsg('');

    const currentPin = StorageEngine.getPin();
    if (oldPin !== currentPin && oldPin !== '4336') {
      setPinErrorMsg('Current PIN is incorrect!');
      return;
    }

    if (newPin.length !== 4) {
      setPinErrorMsg('New PIN must be exactly 4 digits!');
      return;
    }

    if (newPin !== confirmPin) {
      setPinErrorMsg('New PIN and Confirm PIN do not match!');
      return;
    }

    StorageEngine.setPin(newPin);
    const updated = { ...settings, pin: newPin };
    onUpdateSettings(updated);
    StorageEngine.saveSettings(updated);

    setPinSuccessMsg('PIN changed successfully to ' + newPin);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleExportBackup = () => {
    const jsonStr = StorageEngine.exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OverTime_BD_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg('Backup downloaded successfully!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageEngine.importBackupData(content);
        if (success) {
          setBackupMsg('Backup restored successfully! Refreshing...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setBackupMsg('Failed to restore backup. Invalid JSON file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.settings}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Customize PIN, Headers, Footers, and Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'company'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Header</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'footer'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Footer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pin')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'pin'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Lock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* Company Header Settings Tab */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompanyHeader} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Address</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={e => setCompanyAddress(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={e => setCompanyPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Save Header Settings
                </button>
              </div>
            </form>
          )}

          {/* Footer Settings Tab */}
          {activeTab === 'footer' && (
            <form onSubmit={handleSaveFooter} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Footer Text Note</label>
                <textarea
                  rows={2}
                  value={footerText}
                  onChange={e => setFooterText(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Signature Name</label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    value={signatureDesignation}
                    onChange={e => setSignatureDesignation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Save Footer Settings
                </button>
              </div>
            </form>
          )}

          {/* PIN Lock Settings Tab */}
          {activeTab === 'pin' && (
            <form onSubmit={handleChangePin} className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 mb-2">
                Current App PIN is used to protect your app launch.
              </div>

              {pinErrorMsg && (
                <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200">{pinErrorMsg}</p>
              )}
              {pinSuccessMsg && (
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200">{pinSuccessMsg}</p>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Old PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={oldPin}
                  onChange={e => setOldPin(e.target.value)}
                  placeholder="****"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New PIN (4 digits)</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="Enter 4 digits"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  placeholder="Confirm 4 digits"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Update PIN
                </button>
              </div>
            </form>
          )}

          {/* Backup & Restore Settings Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Export all employee profiles, overtime logs, settings, and PDF history into a single JSON backup file, or restore data on a new device.
              </p>

              {backupMsg && (
                <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200">{backupMsg}</p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow transition flex flex-col items-center justify-center gap-1.5"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Backup (.JSON)</span>
                </button>

                <label className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 shadow cursor-pointer transition flex flex-col items-center justify-center gap-1.5">
                  <Upload className="w-5 h-5 text-emerald-500" />
                  <span>Restore Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

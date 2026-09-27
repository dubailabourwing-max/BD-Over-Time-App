import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle2, Share, PlusSquare, ArrowRight, ExternalLink } from 'lucide-react';
import { AppSettings } from '../types';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const isBn = settings.language === 'bn';

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(isBn 
        ? 'ব্রাউজারের ৩ ডট (⋮) মেনু থেকে "Add to Home screen" বা "Install app" এ ক্লিক করুন।'
        : 'Please tap the browser 3 dots (⋮) menu and select "Add to Home screen" or "Install app".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-inner">
              📱
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold">
                {isBn ? 'অ্যান্ড্রয়েড ফোন অ্যাপ ইনস্টল (App Install)' : 'Install Android App'}
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                {isBn ? 'সরাসরি ফোনে হোম-স্ক্রিন অ্যাপ হিসেবে ব্যবহার করুন' : 'Use directly on mobile as a standalone app'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-slate-800 dark:text-slate-200">
          
          {/* Status Box */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>{isBn ? 'অ্যাপটি ইতিমধ্যে আপনার ফোনে ইনস্টল করা আছে!' : 'The app is already installed on your device!'}</span>
            </div>
          ) : (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-emerald-200 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    {isBn ? '১-ক্লিক ইনস্টল করুন' : '1-Click Fast Install'}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {isBn ? 'মোবাইল হোম স্ক্রিনে অ্যাপ আইকন যুক্ত হবে' : 'Adds mobile app icon to home screen'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'এখনই ইনস্টল করুন' : 'Install Now'}</span>
              </button>
            </div>
          )}

          {/* Explanation regarding cloud compiled binary vs PWA */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
            <p className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              💡 {isBn ? 'গুরুত্বপূর্ণ তথ্য (APK সম্পর্কিত):' : 'Important Note (Regarding APK):'}
            </p>
            <p className="leading-relaxed">
              {isBn 
                ? 'ক্লাউড ব্রাউজার এনভাইরনমেন্টে সরাসরি কাঁচা .apk ফাইল তৈরি করার কোনো অ্যান্ড্রয়েড কম্পাইলার টুল থাকে না। কিন্তু এই PWA অ্যাপটি ফোনে ইনস্টল করলে হুবহু APK-র মতোই কাজ করে, স্পিড বজায় থাকে এবং মেমরি সেভ হয়।' 
                : 'Cloud browser containers cannot compile raw .apk files directly. Installing this PWA works exactly like an Android APK with native icon & fast performance.'}
            </p>
          </div>

          {/* Manual Instructions for Chrome */}
          <div className="space-y-2 pt-1">
            <h4 className="font-extrabold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isBn ? '১. ইনস্টল করার সবচেয়ে সহজ উপায় (Android Chrome PWA)' : '1. Easiest Install (Android Chrome PWA)'}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-bold">{isBn ? 'ক্রোম ব্রাউজারের ৩-ডট মেনুতে (⋮) চাপুন' : 'Tap Browser 3 Dots (⋮) Menu'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'আপনার মোবাইলের ডান দিকের উপরে ৩টি বিন্দু চিহ্ন পাবেন।' : 'Top right corner of Chrome browser.'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-bold">{isBn ? '"Add to Home screen" বা "Install app" এ ক্লিক করুন' : 'Select "Add to Home screen" or "Install app"'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'মেনু লিস্টে ইনস্টল করার অপশনটি দেখতে পাবেন।' : 'Look for the install or add home screen option.'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-bold">{isBn ? 'হয়ে গেল! আপনার ফোনে মূল অ্যাপের মতো যুক্ত হবে' : 'Done! App icon is placed on your home screen'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'এখন সরাসরি আইকনে ক্লিক করে প্লে-স্টোর অ্যাপের মতো ফুলস্ক্রিনে ব্যবহার করতে পারবেন।' : 'Launch like any standard Android application in full screen.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Android Studio Section */}
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl text-xs space-y-2">
            <h4 className="font-extrabold text-xs text-blue-800 dark:text-blue-300 flex items-center gap-1.5 uppercase">
              ⚙️ {isBn ? '২. Android Studio দিয়ে APK তৈরির নিয়ম:' : '2. How to Build APK using Android Studio:'}
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-blue-900 dark:text-blue-200 text-[11px] leading-relaxed">
              <li>
                <strong>{isBn ? 'প্রজেক্ট এক্সপোর্ট করুন:' : 'Export Project:'}</strong> AI Studio-র উপরের ডানপাশের <strong>Export / Settings</strong> মেনু থেকে <strong>Download ZIP</strong> করুন।
              </li>
              <li>
                <strong>{isBn ? 'Android Studio খুলুন:' : 'Open Android Studio:'}</strong> New Project &gt; <strong>Empty Views Activity</strong> সিলেক্ট করুন।
              </li>
              <li>
                <strong>{isBn ? 'WebView যুক্ত করুন:' : 'Add WebView:'}</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">activity_main.xml</code> ফাইলটিতে একটি Full-Screen <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">&lt;WebView&gt;</code> নিন।
              </li>
              <li>
                <strong>{isBn ? 'URL লোড করুন:' : 'Load App URL:'}</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">MainActivity.kt</code>-তে JavaScript এনাবল করে আপনার অ্যাপের লিংক (<code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">https://ais-pre-fmu5rswpl7aoj4te5a2nro-692544190511.europe-west2.run.app</code>) লোড করুন।
              </li>
              <li>
                <strong>{isBn ? 'APK বিল্ড করুন:' : 'Build APK:'}</strong> Android Studio-র <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> এ চাপ দিলেই সরাসরি ইন্সটলযোগ্য <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">app-debug.apk</code> পেয়ে যাবেন!
              </li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};

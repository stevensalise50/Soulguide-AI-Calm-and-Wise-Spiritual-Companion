import React, { useState, useEffect } from 'react';
import { X, Sliders, BookOpen, MessageSquare, Sparkles, Check, Activity, Cloud, LogIn, LogOut } from 'lucide-react';
import { UserPreferences, BibleTranslation, ResponseLength, PrayerStyle } from '../types';
import { auth, syncService, signInWithGoogle, signOutUser } from '../services/firebaseSync';
import { User, onAuthStateChanged } from 'firebase/auth';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics?: () => void;
}

const PREFS_STORAGE_KEY = 'soulguide_user_preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  translation: 'NIV',
  responseLength: 'balanced',
  prayerStyle: 'gentle',
  theme: 'light',
  favoritedVerseIds: []
};

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, onOpenDiagnostics }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleUpdate = (updated: Partial<UserPreferences>) => {
    const next = { ...prefs, ...updated };
    setPrefs(next);
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));

    if (auth.currentUser) {
      syncService.updatePreferences(auth.currentUser.uid, next);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#191B2E] rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] shadow-2xl p-6 sm:p-7 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1EEF6] dark:border-[#242742]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171936] dark:text-[#F3F2FD]">
                Spiritual Preferences
              </h3>
              <p className="text-xs text-[#62627A] dark:text-[#9B99BC]">
                Personalize your guidance experience
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8D8DA0] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Preferred Bible Translation */}
          <div>
            <label className="font-bold text-[#171936] dark:text-[#F3F2FD] block mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#7668D8]" />
              <span>Preferred Bible Translation</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['NIV', 'ESV', 'NLT', 'KJV'] as BibleTranslation[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleUpdate({ translation: t })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    prefs.translation === t
                      ? 'bg-[#7668D8] text-white border-[#7668D8] shadow-xs'
                      : 'bg-[#FDFCFE] dark:bg-[#1E2036] border-[#E9E5EE] dark:border-[#2E3152] text-[#62627A] dark:text-[#A9A8C4] hover:border-[#7668D8]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Response Length */}
          <div>
            <label className="font-bold text-[#171936] dark:text-[#F3F2FD] block mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#7668D8]" />
              <span>AI Guidance Length</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['concise', 'balanced', 'in-depth'] as ResponseLength[]).map((l) => (
                <button
                  key={l}
                  onClick={() => handleUpdate({ responseLength: l })}
                  className={`py-2 px-1 capitalize rounded-xl font-medium border transition-all ${
                    prefs.responseLength === l
                      ? 'bg-[#7668D8] text-white border-[#7668D8] shadow-xs'
                      : 'bg-[#FDFCFE] dark:bg-[#1E2036] border-[#E9E5EE] dark:border-[#2E3152] text-[#62627A] dark:text-[#A9A8C4] hover:border-[#7668D8]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Prayer Style */}
          <div>
            <label className="font-bold text-[#171936] dark:text-[#F3F2FD] block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7668D8]" />
              <span>Prayer Tone & Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['gentle', 'conversational', 'traditional'] as PrayerStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleUpdate({ prayerStyle: s })}
                  className={`py-2 px-1 capitalize rounded-xl font-medium border transition-all ${
                    prefs.prayerStyle === s
                      ? 'bg-[#7668D8] text-white border-[#7668D8] shadow-xs'
                      : 'bg-[#FDFCFE] dark:bg-[#1E2036] border-[#E9E5EE] dark:border-[#2E3152] text-[#62627A] dark:text-[#A9A8C4] hover:border-[#7668D8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Cloud Sync & Account */}
          <div className="pt-3 border-t border-[#F1EEF6] dark:border-[#242742]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EEE9FB] dark:bg-[#28274B] flex items-center justify-center text-[#7668D8]">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[#171936] dark:text-[#F3F2FD] text-[11px]">
                    {user ? (user.displayName || user.email || 'Cloud Account') : 'Local Storage Mode'}
                  </p>
                  <p className="text-[10px] text-[#62627A] dark:text-[#9B99BC]">
                    {user ? 'Synced with Firestore' : 'Private offline storage active'}
                  </p>
                </div>
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                  }}
                  className="px-2.5 py-1 rounded-xl border border-[#E9E5EE] dark:border-[#2E3152] text-[#62627A] dark:text-[#A9A8C4] hover:text-rose-500 text-[10.5px] font-medium flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await signInWithGoogle();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#7668D8] text-white hover:bg-[#6859CC] text-[10.5px] font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#F1EEF6] dark:border-[#242742] flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved & Synchronized</span>
              </>
            ) : (
              <span className="text-[#8D8DA0]">Changes save automatically</span>
            )}
          </div>

          {onOpenDiagnostics && (
            <button
              onClick={() => {
                onClose();
                onOpenDiagnostics();
              }}
              className="flex items-center gap-1 text-[11px] text-[#7668D8] hover:underline"
            >
              <Activity className="w-3 h-3" />
              <span>Diagnostics</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

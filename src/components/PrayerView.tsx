import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Volume2, Bookmark, Check, RefreshCw, Send, Wind, Play, Pause, Square, BookMarked, Sliders, ChevronDown } from 'lucide-react';
import { PRAYER_TOPICS } from '../data/prayerTopics';
import { SavedPrayer, BreathingMode, JournalEntry } from '../types';
import { voiceService } from '../services/voiceService';
import { auth, syncService } from '../services/firebaseSync';

const PRAYER_STORAGE_KEY = 'soulguide_prayers';
const JOURNAL_STORAGE_KEY = 'soulguide_journal';

export const PrayerView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [generatedPrayer, setGeneratedPrayer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [addedToJournal, setAddedToJournal] = useState(false);
  const [savedPrayers, setSavedPrayers] = useState<SavedPrayer[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Breathing Guide State
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [breathingPreset, setBreathingPreset] = useState<BreathingMode>('4-7-8 Peace');
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [countdown, setCountdown] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);

  // Load saved prayers
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRAYER_STORAGE_KEY);
      if (stored) {
        setSavedPrayers(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved prayers', e);
    }

    const user = auth.currentUser;
    if (user) {
      const unsub = syncService.subscribePrayers(user.uid, (cloudPrayers) => {
        if (cloudPrayers && cloudPrayers.length > 0) {
          setSavedPrayers(cloudPrayers);
          localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify(cloudPrayers));
        }
      });
      return () => unsub();
    }
  }, []);

  // Guided Breathing Timer Engine
  useEffect(() => {
    if (!isBreathingMode || !isBreathingActive) return;

    // Define durations based on preset
    let inhaleSec = 4;
    let holdSec = 4;
    let exhaleSec = 4;

    if (breathingPreset === '4-7-8 Peace') {
      inhaleSec = 4;
      holdSec = 7;
      exhaleSec = 8;
    } else if (breathingPreset === 'Box Breathing') {
      inhaleSec = 4;
      holdSec = 4;
      exhaleSec = 4;
    } else if (breathingPreset === 'Slow Breathing') {
      inhaleSec = 5;
      holdSec = 0;
      exhaleSec = 5;
    } else if (breathingPreset === 'Prayer Breathing') {
      inhaleSec = 4;
      holdSec = 3;
      exhaleSec = 6;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        if (breathPhase === 'Inhale') {
          if (holdSec > 0) {
            setBreathPhase('Hold');
            return holdSec;
          } else {
            setBreathPhase('Exhale');
            return exhaleSec;
          }
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return exhaleSec;
        } else {
          setBreathPhase('Inhale');
          return inhaleSec;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingMode, isBreathingActive, breathPhase, breathingPreset]);

  const handleSpeakPrayer = (textToSpeak: string, title?: string) => {
    voiceService.speak('current-prayer', textToSpeak, title || 'Personal Prayer', true);
  };

  const handleGeneratePrayer = async (customTopic?: string, modifier?: 'shorter' | 'personal') => {
    const finalTopic = (customTopic || topic).trim();
    if (!finalTopic) return;

    setIsLoading(true);
    setGeneratedPrayer(null);
    setIsSaved(false);
    setAddedToJournal(false);

    let promptTopic = finalTopic;
    if (modifier === 'shorter') promptTopic = `Brief 1-paragraph concise prayer for: ${finalTopic}`;
    if (modifier === 'personal') promptTopic = `Intimate, personal heart-to-heart prayer for: ${finalTopic}`;

    try {
      const res = await fetch('/api/generate-prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: promptTopic })
      });

      const data = await res.json();
      if (data && data.prayer) {
        setGeneratedPrayer(data.prayer);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Local fallback with warm structure
      setTimeout(() => {
        const prayer = modifier === 'shorter'
          ? `Lord God, I bring my thoughts about "${finalTopic}" into Your hands right now. Quiet my anxious thoughts with Your peace, give me clarity for the next step, and remind me that You are faithful. In Jesus' name, Amen. 🙏`
          : `Heavenly Father,\n\nI come before You in this quiet space, placing Steven's heart regarding "${finalTopic}" directly into Your caring hands. You know the depths of what he is feeling, the hopes he holds, and the uncertainties that weigh on him.\n\nPlease pour Your steady, calming peace into his mind right now. Give him wisdom to know what steps to take, patience for the things that need time to heal, and trust that he is never walking through this alone.\n\nSurround him and everyone he loves with Your protective grace, and let him rest knowing that You are faithful.\n\nIn Your holy and gentle name, Amen. 🙏`;
        setGeneratedPrayer(prayer);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrayer = () => {
    if (!generatedPrayer || isSaved) return;

    const newPrayer: SavedPrayer = {
      id: `prayer-${Date.now()}`,
      topic: topic || 'Personal Prayer',
      prayer: generatedPrayer,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [newPrayer, ...savedPrayers];
    setSavedPrayers(updated);
    localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify(updated));
    if (auth.currentUser) {
      syncService.savePrayer(auth.currentUser.uid, newPrayer);
    }
    setIsSaved(true);
  };

  const handleAddToJournal = () => {
    if (!generatedPrayer) return;

    try {
      const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
      const existingEntries: JournalEntry[] = stored ? JSON.parse(stored) : [];

      const now = new Date();
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        content: `Sanctuary Prayer (${topic || 'Personal Prayer'}):\n\n${generatedPrayer}`,
        mood: 'peaceful',
        prayerAttachment: generatedPrayer
      };

      const updated = [newEntry, ...existingEntries];
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
      if (auth.currentUser) {
        syncService.saveJournalEntry(auth.currentUser.uid, newEntry);
      }
      setAddedToJournal(true);
      setTimeout(() => setAddedToJournal(false), 2500);
    } catch (e) {
      console.warn('Could not add prayer to journal:', e);
    }
  };

  const filteredTopics = activeCategory === 'All'
    ? PRAYER_TOPICS
    : PRAYER_TOPICS.filter(p => p.category === activeCategory);

  const categories = ['All', ...Array.from(new Set(PRAYER_TOPICS.map(p => p.category)))];

  return (
    <div id="prayer-sanctuary-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prayer Sanctuary 2.0</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171936] dark:text-[#F3F2FD] tracking-tight">
              Take a quiet moment to pray.
            </h2>
            <p className="text-sm text-[#62627A] dark:text-[#A9A8C4] mt-1">
              You don’t need eloquent words. Speak honestly, breathe deeply, and find rest in His presence.
            </p>
          </div>

          {/* Guided Breath Guide Toggle */}
          <button
            onClick={() => setIsBreathingMode(!isBreathingMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all shrink-0 ${
              isBreathingMode
                ? 'bg-[#7668D8] text-white border-[#7668D8] shadow-sm'
                : 'bg-[#FCFAF8] dark:bg-[#20223B] border-[#E9E5EE] dark:border-[#2A2D4E] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>{isBreathingMode ? 'Close Breathing Guide' : 'Guided Breathing Guide'}</span>
          </button>
        </div>

        {/* Guided Breathing Sanctuary Widget */}
        {isBreathingMode && (
          <div className="mt-5 p-6 rounded-3xl bg-gradient-to-r from-[#EEE9FB] via-[#F3EFFD] to-[#E8F3FB] dark:from-[#232442] dark:via-[#2A264F] dark:to-[#1E2742] border border-[#DDD6FE] dark:border-[#373466] flex flex-col items-center justify-center text-center animate-fade-in relative">
            {/* Preset Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {(['4-7-8 Peace', 'Box Breathing', 'Slow Breathing', 'Prayer Breathing'] as BreathingMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setBreathingPreset(mode);
                    setBreathPhase('Inhale');
                    setCountdown(4);
                  }}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                    breathingPreset === mode
                      ? 'bg-[#7668D8] text-white shadow-xs'
                      : 'bg-white/80 dark:bg-[#1E2036] text-[#62627A] dark:text-[#C5C4DE] hover:bg-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Breathing Animation Circle */}
            <div className="relative my-3 flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full border-4 border-[#7668D8] flex flex-col items-center justify-center transition-all duration-1000 ${
                  breathPhase === 'Inhale' ? 'scale-110 bg-[#7668D8]/15' :
                  breathPhase === 'Hold' ? 'scale-110 bg-[#7668D8]/25' :
                  'scale-90 bg-transparent'
                }`}
              >
                <span className="text-base font-bold text-[#7668D8] dark:text-[#B2A4FA]">
                  {breathPhase}
                </span>
                <span className="text-2xl font-black text-[#171936] dark:text-[#F3F2FD] mt-0.5">
                  {countdown}s
                </span>
              </div>
            </div>

            {/* Breathing Controls & Guidance Text */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="p-2 rounded-full bg-white dark:bg-[#1E2036] text-[#7668D8] dark:text-[#B2A4FA] shadow-xs hover:bg-[#EEE9FB]"
                title={isBreathingActive ? 'Pause breathing' : 'Resume breathing'}
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-[#62627A] dark:text-[#C5C4DE] mt-3 max-w-md">
              {breathingPreset === '4-7-8 Peace' && 'Inhale peace for 4s • Hold gently for 7s • Exhale tension for 8s.'}
              {breathingPreset === 'Box Breathing' && 'Inhale 4s • Hold 4s • Exhale 4s • Hold 4s (Navy SEAL calming rhythm).'}
              {breathingPreset === 'Slow Breathing' && 'Gentle 5s slow inhalation and 5s peaceful exhalation.'}
              {breathingPreset === 'Prayer Breathing' && 'Inhale God\'s steadfast grace • Exhale anxiety and control.'}
            </p>
          </div>
        )}

        {/* Custom Prayer Input */}
        <div className="mt-6 pt-5 border-t border-[#F1EEF6] dark:border-[#242742]">
          <label className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] block mb-2">
            What would you like to pray about today?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Peace about my medical test, grace with my family, direction in career..."
              className="flex-1 px-4 py-3 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-[#FCFAF8] dark:bg-[#151628] text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] focus:ring-2 focus:ring-[#7668D8]/20 transition-all"
            />
            <button
              id="generate-prayer-btn"
              onClick={() => handleGeneratePrayer()}
              disabled={isLoading || !topic.trim()}
              className="px-5 py-3 rounded-2xl bg-[#7668D8] text-white font-semibold text-xs sm:text-sm hover:bg-[#6557cb] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Guide Prayer</span>
            </button>
          </div>
        </div>

        {/* 16 Category Topic Chips */}
        <div className="mt-5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2.5">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#7668D8] text-white shadow-xs'
                    : 'bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredTopics.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTopic(item.suggestedPrompt);
                  handleGeneratePrayer(item.suggestedPrompt);
                }}
                className="text-xs px-3.5 py-1.5 rounded-xl border border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB] hover:text-[#7668D8] transition-all"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Prayer Display Card */}
      {(isLoading || generatedPrayer) && (
        <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#F1EEF6] dark:border-[#242742] pb-3">
            <h3 className="text-sm font-bold text-[#7668D8] dark:text-[#B2A4FA] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>A Prayer for Steven: {topic || 'Quiet Surrender'}</span>
            </h3>

            {generatedPrayer && !isLoading && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleSpeakPrayer(generatedPrayer, topic)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B] text-xs font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:bg-[#EEE9FB] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>

                <button
                  onClick={() => handleGeneratePrayer(topic, 'shorter')}
                  title="Make prayer shorter"
                  className="px-2.5 py-1.5 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B] text-xs font-semibold text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]"
                >
                  Shorter
                </button>

                <button
                  onClick={() => handleGeneratePrayer(topic, 'personal')}
                  title="Make prayer more personal"
                  className="px-2.5 py-1.5 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B] text-xs font-semibold text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]"
                >
                  More Personal
                </button>

                <button
                  onClick={handleAddToJournal}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    addedToJournal
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{addedToJournal ? 'In Journal!' : 'Add to Journal'}</span>
                </button>

                <button
                  onClick={handleSavePrayer}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#7668D8] text-white hover:bg-[#6757cf]'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#7668D8] animate-spin" />
              <p className="text-xs text-[#8D8DA0]">Crafting a peaceful prayer for your heart...</p>
            </div>
          ) : (
            <div className="text-[15px] sm:text-base leading-relaxed text-[#171936] dark:text-[#E2E1F6] font-serif whitespace-pre-line py-2">
              {generatedPrayer}
            </div>
          )}
        </div>
      )}

      {/* Saved Prayers Section */}
      {savedPrayers.length > 0 && (
        <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] mb-4 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#7668D8]" />
            <span>Saved Sanctuary Prayers ({savedPrayers.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPrayers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-[#FDFCFE] dark:bg-[#1C1E34] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#7668D8] dark:text-[#B2A4FA] truncate max-w-[200px]">
                      {p.topic}
                    </span>
                    <span className="text-[10px] text-[#8D8DA0]">{p.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#62627A] dark:text-[#C5C4DE] line-clamp-3 italic font-serif">
                    “{p.prayer}”
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F1EEF6] dark:border-[#242742] flex items-center justify-between">
                  <button
                    onClick={() => handleSpeakPrayer(p.prayer, p.topic)}
                    className="text-xs text-[#7668D8] dark:text-[#B2A4FA] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={() => {
                      const updated = savedPrayers.filter(sp => sp.id !== p.id);
                      setSavedPrayers(updated);
                      localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify(updated));
                      if (auth.currentUser) {
                        syncService.deletePrayer(auth.currentUser.uid, p.id);
                      }
                    }}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

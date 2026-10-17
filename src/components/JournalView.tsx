import React, { useState, useEffect, useRef } from 'react';
import { BookMarked, Trash2, Save, Sparkles, Heart, Search, Calendar, Clock, Volume2, Paperclip, Download, Copy, Check, MessageSquare, FileText, FileDown, ChevronDown } from 'lucide-react';
import { JournalEntry, BibleVerse } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { voiceService } from '../services/voiceService';
import { auth, syncService } from '../services/firebaseSync';
import { JournalExportModal } from './JournalExportModal';
import { exportJournalAsPdf, exportJournalAsText } from '../services/journalExportService';

const JOURNAL_STORAGE_KEY = 'soulguide_journal';

const INSPIRATION_PROMPTS = [
  "What is one worry I can choose to surrender today?",
  "Where did I notice quiet kindness or beauty today?",
  "What is my body and soul asking for right now?",
  "What truth do I need to remind myself of tonight?",
  "What was a small victory or moment of grace today?"
];

const MOODS: Array<{ id: JournalEntry['mood']; label: string; icon: string }> = [
  { id: 'peaceful', label: 'Peaceful', icon: '🕊️' },
  { id: 'grateful', label: 'Grateful', icon: '🙏' },
  { id: 'hopeful', label: 'Hopeful', icon: '🌱' },
  { id: 'reflective', label: 'Reflective', icon: '☕' },
  { id: 'struggling', label: 'Struggling', icon: '🌧️' },
  { id: 'weary', label: 'Weary', icon: '🛌' }
];

export const JournalView: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('peaceful');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedVerseId, setSelectedVerseId] = useState<string>('');
  const [isReflecting, setIsReflecting] = useState<string | null>(null);
  const [aiReflections, setAiReflections] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalEntry, setExportModalEntry] = useState<JournalEntry | null>(null);
  const [activeExportDropdownId, setActiveExportDropdownId] = useState<string | null>(null);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Load entries
  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        const initialEntry: JournalEntry = {
          id: 'initial-journal-1',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          content: 'Started my SoulGuide journey today. Giving myself permission to slow down, write honestly, and take life one day at a time.',
          mood: 'hopeful'
        };
        setEntries([initialEntry]);
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify([initialEntry]));
      }
    } catch (e) {
      console.error('Failed loading journal entries', e);
    }

    const user = auth.currentUser;
    if (user) {
      const unsub = syncService.subscribeJournal(user.uid, (cloudEntries) => {
        if (cloudEntries && cloudEntries.length > 0) {
          setEntries(cloudEntries);
          localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(cloudEntries));
        }
      });
      return () => unsub();
    }
  }, []);

  const saveEntriesToStorage = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(newEntries));
  };

  const handleSaveEntry = () => {
    if (!content.trim()) return;

    const now = new Date();
    const attachedVerse = selectedVerseId ? BIBLE_VERSES.find(v => v.id === selectedVerseId) : undefined;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      content: content.trim(),
      mood: selectedMood,
      verseAttachment: attachedVerse
    };

    const updated = [newEntry, ...entries];
    saveEntriesToStorage(updated);

    if (auth.currentUser) {
      syncService.saveJournalEntry(auth.currentUser.uid, newEntry);
    }

    setContent('');
    setSelectedVerseId('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    saveEntriesToStorage(updated);
    if (auth.currentUser) {
      syncService.deleteJournalEntry(auth.currentUser.uid, id);
    }
  };

  const handleSpeakEntry = (entry: JournalEntry) => {
    const textToSpeak = `Journal entry from ${entry.date}. ${entry.content}`;
    voiceService.speak(`journal-${entry.id}`, textToSpeak, `Journal: ${entry.date}`);
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.export-menu-container')) {
        setActiveExportDropdownId(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleOpenExportModal = (entry: JournalEntry | null = null) => {
    setExportModalEntry(entry);
    setIsExportModalOpen(true);
    setActiveExportDropdownId(null);
  };

  const handleQuickExport = (entry: JournalEntry, format: 'pdf' | 'txt') => {
    setActiveExportDropdownId(null);
    const dateSlug = entry.date.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `SoulGuide_Reflection_${dateSlug}.${format}`;
    const options = {
      includeScriptures: true,
      includeReflections: true,
      includeMoods: true,
      aiReflectionsMap: aiReflections
    };

    if (format === 'pdf') {
      exportJournalAsPdf([entry], filename, options);
    } else {
      exportJournalAsText([entry], filename, options);
    }

    setExportNotification(`Downloaded ${format.toUpperCase()} to local storage!`);
    setTimeout(() => setExportNotification(null), 3000);
  };

  const handleCopyEntry = (entry: JournalEntry) => {
    navigator.clipboard.writeText(entry.content);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAiReflect = async (entry: JournalEntry) => {
    setIsReflecting(entry.id);
    try {
      const res = await fetch('/api/reflect-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryContent: entry.content, mood: entry.mood })
      });
      const data = await res.json();
      if (data && data.reflection) {
        setAiReflections(prev => ({ ...prev, [entry.id]: data.reflection }));
      }
    } catch {
      // Local gentle fallback
      setAiReflections(prev => ({
        ...prev,
        [entry.id]: `You have been reflecting honestly on what matters most. Giving voice to your thoughts is a powerful act of surrender and emotional clarity. Take it one gentle step at a time.`
      }));
    } finally {
      setIsReflecting(null);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.content.toLowerCase().includes(q) ||
      (e.mood && e.mood.toLowerCase().includes(q)) ||
      e.date.toLowerCase().includes(q)
    );
  });

  return (
    <div id="journal-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] text-xs font-semibold mb-2.5">
              <BookMarked className="w-3.5 h-3.5" />
              <span>Personal Sanctuary Journal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171936] dark:text-[#F3F2FD] tracking-tight">
              My Heart Reflections
            </h2>
            <p className="text-sm text-[#62627A] dark:text-[#A9A8C4] mt-1">
              A private, safe space to write without judgment, express gratitude, and trace your growth.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenExportModal(null)}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] font-bold hover:bg-[#DDD6FE] dark:hover:bg-[#343260] transition-all border border-[#DDD6FE] dark:border-[#3B3868] shadow-2xs active:scale-95"
              title="Export reflections to local storage (PDF or Text)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Journal</span>
            </button>

            <span className="text-xs px-3 py-1.5 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] font-medium border border-[#E9E5EE] dark:border-[#2C2F52]">
              {entries.length} {entries.length === 1 ? 'reflection' : 'reflections'} written
            </span>
          </div>
        </div>

        {/* Quick Inspiration Prompts */}
        <div className="mt-5 pt-4 border-t border-[#F1EEF6] dark:border-[#242742]">
          <span className="text-xs font-semibold text-[#8D8DA0] block mb-2">
            Inspiration for today:
          </span>
          <div className="flex flex-wrap gap-2">
            {INSPIRATION_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setContent(prompt + '\n\n')}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#E9E5EE] dark:border-[#28274B] bg-[#FDFCFE] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB] hover:text-[#7668D8] transition-all text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Writing Box */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 shadow-sm space-y-4">
        {/* Mood Selector & Scripture Attachment */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-semibold text-[#8D8DA0] mr-1">Heart Mood:</span>
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  selectedMood === m.id
                    ? 'bg-[#EEE9FB] dark:bg-[#2B294F] text-[#7668D8] dark:text-[#B2A4FA] font-bold shadow-2xs'
                    : 'bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Attach Scripture Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#8D8DA0] w-full sm:w-auto">
            <Paperclip className="w-3.5 h-3.5" />
            <select
              value={selectedVerseId}
              onChange={(e) => setSelectedVerseId(e.target.value)}
              className="bg-[#F7F4FC] dark:bg-[#20223B] border border-[#E9E5EE] dark:border-[#2F3254] text-xs rounded-xl px-2 py-1 text-[#171936] dark:text-[#F3F2FD] focus:outline-none"
            >
              <option value="">Attach Scripture (Optional)</option>
              {BIBLE_VERSES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.reference} — {v.theme || v.categories[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your honest heart reflections, prayers, moments of gratitude, or worries you are laying down..."
          rows={5}
          className="w-full p-4 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-[#FCFAF8] dark:bg-[#151628] text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] focus:ring-2 focus:ring-[#7668D8]/20 transition-all font-sans leading-relaxed"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#8D8DA0]">
            {savedSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> Reflection saved to your sanctuary!
              </span>
            ) : (
              <span>Your entries are stored safely & sync to your account.</span>
            )}
          </div>

          <button
            onClick={handleSaveEntry}
            disabled={!content.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7668D8] text-white text-xs sm:text-sm font-semibold hover:bg-[#6557cb] active:scale-95 disabled:opacity-50 transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Reflection</span>
          </button>
        </div>
      </div>

      {/* Past Entries List */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8D8DA0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past journal reflections by keyword, date, or mood..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-white dark:bg-[#191B2E] text-xs sm:text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] transition-all"
          />
        </div>

        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-5 sm:p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#F1EEF6] dark:border-[#242742] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{MOODS.find(m => m.id === entry.mood)?.icon || '🕊️'}</span>
                <span className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] capitalize">
                  {entry.mood}
                </span>
                <span className="text-xs text-[#8D8DA0] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {entry.date} at {entry.time}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSpeakEntry(entry)}
                  title="Listen to reflection"
                  className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopyEntry(entry)}
                  title="Copy text"
                  className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
                >
                  {copiedId === entry.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <div className="relative export-menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveExportDropdownId(activeExportDropdownId === entry.id ? null : entry.id);
                    }}
                    title="Export reflection (PDF or Text)"
                    className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors flex items-center gap-0.5"
                  >
                    <Download className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {activeExportDropdownId === entry.id && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-[#20223B] border border-[#E9E5EE] dark:border-[#2F3254] shadow-xl z-30 p-1.5 animate-scale-up space-y-1">
                      <button
                        onClick={() => handleQuickExport(entry, 'pdf')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#171936] dark:text-[#F3F2FD] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] hover:text-[#7668D8] text-left transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#7668D8]" />
                        <span>Export as PDF (.pdf)</span>
                      </button>

                      <button
                        onClick={() => handleQuickExport(entry, 'txt')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#171936] dark:text-[#F3F2FD] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] hover:text-[#7668D8] text-left transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#8D8DA0]" />
                        <span>Export as Text (.txt)</span>
                      </button>

                      <div className="border-t border-[#F1EEF6] dark:border-[#2C2F52] my-1" />

                      <button
                        onClick={() => handleOpenExportModal(entry)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC] dark:hover:bg-[#28274B] text-left transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#8D8DA0]" />
                        <span>Custom export options...</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  title="Delete reflection"
                  className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-rose-500 hover:bg-[#FDE8E8] dark:hover:bg-[#3D1A1A] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#171936] dark:text-[#E2E1F6] whitespace-pre-line font-sans">
              {entry.content}
            </p>

            {/* Attached Scripture Card if present */}
            {entry.verseAttachment && (
              <div className="p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#20223B] border border-[#E9E5EE] dark:border-[#2D3050] text-xs">
                <span className="font-bold text-[#7668D8] dark:text-[#B2A4FA] block mb-1">
                  📖 Attached Scripture: {entry.verseAttachment.reference}
                </span>
                <p className="italic text-[#62627A] dark:text-[#C5C4DE]">
                  “{entry.verseAttachment.text}”
                </p>
              </div>
            )}

            {/* AI Compassionate Reflection */}
            <div className="pt-2">
              {aiReflections[entry.id] ? (
                <div className="p-3.5 rounded-2xl bg-[#EEE9FB]/60 dark:bg-[#242344] border border-[#DDD6FE]/60 dark:border-[#383567] text-xs space-y-1.5 animate-fade-in">
                  <span className="font-bold text-[#7668D8] dark:text-[#B2A4FA] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SoulGuide Reflection</span>
                  </span>
                  <p className="text-[#4C1D95] dark:text-[#DDD6FE] leading-relaxed">
                    {aiReflections[entry.id]}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleAiReflect(entry)}
                  disabled={isReflecting === entry.id}
                  className="flex items-center gap-1.5 text-xs text-[#7668D8] dark:text-[#B2A4FA] hover:underline font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isReflecting === entry.id ? 'Reflecting thoughtfully...' : 'Reflect on this entry with SoulGuide'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Export to Local Storage Modal */}
      <JournalExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allEntries={entries}
        filteredEntries={filteredEntries}
        singleEntry={exportModalEntry}
        aiReflectionsMap={aiReflections}
      />

      {/* Export Success Floating Toast */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#171936] text-white text-xs font-semibold shadow-2xl border border-white/10 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{exportNotification}</span>
        </div>
      )}
    </div>
  );
};

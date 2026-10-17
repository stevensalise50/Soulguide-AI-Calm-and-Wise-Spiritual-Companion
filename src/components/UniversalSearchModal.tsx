import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, BookOpen, Sprout, Sparkles, BookMarked, Heart, ArrowRight } from 'lucide-react';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { LIFE_LESSONS } from '../data/lifeLessons';
import { DAILY_ENCOURAGEMENTS } from '../data/dailyEncouragements';
import { PRAYER_TOPICS } from '../data/prayerTopics';
import { NavPage, BibleVerse, LifeLesson, DailyEncouragementItem, PrayerTemplate } from '../types';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: NavPage) => void;
  onSelectVerse?: (verse: BibleVerse) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectVerse
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { verses: [], lessons: [], dailies: [], prayers: [] };

    // Natural language synonyms mapping
    const fearKeywords = ['afraid', 'fear', 'scared', 'worry', 'anxious'];
    const peaceKeywords = ['peace', 'calm', 'rest', 'still', 'quiet'];
    const strengthKeywords = ['weak', 'tired', 'strength', 'exhausted', 'burden'];

    const matchesWord = (text: string) => {
      if (text.toLowerCase().includes(q)) return true;
      if (fearKeywords.some(k => q.includes(k)) && (text.includes('fear') || text.includes('anxiety') || text.includes('courage'))) return true;
      if (peaceKeywords.some(k => q.includes(k)) && (text.includes('peace') || text.includes('rest') || text.includes('calm'))) return true;
      if (strengthKeywords.some(k => q.includes(k)) && (text.includes('strength') || text.includes('weary') || text.includes('power'))) return true;
      return false;
    };

    const verses = BIBLE_VERSES.filter(v =>
      matchesWord(v.text) ||
      matchesWord(v.reference) ||
      matchesWord(v.categories.join(' ')) ||
      matchesWord(v.keywords.join(' ')) ||
      (v.theme && matchesWord(v.theme))
    ).slice(0, 4);

    const lessons = LIFE_LESSONS.filter(l =>
      matchesWord(l.title) ||
      matchesWord(l.category) ||
      matchesWord(l.corePrinciple) ||
      (l.insight && matchesWord(l.insight))
    ).slice(0, 3);

    const dailies = DAILY_ENCOURAGEMENTS.filter(d =>
      matchesWord(d.encouragement) ||
      matchesWord(d.lifeLesson) ||
      matchesWord(d.dayLabel)
    ).slice(0, 2);

    const prayers = PRAYER_TOPICS.filter(p =>
      matchesWord(p.title) ||
      matchesWord(p.category) ||
      matchesWord(p.description)
    ).slice(0, 2);

    return { verses, lessons, dailies, prayers };
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.verses.length + results.lessons.length + results.dailies.length + results.prayers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#191B2E] rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="relative p-4 sm:p-5 border-b border-[#F1EEF6] dark:border-[#242742] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8D8DA0] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verses, lessons, daily words, prayers (e.g. 'fear', 'patience', 'rest')..."
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-[#8D8DA0] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {!query.trim() ? (
            <div className="text-center py-10">
              <Sparkles className="w-8 h-8 text-[#7668D8] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#171936] dark:text-[#F3F2FD]">
                Search across SoulGuide
              </p>
              <p className="text-xs text-[#8D8DA0] mt-1 max-w-sm mx-auto">
                Type keywords like "fear", "anxiety", "joy", "peace", or specific topics to explore scripture, lessons, and prayers.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-[#171936] dark:text-[#F3F2FD]">
                No direct matches found for "{query}"
              </p>
              <p className="text-xs text-[#8D8DA0] mt-1">
                Try searching for broader themes like "peace", "hope", "strength", or "trust".
              </p>
            </div>
          ) : (
            <>
              {/* Scripture Results */}
              {results.verses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7668D8] dark:text-[#9B8BEA] mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Bible Verses</span>
                  </h4>
                  <div className="space-y-2">
                    {results.verses.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (onSelectVerse) onSelectVerse(v);
                          onNavigate('bible');
                          onClose();
                        }}
                        className="p-3 rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-[#FDFCFE] dark:bg-[#1E2036] hover:bg-[#EEE9FB]/60 dark:hover:bg-[#28274B]/70 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#7668D8] dark:text-[#B2A4FA]">
                            {v.reference}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#EEE9FB] dark:bg-[#2B2A4A] text-[#7668D8] dark:text-[#C4B7FD]">
                            {v.category || 'Scripture'}
                          </span>
                        </div>
                        <p className="text-xs text-[#171936] dark:text-[#E2E1F6] italic line-clamp-2 mt-1">
                          “{v.text}”
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Lessons Results */}
              {results.lessons.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24] mb-2 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Life Lessons</span>
                  </h4>
                  <div className="space-y-2">
                    {results.lessons.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          onNavigate('lessons');
                          onClose();
                        }}
                        className="p-3 rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-[#FDFCFE] dark:bg-[#1E2036] hover:bg-[#FFF4D9]/60 dark:hover:bg-[#342D1C]/70 cursor-pointer transition-colors"
                      >
                        <span className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] block">
                          {l.title}
                        </span>
                        <p className="text-xs text-[#62627A] dark:text-[#9B99BC] line-clamp-2 mt-0.5">
                          {l.corePrinciple || l.insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Word Results */}
              {results.dailies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Daily Word</span>
                  </h4>
                  <div className="space-y-2">
                    {results.dailies.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onNavigate('daily');
                          onClose();
                        }}
                        className="p-3 rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-[#FDFCFE] dark:bg-[#1E2036] hover:bg-[#FFE4E6]/50 dark:hover:bg-[#381B24]/70 cursor-pointer transition-colors"
                      >
                        <span className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] block">
                          {d.dayLabel}
                        </span>
                        <p className="text-xs text-[#62627A] dark:text-[#9B99BC] line-clamp-2 mt-0.5">
                          {d.encouragement}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prayer Sanctuary Results */}
              {results.prayers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prayer Sanctuary</span>
                  </h4>
                  <div className="space-y-2">
                    {results.prayers.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('prayer');
                          onClose();
                        }}
                        className="p-3 rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-[#FDFCFE] dark:bg-[#1E2036] hover:bg-[#EAF6EE]/60 dark:hover:bg-[#1A3324]/70 cursor-pointer transition-colors"
                      >
                        <span className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] block">
                          {p.title}
                        </span>
                        <p className="text-xs text-[#62627A] dark:text-[#9B99BC] line-clamp-2 mt-0.5">
                          {p.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

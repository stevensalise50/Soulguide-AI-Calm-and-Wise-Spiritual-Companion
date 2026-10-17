import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Heart, Sparkles, Filter, Wand2, ArrowRight } from 'lucide-react';
import { BIBLE_VERSES, BIBLE_CATEGORIES } from '../data/bibleVerses';
import { BibleVerse, ScriptureRecommendation } from '../types';
import { BibleVerseCard } from './BibleVerseCard';
import { recommendScriptures } from '../services/scriptureRecommender';
import { ShareScriptureModal } from './ShareScriptureModal';

interface BibleViewProps {
  favoritedVerseIds: string[];
  onToggleFavoriteVerse: (verse: BibleVerse) => void;
  onAskAboutVerse?: (verse: BibleVerse) => void;
}

export const BibleView: React.FC<BibleViewProps> = ({
  favoritedVerseIds,
  onToggleFavoriteVerse,
  onAskAboutVerse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [shareVerse, setShareVerse] = useState<BibleVerse | null>(null);

  // Situation Recommender
  const [situationInput, setSituationInput] = useState('');
  const [activeRecommendation, setActiveRecommendation] = useState<ScriptureRecommendation | null>(null);

  const handleRecommend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!situationInput.trim()) return;
    const rec = recommendScriptures(situationInput.trim());
    setActiveRecommendation(rec);
  };

  const filteredVerses = useMemo(() => {
    return BIBLE_VERSES.filter((verse) => {
      // Favorites filter
      if (showOnlyFavorites && !favoritedVerseIds.includes(verse.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const hasCat = verse.categories.includes(selectedCategory) || verse.category === selectedCategory;
        if (!hasCat) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          verse.text.toLowerCase().includes(q) ||
          verse.reference.toLowerCase().includes(q) ||
          (verse.theme && verse.theme.toLowerCase().includes(q)) ||
          verse.categories.some(c => c.toLowerCase().includes(q)) ||
          verse.keywords.some(k => k.toLowerCase().includes(q)) ||
          verse.shortReflection.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [searchQuery, selectedCategory, showOnlyFavorites, favoritedVerseIds]);

  return (
    <div id="bible-section-view" className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3FB] dark:bg-[#1E2D44] text-[#2563EB] dark:text-[#93C5FD] text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Living Scripture & Sacred Truth</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171936] dark:text-[#F3F2FD] tracking-tight">
              Bible & Sacred Wisdom
            </h2>
            <p className="text-sm text-[#62627A] dark:text-[#A9A8C4] mt-1">
              Explore timeless promises, strength for weariness, and peace for anxious thoughts.
            </p>
          </div>

          {/* Favorites Filter Button */}
          <button
            id="toggle-favorites-filter-btn"
            onClick={() => setShowOnlyFavorites((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all shrink-0 ${
              showOnlyFavorites
                ? 'bg-[#F43F5E] text-white border-[#F43F5E] shadow-sm'
                : 'bg-[#FCFAF8] dark:bg-[#20223B] border-[#E9E5EE] dark:border-[#2E3152] text-[#62627A] dark:text-[#A9A8C4] hover:border-[#F43F5E]'
            }`}
          >
            <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            <span>Saved Favorites ({favoritedVerseIds.length})</span>
          </button>
        </div>

        {/* Intelligent Scripture Finder Form */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F9F7FE] via-[#F2EEFD] to-[#EDF4FE] dark:from-[#21233F] dark:via-[#262548] dark:to-[#1B273F] border border-[#E3DCFA] dark:border-[#33315B]">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-[#7668D8] dark:text-[#B2A4FA]" />
            <span className="text-xs font-bold text-[#7668D8] dark:text-[#B2A4FA] uppercase tracking-wider">
              Scripture Recommendation Engine
            </span>
          </div>
          <form onSubmit={handleRecommend} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={situationInput}
              onChange={(e) => setSituationInput(e.target.value)}
              placeholder="Describe your situation (e.g. 'I feel like giving up because everything keeps going wrong')..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E9E5EE] dark:border-[#2F3254] bg-white dark:bg-[#151628] text-xs sm:text-sm text-[#171936] dark:text-[#F3F2FD] focus:outline-none focus:border-[#7668D8]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#7668D8] text-white text-xs font-bold hover:bg-[#6757cf] transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Find Relevant Verses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Active Recommendation Card */}
          {activeRecommendation && (
            <div className="mt-4 pt-4 border-t border-[#E3DCFA] dark:border-[#33315B] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#7668D8] dark:text-[#B2A4FA]">
                  Identified Themes: {activeRecommendation.identifiedConcepts.join(' • ')}
                </span>
                <button
                  onClick={() => setActiveRecommendation(null)}
                  className="text-[#8D8DA0] hover:text-[#171936] dark:hover:text-[#F3F2FD]"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BibleVerseCard
                  verse={activeRecommendation.primaryVerse}
                  isFavorited={favoritedVerseIds.includes(activeRecommendation.primaryVerse.id)}
                  onToggleFavorite={onToggleFavoriteVerse}
                  onShareCard={(v) => setShareVerse(v)}
                />
                <div className="p-4 rounded-2xl bg-white dark:bg-[#191B2E] border border-[#E9E5EE] dark:border-[#292C48] flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#7668D8] dark:text-[#B2A4FA] uppercase tracking-wider mb-1">
                      Guidance Context
                    </h5>
                    <p className="text-xs text-[#62627A] dark:text-[#C5C4DE] leading-relaxed mb-3">
                      {activeRecommendation.explanation}
                    </p>
                    <div className="p-3 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B] border border-[#E9E5EE] dark:border-[#2D3050]">
                      <span className="text-[11px] font-bold text-[#171936] dark:text-[#F3F2FD] block mb-1">
                        💭 Thoughtful Reflection:
                      </span>
                      <p className="text-xs text-[#62627A] dark:text-[#A9A8C4] italic">
                        "{activeRecommendation.reflectionQuestion}"
                      </p>
                    </div>
                  </div>
                  {activeRecommendation.suggestedPrayer && (
                    <p className="text-[11px] text-[#62627A] dark:text-[#9B99BC] mt-3 pt-2 border-t border-[#F1EEF6] dark:border-[#242742]">
                      🙏 <em>{activeRecommendation.suggestedPrayer}</em>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8D8DA0]" />
          <input
            id="bible-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verses by topic, keyword, or book (e.g., 'Matthew', 'peace', 'anxiety', 'fear')..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-[#FCFAF8] dark:bg-[#151628] text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] focus:ring-2 focus:ring-[#7668D8]/20 transition-all"
          />
        </div>

        {/* Categories Carousel */}
        {!showOnlyFavorites && (
          <div className="mt-4 pt-4 border-t border-[#F1EEF6] dark:border-[#242742] flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-semibold text-[#8D8DA0] shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Theme:</span>
            </span>
            {BIBLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#7668D8] text-white shadow-xs'
                      : 'bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB] hover:text-[#7668D8]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Verses Grid */}
      {filteredVerses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredVerses.map((verse) => (
            <div key={verse.id} className="flex flex-col justify-between">
              <BibleVerseCard
                verse={verse}
                isFavorited={favoritedVerseIds.includes(verse.id)}
                onToggleFavorite={onToggleFavoriteVerse}
                onShareCard={(v) => setShareVerse(v)}
                className="h-full"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-12 text-center">
          <BookOpen className="w-10 h-10 text-[#8D8DA0] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[#171936] dark:text-[#F3F2FD]">
            {showOnlyFavorites ? 'No saved favorite verses yet' : 'No matching verses found'}
          </h3>
          <p className="text-xs text-[#62627A] dark:text-[#8D8DA0] mt-1 max-w-sm mx-auto">
            {showOnlyFavorites
              ? 'Click the heart icon on any scripture card to save verses to your personal sanctuary.'
              : 'Try searching with a different word like "hope", "fear", "rest", or choose "All Verses".'}
          </p>
          {showOnlyFavorites && (
            <button
              onClick={() => setShowOnlyFavorites(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#7668D8] text-white text-xs font-semibold hover:bg-[#6757cf] transition-all"
            >
              Browse All Verses
            </button>
          )}
        </div>
      )}

      {/* Developer Watermark Footer */}
      <div className="text-center pt-6 border-t border-[#F1EEF6] dark:border-[#242742] text-xs text-[#8D8DA0] dark:text-[#6E7092] flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 text-[#7668D8] fill-current" />
        <span>Scripture Collection • Developed by <strong>Sthevhien Rhick P. Salise Everywhere</strong></span>
      </div>

      {/* Share Modal */}
      <ShareScriptureModal
        verse={shareVerse}
        isOpen={Boolean(shareVerse)}
        onClose={() => setShareVerse(null)}
      />
    </div>
  );
};

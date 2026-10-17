import React, { useState } from 'react';
import { Sparkles, RefreshCw, Heart, Share2, Check, BookOpen, Lightbulb, Compass, Volume2, ArrowLeft, ArrowRight, Shuffle, CheckCircle2 } from 'lucide-react';
import { DAILY_ENCOURAGEMENTS } from '../data/dailyEncouragements';
import { BibleVerseCard } from './BibleVerseCard';
import { BibleVerse } from '../types';
import { voiceService } from '../services/voiceService';
import { ShareScriptureModal } from './ShareScriptureModal';

interface DailyEncouragementViewProps {
  onToggleFavoriteVerse: (verse: BibleVerse) => void;
  favoritedVerseIds: string[];
  onTalkAboutThis: (topic: string) => void;
  onOpenVoiceSettings?: () => void;
}

export const DailyEncouragementView: React.FC<DailyEncouragementViewProps> = ({
  onToggleFavoriteVerse,
  favoritedVerseIds,
  onTalkAboutThis,
  onOpenVoiceSettings
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareVerse, setShareVerse] = useState<BibleVerse | null>(null);
  const [actionDone, setActionDone] = useState(false);

  const current = DAILY_ENCOURAGEMENTS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_ENCOURAGEMENTS.length);
    setActionDone(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DAILY_ENCOURAGEMENTS.length) % DAILY_ENCOURAGEMENTS.length);
    setActionDone(false);
  };

  const handleRandom = () => {
    const nextIdx = Math.floor(Math.random() * DAILY_ENCOURAGEMENTS.length);
    setCurrentIndex(nextIdx);
    setActionDone(false);
  };

  const handleListen = () => {
    const text = `${current.encouragement}. ${current.message || ''} Life lesson: ${current.lifeLesson}. Reflection: ${current.reflection}. Action for today: ${current.action || ''}`;
    voiceService.speak(`daily-${current.id}`, text, `Daily Word: ${current.dayLabel}`);
  };

  const handleShare = () => {
    const text = `SoulGuide Daily Word: ${current.dayLabel}\n\n"${current.encouragement}"\n\nLesson: ${current.lifeLesson}\n— ${current.verse.reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="daily-encouragement-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-gradient-to-br from-[#7668D8] via-[#8C7CE4] to-[#A092EC] text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{current.dayLabel}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              A Gentle Word for Your Soul
            </h2>
            <p className="text-sm text-white/80 mt-1 max-w-lg">
              Take a quiet breath and let these words steady your heart today.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleListen}
              title="Listen with warm 0.94x voice"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white active:scale-95 font-semibold text-xs transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen</span>
            </button>

            <button
              onClick={handleRandom}
              title="Surprise me with a random encouraging word"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white active:scale-95 font-semibold text-xs transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Random</span>
            </button>

            <div className="flex items-center gap-1 bg-white rounded-2xl p-0.5 shadow-sm">
              <button
                onClick={handlePrev}
                title="Previous word"
                className="p-1.5 rounded-xl text-[#7668D8] hover:bg-[#F7F4FC] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#7668D8] px-1">
                {currentIndex + 1} / {DAILY_ENCOURAGEMENTS.length}
              </span>
              <button
                onClick={handleNext}
                title="Next word"
                className="p-1.5 rounded-xl text-[#7668D8] hover:bg-[#F7F4FC] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Encouragement Card */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#7668D8] dark:text-[#9B8BEA] flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-current" />
              <span>Today's Core Encouragement</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShareVerse(current.verse)}
                className="flex items-center gap-1 text-xs text-[#8D8DA0] hover:text-[#7668D8] transition-colors"
                title="Create Shareable Card"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Card</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-xs text-[#8D8DA0] hover:text-[#7668D8] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className="text-lg sm:text-xl leading-relaxed text-[#171936] dark:text-[#F3F2FD] font-medium font-sans">
            “{current.encouragement}”
          </p>

          {current.message && (
            <p className="text-xs sm:text-sm text-[#62627A] dark:text-[#A9A8C4] leading-relaxed mt-3 pt-3 border-t border-[#F1EEF6] dark:border-[#242742]">
              {current.message}
            </p>
          )}
        </div>

        {/* Life Lesson & Reflection Bento Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#F1EEF6] dark:border-[#242742]">
          {/* Life Lesson */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF4D9]/60 dark:bg-[#2F291B] border border-[#FDE68A]/60 dark:border-[#4B3E22]">
            <h4 className="text-sm font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Life Lesson</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#78350F] dark:text-[#FCD34D] leading-relaxed">
              {current.lifeLesson}
            </p>
          </div>

          {/* Reflection */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#E8F3FB]/60 dark:bg-[#1E2D44] border border-[#BFDBFE]/60 dark:border-[#2E4364]">
            <h4 className="text-sm font-bold text-[#2563EB] dark:text-[#93C5FD] flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4" />
              <span>Thoughtful Reflection</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#1E3A8A] dark:text-[#BFDBFE] leading-relaxed">
              {current.reflection}
            </p>
          </div>
        </div>

        {/* Prayer & Action Bento */}
        {(current.prayer || current.action) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Prayer */}
            {current.prayer && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#EEE9FB]/60 dark:bg-[#252445] border border-[#DDD6FE]/60 dark:border-[#3A3868]">
                <h4 className="text-xs font-bold text-[#7668D8] dark:text-[#B2A4FA] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Today's Short Prayer</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#4C1D95] dark:text-[#DDD6FE] italic leading-relaxed">
                  “{current.prayer}”
                </p>
              </div>
            )}

            {/* Daily Action */}
            {current.action && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4]/70 dark:bg-[#1A3324] border border-[#BBF7D0]/60 dark:border-[#2C523B] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Small Action Today</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    {current.action}
                  </p>
                </div>
                <button
                  onClick={() => setActionDone(!actionDone)}
                  className={`mt-3 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    actionDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{actionDone ? 'Completed Today! 🎉' : 'Mark as Done'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Accompanying Scripture Card */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#62627A] dark:text-[#A9A8C4] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#7668D8]" />
              <span>Scripture Anchor for Today</span>
            </span>

            <button
              onClick={() => onTalkAboutThis(`Can we talk about today's daily word: "${current.encouragement}"?`)}
              className="text-xs font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:underline"
            >
              Talk about this with SoulGuide →
            </button>
          </div>

          <BibleVerseCard
            verse={current.verse}
            isFavorited={favoritedVerseIds.includes(current.verse.id)}
            onToggleFavorite={onToggleFavoriteVerse}
            onShareCard={(v) => setShareVerse(v)}
          />
        </div>
      </div>

      {/* Share Card Modal */}
      <ShareScriptureModal
        verse={shareVerse}
        isOpen={Boolean(shareVerse)}
        onClose={() => setShareVerse(null)}
      />
    </div>
  );
};

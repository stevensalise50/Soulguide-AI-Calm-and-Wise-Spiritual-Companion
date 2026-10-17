import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Copy, Check, Volume2, Share2, Sparkles } from 'lucide-react';
import { BibleVerse, VoicePlaybackState } from '../types';
import { voiceService } from '../services/voiceService';

interface BibleVerseCardProps {
  verse: BibleVerse;
  isFavorited?: boolean;
  onToggleFavorite?: (verse: BibleVerse) => void;
  onShareCard?: (verse: BibleVerse) => void;
  className?: string;
  compact?: boolean;
}

export const BibleVerseCard: React.FC<BibleVerseCardProps> = ({
  verse,
  isFavorited = false,
  onToggleFavorite,
  onShareCard,
  className = '',
  compact = false
}) => {
  const [copied, setCopied] = useState(false);
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  useEffect(() => {
    const unsub = voiceService.subscribe(setVoiceState);
    return unsub;
  }, []);

  const isSpeaking = voiceState.isPlaying && voiceState.activeId === `verse-${verse.id}`;

  const handleCopy = () => {
    const textToCopy = `"${verse.text}" — ${verse.reference} (${verse.translation})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    const textToSpeak = `${verse.text}. ${verse.reference}.`;
    voiceService.speak(`verse-${verse.id}`, textToSpeak, verse.reference, true);
  };

  return (
    <div
      id={`verse-${verse.id}`}
      className={`rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-4 sm:p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F3FB] dark:bg-[#20293D] text-[#3B82F6] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#171936] dark:text-[#F3F2FD] flex items-center gap-1.5">
                <span>📖 Sacred Scripture</span>
              </h4>
              {(verse.theme || verse.categories?.[0]) && (
                <p className="text-[11px] text-[#62627A] dark:text-[#A9A8C4] capitalize">
                  {verse.theme || verse.categories?.[0]}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              id={`speak-verse-${verse.id}`}
              onClick={handleSpeak}
              title={isSpeaking ? 'Stop audio' : 'Listen to verse (0.94x warm voice)'}
              className={`p-1.5 rounded-lg transition-colors text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] ${isSpeaking ? 'text-[#7668D8] bg-[#EEE9FB] dark:bg-[#28274B]' : ''}`}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {onShareCard && (
              <button
                onClick={() => onShareCard(verse)}
                title="Create Shareable Scripture Card"
                className="p-1.5 rounded-lg transition-colors text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B]"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              id={`copy-verse-${verse.id}`}
              onClick={handleCopy}
              title="Copy verse"
              className="p-1.5 rounded-lg transition-colors text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {onToggleFavorite && (
              <button
                id={`fav-verse-${verse.id}`}
                onClick={() => onToggleFavorite(verse)}
                title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                className={`p-1.5 rounded-lg transition-transform active:scale-125 ${
                  isFavorited
                    ? 'text-[#F43F5E] bg-[#FFE4E6] dark:bg-[#4C1D24]'
                    : 'text-[#8D8DA0] hover:text-[#F43F5E] hover:bg-[#F5EAF2] dark:hover:bg-[#2F1F2B]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Verse body */}
        <blockquote className="text-[15px] sm:text-base leading-relaxed italic text-[#171936] dark:text-[#E2E1F6] font-normal my-2.5 font-serif pl-3 border-l-2 border-[#7668D8]">
          “{verse.text}”
        </blockquote>
      </div>

      <div>
        {/* Reference & Translation */}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-2 border-t border-[#F1EEF6] dark:border-[#23253F] text-xs">
          <span className="font-semibold text-[#7668D8] dark:text-[#9B8BEA]">
            — {verse.reference} <span className="text-[11px] font-normal text-[#8D8DA0]">({verse.translation})</span>
          </span>
          
          {verse.categories && verse.categories.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {verse.categories.slice(0, 2).map((c) => (
                <span key={c} className="capitalize px-2 py-0.5 rounded-md bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] text-[10.5px] font-medium">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reflection Note */}
        {!compact && (verse.shortReflection || verse.contextNote) && (
          <p className="mt-2 text-xs text-[#62627A] dark:text-[#9B99BC] bg-[#F7F4FC] dark:bg-[#1E2036] p-2.5 rounded-xl leading-relaxed">
            💡 <span className="font-medium text-[#7668D8] dark:text-[#B2A4FA]">Reflection:</span> {verse.shortReflection || verse.contextNote}
          </p>
        )}
      </div>
    </div>
  );
};

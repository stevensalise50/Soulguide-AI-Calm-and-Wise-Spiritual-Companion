import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Heart, Smartphone, Square, Share2 } from 'lucide-react';
import { BibleVerse } from '../types';

interface ShareScriptureModalProps {
  verse: BibleVerse | null;
  isOpen: boolean;
  onClose: () => void;
}

type CardFormat = 'square' | 'story';
type CardTheme = 'lavender' | 'dawn' | 'midnight' | 'sage';

export const ShareScriptureModal: React.FC<ShareScriptureModalProps> = ({ verse, isOpen, onClose }) => {
  const [format, setFormat] = useState<CardFormat>('square');
  const [theme, setTheme] = useState<CardTheme>('lavender');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !verse) return null;

  const handleCopyText = () => {
    const textToCopy = `“${verse.text}”\n— ${verse.reference} (${verse.translation})\n\nShared via SoulGuide`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dawn':
        return 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] text-[#78350F] border-[#FCD34D]';
      case 'midnight':
        return 'bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-[#F8FAFC] border-[#4338CA]';
      case 'sage':
        return 'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] text-[#14532D] border-[#86EFAC]';
      case 'lavender':
      default:
        return 'bg-gradient-to-br from-[#F5F2FC] via-[#EDE7F6] to-[#DDD6FE] text-[#1E1B4B] border-[#C4B5FD]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#191B2E] rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1EEF6] dark:border-[#242742]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171936] dark:text-[#F3F2FD]">
                Share Scripture Card
              </h3>
              <p className="text-xs text-[#62627A] dark:text-[#9B99BC]">
                Beautiful, uplifting cards for stories, posts & wallpaper
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

        {/* Controls: Format & Theme */}
        <div className="py-3 flex items-center justify-between gap-3 flex-wrap text-xs font-semibold">
          {/* Format Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F7F4FC] dark:bg-[#20223B]">
            <button
              onClick={() => setFormat('square')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                format === 'square'
                  ? 'bg-white dark:bg-[#2B2D4B] text-[#7668D8] dark:text-[#B2A4FA] shadow-xs'
                  : 'text-[#62627A] dark:text-[#8D8DA0]'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Feed (1:1)</span>
            </button>
            <button
              onClick={() => setFormat('story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                format === 'story'
                  ? 'bg-white dark:bg-[#2B2D4B] text-[#7668D8] dark:text-[#B2A4FA] shadow-xs'
                  : 'text-[#62627A] dark:text-[#8D8DA0]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Story (9:16)</span>
            </button>
          </div>

          {/* Theme palette pills */}
          <div className="flex items-center gap-1.5">
            {(['lavender', 'dawn', 'sage', 'midnight'] as CardTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  theme === t ? 'scale-110 ring-2 ring-[#7668D8]' : 'opacity-80'
                } ${
                  t === 'lavender' ? 'bg-[#DDD6FE] border-[#C4B5FD]' :
                  t === 'dawn' ? 'bg-[#FDE68A] border-[#FCD34D]' :
                  t === 'sage' ? 'bg-[#BBF7D0] border-[#86EFAC]' :
                  'bg-[#1E1B4B] border-[#4338CA]'
                }`}
                title={`Theme: ${t}`}
              />
            ))}
          </div>
        </div>

        {/* Card Preview Window */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center py-4 my-auto">
          <div
            id="share-preview-card"
            className={`w-full transition-all border shadow-lg flex flex-col justify-between p-6 sm:p-7 relative overflow-hidden rounded-3xl ${getThemeClasses()} ${
              format === 'story' ? 'aspect-[9/14] max-w-[280px]' : 'aspect-square max-w-[340px]'
            }`}
          >
            {/* Top Brand Tag */}
            <div className="flex items-center justify-between text-xs font-semibold opacity-85">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SoulGuide</span>
              </span>
              <span className="text-[11px] uppercase tracking-wider">{verse.category || 'Scripture'}</span>
            </div>

            {/* Main Verse Text */}
            <div className="my-auto py-2">
              <p className="font-serif text-lg sm:text-xl leading-relaxed italic text-center font-normal">
                “{verse.text}”
              </p>
              <p className="text-center text-xs sm:text-sm font-bold tracking-wide mt-3.5 opacity-90">
                — {verse.reference} <span className="text-[11px] font-normal opacity-75">({verse.translation})</span>
              </p>
            </div>

            {/* Bottom Subtle Watermark */}
            <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[10px] opacity-75">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" />
                <span>Peace • Faith • Life</span>
              </span>
              <span>Dev: Sthevhien Salise</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#F1EEF6] dark:border-[#242742] flex items-center justify-between gap-3">
          <p className="text-xs text-[#8D8DA0]">
            Copy text or capture preview to share.
          </p>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7668D8] text-white hover:bg-[#6757cf] active:scale-95 text-xs font-semibold transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Scripture'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

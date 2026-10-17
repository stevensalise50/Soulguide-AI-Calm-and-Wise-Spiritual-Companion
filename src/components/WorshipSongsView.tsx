import React, { useState } from 'react';
import { Music, Play, Pause, Sparkles, Wand2, Download, Volume2, Heart, Search, RefreshCw, BookOpen, Clock, FileText } from 'lucide-react';
import { GeneratedSong } from '../types';
import { requestSongGeneration } from '../services/musicService';
import { SongPlayerCard } from './SongPlayerCard';

interface WorshipSongsViewProps {
  onStartChatWithPrompt?: (prompt: string) => void;
}

const PRESET_WORSHIP_THEMES = [
  {
    title: 'Still Waters in the Storm',
    theme: 'Peace & Rest',
    verse: 'Psalm 23:2 — "He leads me beside still waters. He restores my soul."',
    prompt: 'Gentle acoustic Christian worship song about peace and quiet rest beside still waters, soothing acoustic guitar and soft piano',
    model: 'lyria-3-clip-preview' as const
  },
  {
    title: 'Anchor of My Soul',
    theme: 'Freedom from Fear & Anxiety',
    verse: 'Hebrews 6:19 — "We have this hope as an anchor for the soul, firm and secure."',
    prompt: 'Calming reverent worship hymn about trusting God through severe storms, gentle piano and strings',
    model: 'lyria-3-clip-preview' as const
  },
  {
    title: 'Wisdom in the Quiet',
    theme: 'Academic Peace & Clarity',
    verse: 'James 1:5 — "If any of you lacks wisdom, you should ask God, who gives generously to all."',
    prompt: 'Peaceful acoustic melody to calm racing thoughts and academic pressure, soft fingerpicking guitar',
    model: 'lyria-3-clip-preview' as const
  },
  {
    title: 'Morning of Grace',
    theme: 'Praise & Thanksgiving',
    verse: 'Lamentations 3:22–23 — "His compassions never fail. They are new every morning."',
    prompt: 'Uplifting joyful acoustic worship song praising God for a new day and fresh mercies',
    model: 'lyria-3-clip-preview' as const
  },
  {
    title: 'Held in Everlasting Arms',
    theme: 'Comfort in Sorrow & Weariness',
    verse: 'Deuteronomy 33:27 — "The eternal God is your refuge, and underneath are the everlasting arms."',
    prompt: 'Deeply tender Christian prayer song offering quiet solace and comfort to a broken heart',
    model: 'lyria-3-pro-preview' as const
  }
];

export const WorshipSongsView: React.FC<WorshipSongsViewProps> = ({
  onStartChatWithPrompt
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSongs, setGeneratedSongs] = useState<GeneratedSong[]>([]);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);

  const handleGenerateCustomSong = async () => {
    if (!customPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const placeholder: GeneratedSong = {
      id: `song-temp-${Date.now()}`,
      title: customPrompt.slice(0, 32),
      prompt: customPrompt,
      model: selectedModel,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGenerating: true
    };

    setGeneratedSongs((prev) => [placeholder, ...prev]);

    try {
      const song = await requestSongGeneration(customPrompt, selectedModel);
      setGeneratedSongs((prev) =>
        prev.map((s) => (s.id === placeholder.id ? song : s))
      );
      setCustomPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePreset = async (preset: typeof PRESET_WORSHIP_THEMES[0]) => {
    if (isGenerating) return;
    setIsGenerating(true);

    const placeholder: GeneratedSong = {
      id: `song-temp-${Date.now()}`,
      title: preset.title,
      theme: preset.theme,
      prompt: preset.prompt,
      model: preset.model,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGenerating: true
    };

    setGeneratedSongs((prev) => [placeholder, ...prev]);

    try {
      const song = await requestSongGeneration(preset.prompt, preset.model, preset.title);
      setGeneratedSongs((prev) =>
        prev.map((s) => (s.id === placeholder.id ? song : s))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgradeSong = async (song: GeneratedSong) => {
    setUpgradingId(song.id);
    try {
      const upgraded = await requestSongGeneration(
        song.prompt || song.title,
        'lyria-3-pro-preview',
        song.title
      );
      setGeneratedSongs((prev) =>
        prev.map((s) => (s.id === song.id ? upgraded : s))
      );
    } finally {
      setUpgradingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#7668D8] via-[#8C7DEC] to-[#A392F8] p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Music className="w-3.5 h-3.5" />
            <span>AI Music Generation with Lyria 3</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Worship Songs & Peaceful Melodies
          </h2>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
            Generate soothing Christian acoustic worship tracks, calming piano hymns, and spiritual songs tailored to what your soul needs today.
          </p>
        </div>
      </div>

      {/* Generator Box */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#2A2D4E] bg-white dark:bg-[#191B2E] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#7668D8]" />
            <h3 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD]">
              Create a Custom Song
            </h3>
          </div>
          
          {/* Model selector pill */}
          <div className="flex items-center p-1 rounded-2xl bg-[#F4F1FA] dark:bg-[#20223D] border border-[#ECE7F6] dark:border-[#2C2E52] text-xs font-semibold">
            <button
              onClick={() => setSelectedModel('lyria-3-clip-preview')}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedModel === 'lyria-3-clip-preview'
                  ? 'bg-white dark:bg-[#2C2F52] text-[#7668D8] dark:text-[#C4B7FD] shadow-2xs'
                  : 'text-[#62627A] dark:text-[#9B99BC]'
              }`}
            >
              Lyria 3 (30s Clip)
            </button>
            <button
              onClick={() => setSelectedModel('lyria-3-pro-preview')}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedModel === 'lyria-3-pro-preview'
                  ? 'bg-white dark:bg-[#2C2F52] text-[#7668D8] dark:text-[#C4B7FD] shadow-2xs'
                  : 'text-[#62627A] dark:text-[#9B99BC]'
              }`}
            >
              Lyria 3 Pro (Full Track)
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe what kind of song your heart needs (e.g., 'A peaceful acoustic song about finding calm during finals week', 'Worship hymn about God's faithfulness in grief')..."
            rows={2}
            className="w-full resize-none p-3.5 rounded-2xl border border-[#E9E5EE] dark:border-[#2E3154] bg-[#FAF8FE] dark:bg-[#151628] text-xs sm:text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] focus:ring-2 focus:ring-[#7668D8]/20 transition-all"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#62627A] dark:text-[#9A98BD]">
              {selectedModel === 'lyria-3-pro-preview' ? 'Full track generation with Lyria 3 Pro' : 'Short clip generation (up to 30s) with Lyria 3'}
            </span>

            <button
              onClick={handleGenerateCustomSong}
              disabled={!customPrompt.trim() || isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7668D8] hover:bg-[#6557cb] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Composing Melody...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Song</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Songs List */}
      {generatedSongs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] flex items-center gap-1.5">
              <span>Your Generated Songs</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#C4B7FD]">
                {generatedSongs.length}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedSongs.map((song) => (
              <div key={song.id} className="relative">
                <SongPlayerCard
                  song={song}
                  onUpgradeToFullTrack={handleUpgradeSong}
                  isUpgrading={upgradingId === song.id}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preset Sacred Themes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[#7668D8]" />
          <span>Curated Worship Melodies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PRESET_WORSHIP_THEMES.map((theme, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3xl border border-[#ECE7F6] dark:border-[#2C2E50] bg-white dark:bg-[#1A1C30] hover:border-[#7668D8]/50 hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#C4B7FD]">
                    {theme.theme}
                  </span>
                  <span className="text-[9.5px] text-[#8D8DA0]">
                    {theme.model === 'lyria-3-pro-preview' ? 'Lyria 3 Pro' : 'Lyria 3'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] mt-1.5">
                  {theme.title}
                </h4>
                <p className="text-xs text-[#62627A] dark:text-[#9A98BD] italic mt-1 font-serif">
                  {theme.verse}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F1EEF6] dark:border-[#262846]">
                {onStartChatWithPrompt && (
                  <button
                    onClick={() => onStartChatWithPrompt(`SoulGuide, can you give me a song like "${theme.title}" about ${theme.theme}?`)}
                    className="text-[11px] font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:underline"
                  >
                    Ask in Chat
                  </button>
                )}

                <button
                  onClick={() => handleGeneratePreset(theme)}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEE9FB] dark:bg-[#28274B] hover:bg-[#7668D8] hover:text-white text-[#7668D8] dark:text-[#C4B7FD] text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Generate Track</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

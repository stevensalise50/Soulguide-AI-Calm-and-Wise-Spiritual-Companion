import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, Download, FileText, ChevronDown, ChevronUp, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { GeneratedSong } from '../types';

interface SongPlayerCardProps {
  song: GeneratedSong;
  onUpgradeToFullTrack?: (song: GeneratedSong) => void;
  isUpgrading?: boolean;
}

export const SongPlayerCard: React.FC<SongPlayerCardProps> = ({
  song,
  onUpgradeToFullTrack,
  isUpgrading = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [song.audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    if (!song.audioUrl && !song.audioBase64) return;
    const link = document.createElement('a');
    link.href = song.audioUrl || `data:${song.mimeType || 'audio/wav'};base64,${song.audioBase64}`;
    link.download = `${song.title.replace(/\s+/g, '_')}_SoulGuide.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If currently generating
  if (song.isGenerating) {
    return (
      <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-[#F4EFFF] to-[#EDE7FB] dark:from-[#212040] dark:to-[#28264E] border border-[#DDD4F6] dark:border-[#38346B] shadow-2xs animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7668D8] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Music className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD]">
                Composing "{song.title || 'SoulGuide Song'}"
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7668D8]/10 text-[#7668D8] dark:text-[#C4B7FD] font-semibold">
                {song.model === 'lyria-3-pro-preview' ? 'Lyria 3 Pro (Full Track)' : 'Lyria 3 (Clip)'}
              </span>
            </div>
            <p className="text-[11px] text-[#62627A] dark:text-[#A9A8C4] mt-0.5">
              Harmonizing acoustic chords, peaceful piano, and worship lyrics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#FAF8FE] to-[#F1ECFB] dark:from-[#1D1F38] dark:to-[#25284B] border border-[#E2DCF4] dark:border-[#343764] p-4 sm:p-5 shadow-xs transition-all">
      {/* Hidden Audio Element */}
      {song.audioUrl && (
        <audio
          ref={audioRef}
          src={song.audioUrl}
          preload="metadata"
        />
      )}

      {/* Header: Title, theme tag & Lyria Model Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-2xl bg-[#7668D8] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Music className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#171936] dark:text-[#F3F2FD] truncate flex items-center gap-1.5">
              <span>{song.title}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </h4>
            <p className="text-[10.5px] text-[#7668D8] dark:text-[#B2A4FA] font-medium truncate">
              {song.theme || 'Christian Worship Melody'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#EEE9FB] dark:bg-[#2C2952] text-[#7668D8] dark:text-[#C4B7FD] font-bold border border-[#DDD4F6] dark:border-[#3C386D]">
            {song.model === 'lyria-3-pro-preview' ? 'Lyria 3 Pro' : 'Lyria 3 Clip'}
          </span>
        </div>
      </div>

      {/* Animated Sound Waveform / EQ bars */}
      <div className="h-10 my-2 px-2 rounded-2xl bg-white/70 dark:bg-[#15162B]/70 border border-[#ECE7F6] dark:border-[#2C2E50] flex items-center justify-center gap-1 overflow-hidden">
        {[20, 45, 75, 90, 60, 30, 85, 100, 70, 40, 65, 95, 80, 50, 35, 70, 90, 60, 40, 85, 55, 30].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              isPlaying
                ? 'bg-gradient-to-t from-[#7668D8] to-[#9E90F4]'
                : 'bg-[#DDD7EE] dark:bg-[#34375A]'
            }`}
            style={{
              height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1) * 0.35) % 100)}%` : '20%',
              animation: isPlaying ? `pulse 1.2s ease-in-out infinite alternate ${i * 70}ms` : 'none'
            }}
          />
        ))}
      </div>

      {/* Player Controls & Scrubber */}
      <div className="space-y-2 mt-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={togglePlay}
            disabled={!song.audioUrl && !song.audioBase64}
            className="w-10 h-10 rounded-2xl bg-[#7668D8] hover:bg-[#6557cb] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-2xs transition-all disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play peaceful song'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Time Scrubber */}
          <div className="flex-1 flex flex-col justify-center">
            <input
              type="range"
              min="0"
              max={duration || 30}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#DDD7EE] dark:bg-[#303358] rounded-lg appearance-none cursor-pointer accent-[#7668D8]"
            />
            <div className="flex items-center justify-between text-[10px] text-[#8D8DA0] dark:text-[#9A98BD] mt-1 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || 30)}</span>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-white/80 dark:hover:bg-[#282B4F] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download Audio */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-white/80 dark:hover:bg-[#282B4F] transition-colors"
            title="Download song (.wav)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lyrics Toggle & Pro Model Extension */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#E8E2F5] dark:border-[#2C2E52]">
        {song.lyrics ? (
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showLyrics ? 'Hide Lyrics' : 'View Lyrics'}</span>
            {showLyrics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        ) : (
          <span className="text-[10px] text-[#8D8DA0]">Instrumental Christian Melody</span>
        )}

        {/* Upgrade / Extend to Lyria 3 Pro full track */}
        {song.model === 'lyria-3-clip-preview' && onUpgradeToFullTrack && (
          <button
            onClick={() => onUpgradeToFullTrack(song)}
            disabled={isUpgrading}
            className="flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-xl bg-white dark:bg-[#1F213D] text-[#7668D8] dark:text-[#C4B7FD] hover:bg-[#EEE9FB] dark:hover:bg-[#2C2D54] border border-[#DDD4F6] dark:border-[#383B65] font-semibold transition-all disabled:opacity-50"
          >
            {isUpgrading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Extending...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 text-amber-500" />
                <span>Full Track (Lyria Pro)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Expanded Lyrics Card */}
      {showLyrics && song.lyrics && (
        <div className="mt-3 p-3.5 rounded-2xl bg-white/90 dark:bg-[#16172B]/90 border border-[#ECE7F6] dark:border-[#2B2D4F] text-xs leading-relaxed text-[#2C2D4A] dark:text-[#E2E1F8] whitespace-pre-line font-serif animate-fade-in">
          <p className="font-sans text-[10.5px] font-bold text-[#7668D8] uppercase tracking-wider mb-2">
            Worship Lyrics:
          </p>
          {song.lyrics}
        </div>
      )}

      {song.note && (
        <p className="text-[10px] text-[#8D8DA0] italic mt-2">
          {song.note}
        </p>
      )}
    </div>
  );
};

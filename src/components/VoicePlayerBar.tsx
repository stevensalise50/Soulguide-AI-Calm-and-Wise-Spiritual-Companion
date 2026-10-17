import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Volume2, Settings2, Sparkles, Heart } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { VoicePlaybackState } from '../types';

interface VoicePlayerBarProps {
  onOpenVoiceSettings: () => void;
}

export const VoicePlayerBar: React.FC<VoicePlayerBarProps> = ({ onOpenVoiceSettings }) => {
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  useEffect(() => {
    const unsubscribe = voiceService.subscribe(setVoiceState);
    return unsubscribe;
  }, []);

  if (!voiceState.isPlaying && !voiceState.isPaused) {
    return null;
  }

  const handleTogglePlayPause = () => {
    if (voiceState.isPaused) {
      voiceService.resume();
    } else {
      voiceService.pause();
    }
  };

  const handleStop = () => {
    voiceService.stop();
  };

  return (
    <div
      id="voice-player-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-white/95 dark:bg-[#1C1E34]/95 backdrop-blur-md rounded-2xl border border-[#7668D8]/30 dark:border-[#7668D8]/40 shadow-xl p-3 sm:px-4 sm:py-3 transition-all animate-fade-in"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Waveform animation and title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7668D8] to-[#9B8BEA] text-white flex items-center justify-center shrink-0 shadow-xs">
            {voiceState.isPaused ? (
              <Volume2 className="w-4 h-4 text-white/80" />
            ) : (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-3.5" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-4" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-2.5" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:75ms] h-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] truncate">
                {voiceState.title || 'SoulGuide Voice'}
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#EEE9FB] dark:bg-[#2B2A4A] text-[#7668D8] dark:text-[#C4B7FD] font-semibold shrink-0">
                0.94x Warm
              </span>
            </div>
            <p className="text-[11px] text-[#62627A] dark:text-[#9B99BC] truncate">
              {voiceState.text || 'Speaking gently...'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="voice-bar-play-pause"
            onClick={handleTogglePlayPause}
            title={voiceState.isPaused ? 'Resume' : 'Pause'}
            className="w-8 h-8 rounded-full bg-[#7668D8] hover:bg-[#6757cf] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs"
            aria-label={voiceState.isPaused ? 'Resume voice' : 'Pause voice'}
          >
            {voiceState.isPaused ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            id="voice-bar-stop"
            onClick={handleStop}
            title="Stop speaking"
            className="w-8 h-8 rounded-full bg-[#F3F0F8] dark:bg-[#252844] hover:bg-[#E9E5EE] dark:hover:bg-[#31355A] text-[#62627A] dark:text-[#C4B7FD] flex items-center justify-center transition-colors"
            aria-label="Stop speech"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            id="voice-bar-settings"
            onClick={onOpenVoiceSettings}
            title="Voice & Tuning Settings"
            className="p-1.5 rounded-xl hover:bg-[#F3F0F8] dark:hover:bg-[#252844] text-[#8D8DA0] hover:text-[#7668D8] transition-colors"
            aria-label="Voice settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tiny Watermark info on player bar */}
      <div className="mt-1.5 pt-1.5 border-t border-[#F1EEF6] dark:border-[#282B49] flex items-center justify-between text-[10px] text-[#8D8DA0] dark:text-[#797899] px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#7668D8]" />
          <span>Warm, gentle conversational companion</span>
        </span>
        <span className="flex items-center gap-1 font-medium text-[#7668D8] dark:text-[#A799F8]">
          <Heart className="w-2.5 h-2.5 fill-current" />
          <span>Dev: Sthevhien Rhick P. Salise</span>
        </span>
      </div>
    </div>
  );
};

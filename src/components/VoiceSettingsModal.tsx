import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Heart, Check, RefreshCw, Sliders, ShieldCheck, UserCheck } from 'lucide-react';
import { voiceService, DEFAULT_VOICE_SETTINGS } from '../services/voiceService';
import { VoiceSettings, VoiceGender } from '../types';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(voiceService.getSettings());
      setVoices(voiceService.getVoices());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenderChange = (gender: VoiceGender) => {
    const updated = { ...settings, gender };
    setSettings(updated);
    voiceService.saveSettings({ gender });
  };

  const handlePitchChange = (pitch: number) => {
    const updated = { ...settings, pitch };
    setSettings(updated);
    voiceService.saveSettings({ pitch });
  };

  const handleSpeedChange = (speed: number) => {
    const updated = { ...settings, speed };
    setSettings(updated);
    voiceService.saveSettings({ speed });
  };

  const handleVoiceSelect = (voiceURI: string) => {
    const updated = { ...settings, selectedVoiceURI: voiceURI };
    setSettings(updated);
    voiceService.saveSettings({ selectedVoiceURI: voiceURI });
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_VOICE_SETTINGS);
    voiceService.saveSettings(DEFAULT_VOICE_SETTINGS);
  };

  const handlePlayPreview = () => {
    setIsPlayingTest(true);
    voiceService.testSampleVoice(settings);
    setTimeout(() => setIsPlayingTest(false), 5000);
  };

  return (
    <div
      id="voice-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10111F]/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="voice-settings-modal-content"
        className="w-full max-w-lg bg-white dark:bg-[#181A2D] rounded-3xl border border-[#E9E5EE] dark:border-[#2C2E4C] shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1EEF6] dark:border-[#262843]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171936] dark:text-[#F3F2FD]">
                Voice & Companion Settings
              </h3>
              <p className="text-xs text-[#62627A] dark:text-[#9B99BC]">
                Calibrated for calm, natural & empathetic delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8D8DA0] hover:text-[#171936] dark:hover:text-white hover:bg-[#F3F0F8] dark:hover:bg-[#23253F] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Developer Credit Watermark Card */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-[#F7F4FD] to-[#EEE9FB]/70 dark:from-[#21233F] dark:to-[#1B1D35] border border-[#7668D8]/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#7668D8] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7668D8] dark:text-[#C4B7FD]">
                  Developer Watermark
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#2C2E4C] text-[#62627A] dark:text-[#B2B1CE] font-medium">
                  Verified Author
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] mt-0.5">
                Sthevhien Rhick P. Salise Everywhere
              </h4>
              <p className="text-xs text-[#55566E] dark:text-[#AEAEC4] mt-1 leading-relaxed">
                Created with deep compassion to bring peace, wisdom, reassurance, and biblical hope to anyone carrying heavy burdens.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Persona Parameters Summary */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] block mb-2">
              Voice Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'female', label: 'Soft Female', desc: 'Warm & caring' },
                  { id: 'male', label: 'Gentle Male', desc: 'Calm & grounding' },
                  { id: 'neutral', label: 'Comfort Neutral', desc: 'Peaceful friend' }
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleGenderChange(option.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    settings.gender === option.id
                      ? 'border-[#7668D8] bg-[#EEE9FB]/60 dark:bg-[#2C294F] shadow-xs'
                      : 'border-[#E9E5EE] dark:border-[#282B48] bg-white dark:bg-[#1A1C30] hover:border-[#7668D8]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD]">
                      {option.label}
                    </span>
                    {settings.gender === option.id && (
                      <Check className="w-3.5 h-3.5 text-[#7668D8] dark:text-[#C4B7FD]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#62627A] dark:text-[#9B99BC] mt-0.5">
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Tuning Metrics */}
          <div className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-[#141526] border border-[#E9E5EE] dark:border-[#252844] space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171936] dark:text-[#EAE9F8]">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#7668D8]" />
                <span>Calibrated Parameters</span>
              </span>
              <span className="text-[11px] text-[#7668D8] dark:text-[#B2A4FA]">Optimized</span>
            </div>

            {/* Speaking Rate / Speed */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#62627A] dark:text-[#9B99BC]">Speaking Speed</span>
                <span className="font-bold text-[#171936] dark:text-[#F3F2FD]">
                  {Math.round(settings.speed * 100)}% ({settings.speed.toFixed(2)}x)
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.15"
                step="0.01"
                value={settings.speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-[#7668D8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8D8DA0]">
                <span>0.80x (Meditative)</span>
                <span className="text-[#7668D8] font-semibold">0.94x (Recommended)</span>
                <span>1.15x (Brisk)</span>
              </div>
            </div>

            {/* Pitch */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#62627A] dark:text-[#9B99BC]">Pitch Tuning</span>
                <span className="font-bold text-[#171936] dark:text-[#F3F2FD]">
                  {settings.pitch > 1.0 ? `+${Math.round((settings.pitch - 1) * 100)}%` : `${Math.round((settings.pitch - 1) * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0.90"
                max="1.10"
                step="0.005"
                value={settings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-[#7668D8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8D8DA0]">
                <span>-10% (Deeper)</span>
                <span className="text-[#7668D8] font-semibold">+1.5% (Warm)</span>
                <span>+10% (Bright)</span>
              </div>
            </div>

            {/* Quality Metrics breakdown */}
            <div className="pt-2 border-t border-[#EFEBF4] dark:border-[#22243C] grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-white dark:bg-[#1B1D33] border border-[#E9E5EE] dark:border-[#272A47]">
                <span className="text-[#8D8DA0] block text-[10px]">Stability</span>
                <span className="font-bold text-[#171936] dark:text-white">70%</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#1B1D33] border border-[#E9E5EE] dark:border-[#272A47]">
                <span className="text-[#8D8DA0] block text-[10px]">Clarity</span>
                <span className="font-bold text-[#171936] dark:text-white">80%</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#1B1D33] border border-[#E9E5EE] dark:border-[#272A47]">
                <span className="text-[#8D8DA0] block text-[10px]">Expressiveness</span>
                <span className="font-bold text-[#171936] dark:text-white">52%</span>
              </div>
            </div>
          </div>

          {/* Browser Voice Selector if available */}
          {voices.length > 0 && (
            <div>
              <label className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] block mb-1.5">
                Installed Voice Engine
              </label>
              <select
                value={settings.selectedVoiceURI || ''}
                onChange={(e) => handleVoiceSelect(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E9E5EE] dark:border-[#2B2E4E] bg-white dark:bg-[#191B2E] text-[#171936] dark:text-[#EAE9F8] outline-none focus:border-[#7668D8]"
              >
                <option value="">Auto Select (Best Natural English Voice)</option>
                {voices
                  .filter((v) => v.lang.startsWith('en'))
                  .map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-[#F1EEF6] dark:border-[#262843] flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#8D8DA0] hover:text-[#7668D8] py-2 px-3 rounded-xl hover:bg-[#F3F0F8] dark:hover:bg-[#23253F] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Recommended</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPreview}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-[#EEE9FB] dark:bg-[#2A294C] text-[#7668D8] dark:text-[#C4B7FD] hover:bg-[#E3DCFA] transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingTest ? 'Testing...' : 'Test Voice'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-bold px-5 py-2 rounded-xl bg-[#7668D8] hover:bg-[#6757cf] text-white transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

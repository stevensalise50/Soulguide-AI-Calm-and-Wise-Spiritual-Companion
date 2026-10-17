import React, { useState } from 'react';
import { HeartHandshake, Lightbulb, BookOpen, Heart, Volume2, Sparkles, ChevronDown, ChevronUp, Compass, Smile, Shield, Wind, Music } from 'lucide-react';
import { RobotIllustration } from './RobotIllustration';
import { voiceService } from '../services/voiceService';

interface WelcomeCardProps {
  onQuickAction: (actionText: string) => void;
  onOpenVoiceSettings?: () => void;
}

const EXPANDED_QUICK_ACTIONS = [
  { text: "Give me a song of peace.", label: "Give Me a Song", desc: "Soothing Lyria 3 melody", icon: Music, color: "text-[#7668D8] bg-[#EEE9FB] dark:bg-[#2B294F]" },
  { text: "I'm feeling overwhelmed.", label: "Feeling Overwhelmed", desc: "Slow down & breathe", icon: HeartHandshake, color: "text-[#7668D8] bg-[#EEE9FB] dark:bg-[#2B294F]" },
  { text: "I need encouragement.", label: "Need Encouragement", desc: "Uplifting words for your day", icon: Sparkles, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40" },
  { text: "Give me a Bible verse.", label: "Give Me Scripture", desc: "Promises of hope & peace", icon: BookOpen, color: "text-[#2563EB] bg-[#E8F3FB] dark:bg-[#1D2B3F]" },
  { text: "Help me pray.", label: "Help Me Pray", desc: "Quiet prayer for your heart", icon: Heart, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
  { text: "I need wisdom.", label: "I Need Wisdom", desc: "Timeless guidance", icon: Lightbulb, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { text: "I'm feeling lonely.", label: "Feeling Lonely", desc: "You are never alone", icon: Compass, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" },
  { text: "I'm grateful today.", label: "I'm Grateful Today", desc: "Celebrate simple blessings", icon: Smile, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  { text: "I need strength.", label: "I Need Strength", desc: "Grace for the weary", icon: Shield, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
  { text: "Help me make a decision.", label: "Help Me Decide", desc: "Discernment at a crossroad", icon: Compass, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40" },
  { text: "Give me a life lesson.", label: "Life Lesson", desc: "Principles for character", icon: Lightbulb, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
  { text: "Help me calm down.", label: "Help Me Calm Down", desc: "Gentle grounding peace", icon: Wind, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40" },
  { text: "I want to reflect.", label: "I Want to Reflect", desc: "Quiet meditation", icon: BookOpen, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" }
];

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onQuickAction, onOpenVoiceSettings }) => {
  const [showAllActions, setShowAllActions] = useState(false);

  const handleListenWelcome = () => {
    voiceService.speak(
      'welcome-greeting',
      "Welcome to SoulGuide. I'm your calm and wise companion. I am right here to listen, share timeless wisdom, and walk with you through every season.",
      'Welcome to SoulGuide'
    );
  };

  const displayedActions = showAllActions ? EXPANDED_QUICK_ACTIONS : EXPANDED_QUICK_ACTIONS.slice(0, 3);

  return (
    <div
      id="welcome-hero-card"
      className="relative overflow-hidden rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm transition-all"
    >
      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-gradient-to-bl from-[#EEE9FB] to-transparent dark:from-[#252445] dark:to-transparent opacity-60 pointer-events-none" />

      {/* Top Bar with Developer Watermark Badge */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] text-xs font-semibold">
          <span>🌱 Your Calm & Wise Spiritual Companion</span>
        </div>

        {/* Developer Watermark Badge */}
        <div
          onClick={onOpenVoiceSettings}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8FD] dark:bg-[#22243C] border border-[#E9E5EE] dark:border-[#2F3254] text-[11px] text-[#62627A] dark:text-[#A9A8C4] cursor-pointer hover:border-[#7668D8]/50 transition-colors"
          title="Developed by Sthevhien Rhick P. Salise Everywhere"
        >
          <Heart className="w-3 h-3 text-[#7668D8] fill-current" />
          <span>Dev: <strong className="font-medium text-[#171936] dark:text-[#F3F2FD]">Sthevhien Rhick P. Salise Everywhere</strong></span>
        </div>
      </div>

      {/* Main hero greeting & Robot Illustration */}
      <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-5 sm:gap-6">
        {/* Left Welcome Text */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <h1 className="text-fluid-hero font-bold tracking-tight text-[#171936] dark:text-[#F3F2FD]">
            Welcome to SoulGuide 👋
          </h1>
          
          <p className="mt-2 text-fluid-body text-[#62627A] dark:text-[#A9A8C4] max-w-xl leading-relaxed">
            What’s on your heart today? I’m here to listen, share wisdom, and walk with you in every season of life.
          </p>

          {/* Voice Greeting Quick Action */}
          <div className="mt-3.5 sm:mt-4 flex items-center justify-center md:justify-start gap-2.5">
            <button
              onClick={handleListenWelcome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#F5F2FC] dark:bg-[#242642] text-[#7668D8] dark:text-[#B2A4FA] hover:bg-[#EEE9FB] dark:hover:bg-[#2C2E4F] border border-[#7668D8]/20 transition-all shadow-2xs active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen to Greeting (0.94x Warm)</span>
            </button>
          </div>
        </div>

        {/* Right / Top Friendly Robot Illustration */}
        <div className="shrink-0 flex items-center justify-center mb-1 md:mb-0">
          <RobotIllustration className="w-32 h-32 xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-48 md:h-48" />
        </div>
      </div>

      {/* 12 Responsive Smart Quick Action Cards */}
      <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#F1EEF6] dark:border-[#242742]">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#62627A] dark:text-[#9B99BC]">
            Quick Guided Reflections
          </span>
          <button
            onClick={() => setShowAllActions(!showAllActions)}
            className="text-xs font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:underline flex items-center gap-1"
          >
            <span>{showAllActions ? 'Show Fewer Prompts' : `View All 12 Prompts`}</span>
            {showAllActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {displayedActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => onQuickAction(action.text)}
                className="group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-[#E9E5EE] dark:border-[#292C48] bg-[#FDFCFE] dark:bg-[#1E2036] hover:bg-[#EEE9FB]/60 dark:hover:bg-[#28274B]/70 hover:border-[#7668D8]/40 transition-all text-left shadow-xs hover:shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} group-hover:scale-105 transition-transform flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#171936] dark:text-[#F3F2FD] leading-tight truncate">
                    {action.label}
                  </span>
                  <span className="text-xs text-[#8D8DA0] dark:text-[#7E7D9E] truncate block">
                    {action.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

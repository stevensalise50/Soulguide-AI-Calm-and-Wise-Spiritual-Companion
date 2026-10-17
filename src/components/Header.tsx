import React from 'react';
import { Menu, Sun, Moon, Sparkles, Volume2, Heart, Search, Sliders } from 'lucide-react';
import { NavPage } from '../types';
import { SoulGuideLogo } from './SidebarIllustration';

interface HeaderProps {
  currentPage: NavPage;
  onOpenMobileMenu: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onQuickPrompt?: (prompt: string) => void;
  onOpenVoiceSettings?: () => void;
  onOpenSearch?: () => void;
  onOpenPreferences?: () => void;
}

const PAGE_TITLES: Record<NavPage, { title: string; subtitle: string }> = {
  home: { title: 'Home', subtitle: 'Your peaceful daily sanctuary & overview' },
  chat: { title: 'Chat with SoulGuide', subtitle: 'A gentle, emotionally intelligent companion' },
  daily: { title: 'Daily Encouragement', subtitle: 'Today’s inspiration, reflection & scripture' },
  bible: { title: 'Bible & Scripture', subtitle: 'Over 70 promises of hope, peace & strength' },
  lessons: { title: 'Life Lessons', subtitle: '19 timeless principles for character & resilience' },
  journal: { title: 'My Journal', subtitle: 'Write what is on your heart freely' },
  prayer: { title: 'Prayer Sanctuary', subtitle: 'Quiet moments of communion & 4-7-8 breathing' },
  goals: { title: 'My Goals', subtitle: 'Habits of grace and faithful steps forward' },
  music: { title: 'Worship Music', subtitle: 'Acoustic worship melodies & hymns with Lyria 3' }
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileMenu,
  isDark,
  onToggleTheme,
  onQuickPrompt,
  onOpenVoiceSettings,
  onOpenSearch,
  onOpenPreferences
}) => {
  const info = PAGE_TITLES[currentPage] || PAGE_TITLES.home;

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-[#FCFAF8]/90 dark:bg-[#10111F]/90 backdrop-blur-md border-b border-[#E9E5EE]/80 dark:border-[#242742]/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors"
    >
      {/* Left: Mobile hamburger & Logo / Desktop Title */}
      <div className="flex items-center gap-3">
        <button
          id="open-mobile-menu"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-[#E9E5EE] dark:border-[#28274B] bg-white dark:bg-[#191B2E] text-[#171936] dark:text-[#F3F2FD] hover:bg-[#EEE9FB] transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo display */}
        <div className="flex lg:hidden items-center gap-2">
          <SoulGuideLogo className="w-7 h-7" />
          <span className="font-bold text-sm text-[#171936] dark:text-[#F3F2FD]">SoulGuide</span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#171936] dark:text-[#F3F2FD] tracking-tight">
              {info.title}
            </h2>
            {/* Subtle Developer watermark badge */}
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EEE9FB]/80 dark:bg-[#252744] text-[#7668D8] dark:text-[#B2A4FA] border border-[#7668D8]/20">
              <Heart className="w-2.5 h-2.5 fill-current" />
              <span>By Sthevhien Rhick P. Salise Everywhere</span>
            </span>
          </div>
          <p className="text-xs text-[#62627A] dark:text-[#9B99BC]">
            {info.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Search + Preferences + Voice button + Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Universal Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            title="Search scriptures, lessons, prayers (Ctrl+K)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-[#E9E5EE] dark:border-[#28274B] bg-white dark:bg-[#191B2E] text-[#62627A] dark:text-[#A9A8C4] hover:text-[#7668D8] dark:hover:text-[#B2A4FA] hover:bg-[#F7F4FC] dark:hover:bg-[#23253F] transition-all text-xs font-medium shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline text-[9.5px] px-1.5 py-0.2 bg-[#F1EEF6] dark:bg-[#2B2D49] rounded text-[#8D8DA0] font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Preferences Button */}
        {onOpenPreferences && (
          <button
            onClick={onOpenPreferences}
            title="Spiritual Preferences & Bible Translation"
            className="p-2 sm:px-2.5 sm:py-2 rounded-2xl border border-[#E9E5EE] dark:border-[#28274B] bg-white dark:bg-[#191B2E] text-[#62627A] dark:text-[#A9A8C4] hover:text-[#7668D8] dark:hover:text-[#B2A4FA] hover:bg-[#F7F4FC] dark:hover:bg-[#23253F] transition-all text-xs font-semibold shadow-2xs"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Voice Persona Button */}
        {onOpenVoiceSettings && (
          <button
            id="header-voice-btn"
            onClick={onOpenVoiceSettings}
            title="Voice Persona & Tuning (0.94x Warm)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-[#E9E5EE] dark:border-[#28274B] bg-white dark:bg-[#191B2E] text-[#7668D8] dark:text-[#B2A4FA] hover:bg-[#F7F4FC] dark:hover:bg-[#23253F] transition-all shadow-2xs text-xs font-semibold"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden md:inline">Voice (0.94x)</span>
          </button>
        )}

        {/* Appearance Mode Button */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl border border-[#E9E5EE] dark:border-[#28274B] bg-white dark:bg-[#191B2E] text-[#62627A] dark:text-[#A9A8C4] hover:text-[#7668D8] dark:hover:text-[#B2A4FA] hover:bg-[#F7F4FC] dark:hover:bg-[#23253F] transition-all shadow-2xs"
          aria-label="Toggle theme mode"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline text-xs font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#7668D8]" />
              <span className="hidden md:inline text-xs font-medium">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

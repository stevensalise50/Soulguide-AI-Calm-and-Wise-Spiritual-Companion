import React from 'react';
import { 
  Home, 
  MessageSquare, 
  Heart, 
  BookOpen, 
  Sprout, 
  BookMarked, 
  Sparkles, 
  Target,
  X,
  Volume2,
  Sliders,
  Music
} from 'lucide-react';
import { NavPage } from '../types';
import { SoulGuideLogo, MountainsIllustration } from './SidebarIllustration';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenVoiceSettings?: () => void;
}

interface NavItemConfig {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'music', label: 'Worship Music', icon: Music, badge: 'Lyria 3' },
  { id: 'daily', label: 'Daily Encouragement', icon: Heart },
  { id: 'bible', label: 'Bible', icon: BookOpen },
  { id: 'lessons', label: 'Life Lessons', icon: Sprout },
  { id: 'journal', label: 'Journal', icon: BookMarked },
  { id: 'prayer', label: 'Prayer', icon: Sparkles },
  { id: 'goals', label: 'Goals', icon: Target },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
  onOpenVoiceSettings
}) => {
  const handleItemClick = (page: NavPage) => {
    onNavigate(page);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] md:w-[240px] lg:w-[260px] bg-white dark:bg-[#151628] border-r border-[#E9E5EE] dark:border-[#242742] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between gap-3 px-2 mb-6">
            <div className="flex items-center gap-3">
              <SoulGuideLogo className="w-10 h-10 shrink-0" />
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#171936] dark:text-[#F3F2FD] leading-tight font-sans">
                  SoulGuide
                </h2>
                <p className="text-[11px] text-[#62627A] dark:text-[#9B99BC] font-medium leading-tight">
                  AI Guidance for a<br />Better Life
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                id="close-mobile-menu"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-xl text-[#8D8DA0] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B]"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav id="sidebar-nav" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] shadow-xs'
                      : 'text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC] dark:hover:bg-[#1E2036] hover:text-[#7668D8] dark:hover:text-[#F3F2FD]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4.5 h-4.5 transition-colors ${
                        isActive
                          ? 'text-[#7668D8] dark:text-[#B2A4FA]'
                          : 'text-[#8D8DA0] dark:text-[#7E7D9E] group-hover:text-[#7668D8]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7668D8] dark:bg-[#B2A4FA]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Encouragement Card */}
          <div className="mt-6">
            <div
              id="sidebar-encouragement-card"
              className="relative overflow-hidden rounded-2xl border border-[#E9E5EE] dark:border-[#28274B] bg-gradient-to-b from-[#F9F7FD] to-[#EEE9FB] dark:from-[#1F213A] dark:to-[#272648] pt-4 px-4 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#7668D8] dark:text-[#B2A4FA] mb-1">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>You’re not alone.</span>
              </div>
              <p className="text-xs text-[#62627A] dark:text-[#C5C4DE] leading-relaxed mb-3">
                I’m here to listen, guide, and walk with you through life’s challenges.
              </p>
              <MountainsIllustration className="w-full h-14" />
            </div>
          </div>
        </div>

        {/* Bottom Profile Area & Developer Watermark */}
        <div className="p-3.5 border-t border-[#E9E5EE] dark:border-[#242742] bg-[#FCFAF8] dark:bg-[#121323] space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-[#191B2E] border border-[#E9E5EE] dark:border-[#292C48]">
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#7668D8] to-[#9B8BEA] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              S
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#191B2E]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] truncate">
                Steven
              </h4>
              <p className="text-[10.5px] text-[#62627A] dark:text-[#8D8DA0] truncate">
                Keep going, you’re doing great.
              </p>
            </div>
            {onOpenVoiceSettings && (
              <button
                onClick={onOpenVoiceSettings}
                title="Voice Settings"
                className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
                aria-label="Voice settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Developer Credit Watermark */}
          <div
            id="sidebar-developer-credit"
            onClick={onOpenVoiceSettings}
            className="cursor-pointer group flex items-center justify-between px-2 py-1 rounded-xl bg-transparent hover:bg-[#EEE9FB]/50 dark:hover:bg-[#1E2038] text-[10px] text-[#8D8DA0] dark:text-[#6E7092] transition-colors"
            title="Click to view Developer & Voice Profile"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-[#7668D8] group-hover:rotate-12 transition-transform" />
              <span className="truncate">Dev: <strong className="font-medium text-[#7668D8] dark:text-[#B2A4FA]">Sthevhien Rhick P. Salise</strong></span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#EFEAF9] dark:bg-[#292A47] text-[#7668D8] dark:text-[#C4B7FD] font-bold">
              0.94x
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

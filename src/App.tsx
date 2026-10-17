import React, { useState, useEffect, useRef } from 'react';
import { NavPage, ChatMessage, BibleVerse, GeneratedSong } from './types';
import { BIBLE_VERSES } from './data/bibleVerses';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeCard } from './components/WelcomeCard';
import { ChatArea } from './components/ChatArea';
import { DailyEncouragementView } from './components/DailyEncouragementView';
import { BibleView } from './components/BibleView';
import { LifeLessonsView } from './components/LifeLessonsView';
import { JournalView } from './components/JournalView';
import { PrayerView } from './components/PrayerView';
import { GoalsView } from './components/GoalsView';
import { WorshipSongsView } from './components/WorshipSongsView';
import { ClearChatModal } from './components/ClearChatModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { VoicePlayerBar } from './components/VoicePlayerBar';
import { UniversalSearchModal } from './components/UniversalSearchModal';
import { PreferencesModal } from './components/PreferencesModal';
import { DeveloperDiagnosticsModal } from './components/DeveloperDiagnosticsModal';
import { generateLocalAIResponse, detectEmotionalMode } from './services/localAiEngine';
import { recommendScriptures } from './services/scriptureRecommender';
import { isSongRequest, extractSongTheme, requestSongGeneration } from './services/musicService';
import { initAuth, syncService } from './services/firebaseSync';
import { networkService } from './services/networkStatus';
import { User } from 'firebase/auth';

const THEME_STORAGE_KEY = 'soulguide_theme';
const CHAT_STORAGE_KEY = 'soulguide_chat';
const FAVORITES_STORAGE_KEY = 'soulguide_favorites';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [isDark, setIsDark] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritedVerseIds, setFavoritedVerseIds] = useState<string[]>(['matthew-6-34', 'philippians-4-6-7']);
  
  // Modals state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [upgradingSongId, setUpgradingSongId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const localStreamIntervalRef = useRef<number | null>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K for search, Ctrl+Shift+D for diagnostics)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsDiagnosticsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Firebase Auth & Real-Time Sync
  useEffect(() => {
    const unsubAuth = initAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Listen to Firestore real-time data when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    // 1. Sync messages real-time
    const unsubMsgs = syncService.subscribeMessages(uid, (syncedMsgs) => {
      if (syncedMsgs) {
        const cleaned = syncedMsgs.filter(m => 
          m.id !== 'msg-seed-1' && 
          m.id !== 'msg-seed-2' && 
          m.id !== 'msg-seed-3' &&
          !m.text?.includes("Hi Steven! I’m glad you’re here")
        );
        setMessages(cleaned);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(cleaned));
        networkService.recordSyncSuccess();
      }
    });

    // 2. Sync preferences & favorites real-time
    const unsubPrefs = syncService.subscribePreferences(uid, (prefs) => {
      if (prefs.favoritedVerseIds) {
        setFavoritedVerseIds(prefs.favoritedVerseIds);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(prefs.favoritedVerseIds));
      }
      if (prefs.theme) {
        const isD = prefs.theme === 'dark';
        setIsDark(isD);
        if (isD) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_STORAGE_KEY, prefs.theme);
      }
      networkService.recordSyncSuccess();
    });

    return () => {
      unsubMsgs();
      unsubPrefs();
    };
  }, [currentUser]);

  // Initialize theme and load persisted data
  useEffect(() => {
    try {
      // 1. Theme
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }

      // 2. Chat history - ensure fresh clean state without demo seeds
      const storedChat = localStorage.getItem(CHAT_STORAGE_KEY);
      if (storedChat) {
        const parsed = JSON.parse(storedChat);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(m => 
            m.id !== 'msg-seed-1' && 
            m.id !== 'msg-seed-2' && 
            m.id !== 'msg-seed-3' &&
            !m.text?.includes("Hi Steven! I’m glad you’re here")
          );
          setMessages(cleaned);
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(cleaned));
        }
      }

      // 3. Favorites
      const storedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavs) {
        setFavoritedVerseIds(JSON.parse(storedFavs));
      }
    } catch (e) {
      console.error('Failed loading storage data:', e);
    }
  }, []);

  // Theme toggle
  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      const themeVal = next ? 'dark' : 'light';
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, themeVal);
      if (currentUser) {
        syncService.updatePreferences(currentUser.uid, { theme: themeVal });
      }
      return next;
    });
  };

  // Toggle favorite verses
  const handleToggleFavoriteVerse = (verse: BibleVerse) => {
    setFavoritedVerseIds((prev) => {
      let updated: string[];
      if (prev.includes(verse.id)) {
        updated = prev.filter((id) => id !== verse.id);
      } else {
        updated = [...prev, verse.id];
      }
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      if (currentUser) {
        syncService.updatePreferences(currentUser.uid, { favoritedVerseIds: updated });
      }
      return updated;
    });
  };

  // Stop message generation immediately
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (localStreamIntervalRef.current) {
      clearInterval(localStreamIntervalRef.current);
      localStreamIntervalRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
  };

  // Upgrade or extend a 30s clip to a full track using Lyria 3 Pro
  const handleUpgradeSongToFullTrack = async (song: GeneratedSong) => {
    setUpgradingSongId(song.id);
    try {
      const upgraded = await requestSongGeneration(
        song.prompt || song.title,
        'lyria-3-pro-preview',
        song.title
      );
      setMessages((prev) =>
        prev.map((m) => (m.song?.id === song.id ? { ...m, song: upgraded } : m))
      );
    } catch (err) {
      console.warn('Upgrade to Lyria 3 Pro error:', err);
    } finally {
      setUpgradingSongId(null);
    }
  };

  // Helper to stream local AI response smoothly without ANY artificial startup delay
  const streamLocalAIResponse = (
    promptText: string,
    historyForLocal: { sender: 'user' | 'ai'; text: string }[],
    baseHistory: ChatMessage[]
  ) => {
    if (localStreamIntervalRef.current) {
      clearInterval(localStreamIntervalRef.current);
      localStreamIntervalRef.current = null;
    }

    const localResult = generateLocalAIResponse(promptText, historyForLocal);
    const aiMessageId = `msg-ai-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Detect if user asked for a song
    const isSong = isSongRequest(promptText);
    let initialSong: GeneratedSong | undefined;
    if (isSong) {
      const { title: songTitle, theme: songTheme } = extractSongTheme(promptText);
      initialSong = {
        id: `song-${Date.now()}`,
        title: songTitle,
        theme: songTheme,
        prompt: promptText,
        model: 'lyria-3-clip-preview',
        createdAt: timestamp,
        isGenerating: true
      };
      const currentSongId = initialSong.id;
      requestSongGeneration(promptText, 'lyria-3-clip-preview')
        .then((completed) => {
          setMessages((prev) =>
            prev.map((m) => (m.song?.id === currentSongId ? { ...m, song: completed } : m))
          );
        })
        .catch((e) => console.warn('Song gen error:', e));
    }

    // Split text into tokens / words for immediate streaming
    const words = localResult.text.split(/(\s+)/);
    let wordIdx = 0;

    // Immediately push first words to eliminate perception of lag
    const initialChunk = words.slice(0, 3).join('');
    wordIdx = 3;

    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: initialChunk,
      mode: localResult.mode,
      timestamp,
      isStreaming: true,
      song: initialSong
    };

    setIsLoading(false);
    setMessages([...baseHistory, initialAiMessage]);

    let accumulatedText = initialChunk;

    // Stream remaining words smoothly without lag
    localStreamIntervalRef.current = window.setInterval(() => {
      if (wordIdx >= words.length) {
        if (localStreamIntervalRef.current) {
          clearInterval(localStreamIntervalRef.current);
          localStreamIntervalRef.current = null;
        }

        const finalizedMessage: ChatMessage = {
          id: aiMessageId,
          sender: 'ai',
          text: localResult.text,
          mode: localResult.mode,
          timestamp,
          isStreaming: false,
          bibleVerse: localResult.bibleVerse,
          additionalVerses: localResult.additionalVerses,
          lifeLesson: localResult.lifeLesson,
          suggestedAction: localResult.suggestedAction,
          reflectionQuestion: localResult.reflectionQuestion,
          prayer: localResult.prayer,
          song: initialSong
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? finalizedMessage : m))
        );

        // Save asynchronously without blocking UI
        setTimeout(() => {
          const finalState = [...baseHistory, finalizedMessage];
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(finalState));
          if (currentUser) {
            syncService.saveMessage(currentUser.uid, finalizedMessage);
          }
        }, 0);

        return;
      }

      const nextBatch = words.slice(wordIdx, wordIdx + 2).join('');
      wordIdx += 2;
      accumulatedText += nextBatch;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId ? { ...m, text: accumulatedText } : m
        )
      );
    }, 22);
  };

  // Handle message sending (fast streaming pipeline: validate -> request -> stream first words immediately)
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmedText = text.trim();
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newHistory));
    if (currentUser) {
      syncService.saveMessage(currentUser.uid, userMessage);
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const mode = detectEmotionalMode(trimmedText, newHistory.map((m) => ({ sender: m.sender, text: m.text })));

    // Detect if user asked for a song or worship music
    const isSong = isSongRequest(trimmedText);
    let initialSong: GeneratedSong | undefined;
    if (isSong) {
      const { title: songTitle, theme: songTheme } = extractSongTheme(trimmedText);
      initialSong = {
        id: `song-${Date.now()}`,
        title: songTitle,
        theme: songTheme,
        prompt: trimmedText,
        model: 'lyria-3-clip-preview',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGenerating: true
      };
      const currentSongId = initialSong.id;
      // Parallel non-blocking Lyria 3 generation
      requestSongGeneration(trimmedText, 'lyria-3-clip-preview')
        .then((completedSong) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.song?.id === currentSongId ? { ...m, song: completedSong } : m
            )
          );
        })
        .catch((e) => console.warn('Song generation error:', e));
    }

    // Rolling context window: send only the recent 6-8 messages to keep AI inference latency ultra-low
    const rollingContext = newHistory.slice(-8).map((m) => ({ sender: m.sender, text: m.text }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: trimmedText,
          mode,
          history: rollingContext,
          stream: true
        })
      });

      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';
        const aiMessageId = `msg-ai-${Date.now()}`;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let firstChunkReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const block of parts) {
            const trimmedBlock = block.trim();
            if (!trimmedBlock.startsWith('data:')) continue;
            const dataStr = trimmedBlock.replace(/^data:\s*/, '').trim();

            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.fallback) {
                // Server indicated fallback to local engine
                streamLocalAIResponse(trimmedText, rollingContext, newHistory);
                return;
              }
              if (parsed.text) {
                accumulatedText += parsed.text;

                if (!firstChunkReceived) {
                  firstChunkReceived = true;
                  setIsLoading(false);
                  const newAiMsg: ChatMessage = {
                    id: aiMessageId,
                    sender: 'ai',
                    text: accumulatedText,
                    mode,
                    timestamp,
                    isStreaming: true,
                    song: initialSong
                  };
                  setMessages([...newHistory, newAiMsg]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId ? { ...m, text: accumulatedText } : m
                    )
                  );
                }
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }

        if (firstChunkReceived && accumulatedText.trim()) {
          // Finalize streaming AI message and attach relevant scripture/actions
          const lower = trimmedText.toLowerCase();
          let attachedVerse;
          if (
            lower.includes('bible') ||
            lower.includes('verse') ||
            lower.includes('scripture') ||
            mode === 'CALM' ||
            mode === 'ENCOURAGE' ||
            mode === 'GRIEF_SUPPORT'
          ) {
            const rec = recommendScriptures(trimmedText);
            attachedVerse = rec.primaryVerse;
          }

          setMessages((prev) => {
            const existingMsg = prev.find((m) => m.id === aiMessageId);
            const currentSong = existingMsg?.song || initialSong;

            const finalizedAiMessage: ChatMessage = {
              id: aiMessageId,
              sender: 'ai',
              text: accumulatedText,
              mode,
              timestamp,
              isStreaming: false,
              bibleVerse: attachedVerse,
              song: currentSong
            };

            const updatedHistory = prev.map((m) =>
              m.id === aiMessageId ? finalizedAiMessage : m
            );
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedHistory));
            if (currentUser) {
              syncService.saveMessage(currentUser.uid, finalizedAiMessage);
            }
            return updatedHistory;
          });

          setIsLoading(false);
          abortControllerRef.current = null;
          return;
        }
      }

      // If JSON non-streaming returned
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.text && !data.fallback) {
          const aiMessage: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: data.text,
            mode,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isStreaming: false,
            song: initialSong
          };
          const lower = trimmedText.toLowerCase();
          if (
            lower.includes('bible') ||
            lower.includes('verse') ||
            lower.includes('scripture') ||
            mode === 'CALM' ||
            mode === 'ENCOURAGE'
          ) {
            const rec = recommendScriptures(trimmedText);
            aiMessage.bibleVerse = rec.primaryVerse;
          }
          const finalHistory = [...newHistory, aiMessage];
          setMessages(finalHistory);
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(finalHistory));
          if (currentUser) {
            syncService.saveMessage(currentUser.uid, aiMessage);
          }
          setIsLoading(false);
          abortControllerRef.current = null;
          return;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Server streaming unavailable or aborted, streaming with local engine:', err);
      networkService.recordError('Server streaming unavailable, used instant local streaming');
    }

    // 2. Instant streaming local fallback (ZERO artificial delay!)
    streamLocalAIResponse(trimmedText, rollingContext, newHistory);
  };

  // Reset conversation to initial friendly state
  const handleConfirmClearChat = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
    if (currentUser) {
      syncService.clearMessages(currentUser.uid, messages.map(m => m.id));
    }
  };

  // Quick Action click from Welcome card
  const handleQuickAction = (actionText: string) => {
    setCurrentPage('chat');
    handleSendMessage(actionText);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FCFAF8] dark:bg-[#10111F] text-[#171936] dark:text-[#F3F2FD] flex flex-col lg:flex-row transition-colors pb-16">
      {/* Left Sidebar (~240px-260px on desktop/tablets) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* Main Right Content Area - Responsive reflow with max-w container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onQuickPrompt={(prompt) => {
            setCurrentPage('chat');
            handleSendMessage(prompt);
          }}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* HOME VIEW: Welcome Dashboard + Quick Cards + Conversation Section */}
          {currentPage === 'home' && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <WelcomeCard
                onQuickAction={handleQuickAction}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
              />

              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#171936] dark:text-[#F3F2FD]">
                      Conversation with SoulGuide
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#62627A] dark:text-[#9B99BC]">
                      A safe space to share what’s on your heart anytime.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentPage('chat')}
                    className="text-xs font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:underline"
                  >
                    Open full chat →
                  </button>
                </div>

                <ChatArea
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onClearChat={() => setIsClearModalOpen(true)}
                  onToggleFavoriteVerse={handleToggleFavoriteVerse}
                  favoritedVerseIds={favoritedVerseIds}
                  isHomeEmbedded={true}
                  onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
                  onStopGeneration={handleStopGeneration}
                  onUpgradeSong={handleUpgradeSongToFullTrack}
                  upgradingSongId={upgradingSongId}
                />
              </div>
            </div>
          )}

          {/* DEDICATED CHAT VIEW */}
          {currentPage === 'chat' && (
            <div className="animate-fade-in">
              <ChatArea
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onClearChat={() => setIsClearModalOpen(true)}
                onToggleFavoriteVerse={handleToggleFavoriteVerse}
                favoritedVerseIds={favoritedVerseIds}
                isHomeEmbedded={false}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
                onStopGeneration={handleStopGeneration}
                onUpgradeSong={handleUpgradeSongToFullTrack}
                upgradingSongId={upgradingSongId}
              />
            </div>
          )}

          {/* WORSHIP MUSIC & SONGS VIEW (LYRIA 3) */}
          {currentPage === 'music' && (
            <WorshipSongsView
              onStartChatWithPrompt={(prompt) => {
                setCurrentPage('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* DAILY ENCOURAGEMENT VIEW */}
          {currentPage === 'daily' && (
            <DailyEncouragementView
              onToggleFavoriteVerse={handleToggleFavoriteVerse}
              favoritedVerseIds={favoritedVerseIds}
              onTalkAboutThis={(topic) => {
                setCurrentPage('chat');
                handleSendMessage(topic);
              }}
              onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            />
          )}

          {/* BIBLE VIEW */}
          {currentPage === 'bible' && (
            <BibleView
              favoritedVerseIds={favoritedVerseIds}
              onToggleFavoriteVerse={handleToggleFavoriteVerse}
              onAskAboutVerse={(verse) => {
                setCurrentPage('chat');
                handleSendMessage(`Can you explain the meaning, context, and comfort of ${verse.reference} ("${verse.text}")?`);
              }}
            />
          )}

          {/* LIFE LESSONS VIEW */}
          {currentPage === 'lessons' && (
            <LifeLessonsView
              onReflectWithGuide={(prompt) => {
                setCurrentPage('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* JOURNAL VIEW */}
          {currentPage === 'journal' && <JournalView />}

          {/* PRAYER VIEW */}
          {currentPage === 'prayer' && <PrayerView />}

          {/* GOALS VIEW */}
          {currentPage === 'goals' && <GoalsView />}
        </main>
      </div>

      {/* Sticky Bottom Voice Player Bar */}
      <VoicePlayerBar onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)} />

      {/* Voice Tuning & Customization Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />

      {/* Clear Chat Confirmation Modal */}
      <ClearChatModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearChat}
      />

      {/* Universal Search Modal (Cmd+K) */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />

      {/* Spiritual Preferences Modal */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Developer Diagnostics Modal (Ctrl+Shift+D) */}
      <DeveloperDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}

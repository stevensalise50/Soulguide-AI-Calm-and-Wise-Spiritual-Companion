import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, BookOpen, Lightbulb, HeartHandshake, Smile, Volume2, Check, Sliders, Heart, RefreshCw, Copy, Share2, Square, User, Music } from 'lucide-react';
import { ChatMessage, BibleVerse, VoicePlaybackState, EmotionalResponseMode, GeneratedSong } from '../types';
import { BibleVerseCard } from './BibleVerseCard';
import { RobotIllustration } from './RobotIllustration';
import { voiceService } from '../services/voiceService';
import { ShareScriptureModal } from './ShareScriptureModal';
import { SongPlayerCard } from './SongPlayerCard';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  onToggleFavoriteVerse?: (verse: BibleVerse) => void;
  favoritedVerseIds?: string[];
  isHomeEmbedded?: boolean;
  onOpenVoiceSettings?: () => void;
  onStopGeneration?: () => void;
  onUpgradeSong?: (song: GeneratedSong) => void;
  upgradingSongId?: string | null;
}

const QUICK_PROMPTS = [
  "🎵 Give me a song of peace",
  "🎵 Worship song for comfort",
  "I'm having a hard time with my subjects.",
  "My parents keep arguing at home.",
  "I don't have enough money for my expenses.",
  "My best friend stopped talking to me.",
  "My girlfriend and I keep fighting.",
  "I don't know what I'm doing with my life.",
  "I'm just tired."
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  onToggleFavoriteVerse,
  favoritedVerseIds = [],
  isHomeEmbedded = false,
  onOpenVoiceSettings,
  onStopGeneration,
  onUpgradeSong,
  upgradingSongId
}) => {
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [shareVerse, setShareVerse] = useState<BibleVerse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsub = voiceService.subscribe(setVoiceState);
    return unsub;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    voiceService.speak(msg.id, msg.text, 'SoulGuide Voice');
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      onSendMessage(lastUserMsg.text);
    }
  };

  return (
    <div
      id="chat-container"
      className={`flex flex-col rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] shadow-sm overflow-hidden transition-all ${
        isHomeEmbedded ? 'min-h-[480px] lg:min-h-[520px]' : 'h-[calc(100dvh-120px)] sm:h-[calc(100dvh-130px)]'
      }`}
    >
      {/* Top Header of Chat Area */}
      <div className="px-5 py-3.5 border-b border-[#F1EEF6] dark:border-[#242742] flex items-center justify-between bg-[#FDFCFE] dark:bg-[#1C1E34]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] flex items-center justify-center text-[#7668D8]">
            <Sparkles className="w-4 h-4 text-[#7668D8]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C1E34]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] leading-tight">
                SoulGuide Companion
              </h3>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#EEE9FB] dark:bg-[#2B2A4A] text-[#7668D8] dark:text-[#C4B7FD] font-semibold">
                0.94x Warm Voice
              </span>
            </div>
            <p className="text-[11px] text-[#62627A] dark:text-[#9B99BC]">
              {isLoading ? 'Listening & reflecting thoughtfully...' : 'Safe, non-judgmental spiritual sanctuary'}
            </p>
          </div>
        </div>

        {/* Right Header Buttons: Voice config, Regenerate & Clear */}
        <div className="flex items-center gap-1.5">
          {messages.length > 2 && !isLoading && (
            <button
              onClick={handleRegenerate}
              title="Regenerate last response"
              className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-[#7668D8] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              title="Voice Settings (Calibrated 0.94x Warm)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#7668D8] dark:text-[#B2A4FA] hover:bg-[#EEE9FB] dark:hover:bg-[#292A48] transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice</span>
            </button>
          )}

          <button
            id="clear-chat-btn"
            onClick={onClearChat}
            title="Clear chat history"
            className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-rose-500 hover:bg-[#FDE8E8] dark:hover:bg-[#3E1B24] transition-colors"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scrollable List */}
      <div
        id="messages-scroll-area"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex flex-col"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-4 max-w-md mx-auto my-auto animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-[#EEE9FB] dark:bg-[#28274B] flex items-center justify-center text-[#7668D8] border border-[#7668D8]/20 shadow-xs">
              <Sparkles className="w-8 h-8 text-[#7668D8]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171936] dark:text-[#F3F2FD]">
                SoulGuide
              </h3>
              <p className="text-sm font-medium text-[#7668D8] dark:text-[#B2A4FA]">
                What's on your heart today?
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#62627A] dark:text-[#9B99BC] leading-relaxed">
              A calm, confidential space to share what you're walking through — school, family, friendships, love, finances, faith, or simple weariness.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            const isSpeaking = voiceState.isPlaying && voiceState.activeId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} animate-fade-in`}
              >
                <div
                  className={`flex gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ${
                    isAI ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* AI / User Avatar */}
                  {isAI ? (
                    <div className="w-8 h-8 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] flex items-center justify-center shrink-0 mt-0.5 border border-[#7668D8]/20">
                      <RobotIllustration className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7668D8] to-[#9B8BEA] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-3xl p-4 sm:p-5 shadow-2xs transition-all ${
                      isAI
                        ? 'bg-[#F9F7FD] dark:bg-[#21233F] text-[#171936] dark:text-[#F3F2FD] border border-[#ECE7F6] dark:border-[#2D2F54]'
                        : 'bg-[#7668D8] text-white'
                    }`}
                  >
                    {/* Message Text with paragraphs & streaming cursor */}
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                      {msg.text}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-[#7668D8] dark:bg-[#B2A4FA] ml-1.5 animate-pulse align-middle rounded-full shadow-xs" />
                      )}
                    </div>

                    {/* Attached Bible Verse Card */}
                    {msg.bibleVerse && !msg.isStreaming && (
                      <div className="mt-4 pt-2">
                        <BibleVerseCard
                          verse={msg.bibleVerse}
                          isFavorited={favoritedVerseIds.includes(msg.bibleVerse.id)}
                          onToggleFavorite={onToggleFavoriteVerse}
                          onShareCard={(v) => setShareVerse(v)}
                          compact={true}
                        />
                      </div>
                    )}

                    {/* Attached Life Lesson Card */}
                    {msg.lifeLesson && !msg.isStreaming && (
                      <div className="mt-4 p-3.5 rounded-2xl bg-[#FFF8E7] dark:bg-[#2B2414] border border-[#FDE68A] dark:border-[#4B3B1B] text-[#78350F] dark:text-[#FCD34D]">
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Life Lesson: {msg.lifeLesson.title}</span>
                        </div>
                        <p className="text-xs text-[#92400E] dark:text-[#FDE68A] leading-relaxed">
                          {msg.lifeLesson.insight}
                        </p>
                      </div>
                    )}

                    {/* Attached Generated Song Card (Lyria 3) */}
                    {msg.song && (
                      <SongPlayerCard
                        song={msg.song}
                        onUpgradeToFullTrack={onUpgradeSong}
                        isUpgrading={upgradingSongId === msg.song.id}
                      />
                    )}

                    {/* Message Footer: Timestamp, Stop, Listen, Copy */}
                    <div
                      className={`flex items-center justify-between gap-3 mt-3 pt-2 text-[11px] border-t ${
                        isAI
                          ? 'border-[#F1EEF6] dark:border-[#2A2C4F] text-[#8D8DA0]'
                          : 'border-white/20 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        {msg.isStreaming && (
                          <span className="text-[10px] font-medium text-[#7668D8] dark:text-[#B2A4FA] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7668D8] animate-ping" />
                            Reflecting...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAI && msg.isStreaming && onStopGeneration && (
                          <button
                            onClick={onStopGeneration}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                          >
                            Stop
                          </button>
                        )}

                        {isAI && !msg.isStreaming && (
                          <>
                            <button
                              onClick={() => handleCopyMessage(msg)}
                              title="Copy message"
                              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                              {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleSpeakMessage(msg)}
                              title={isSpeaking ? 'Stop voice' : 'Listen with warm voice (0.94x)'}
                              className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                                isSpeaking ? 'text-[#7668D8] dark:text-[#B2A4FA] font-bold' : ''
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }))}

        {/* Typing indicator - only shown during initial latency before first token */}
        {isLoading && !messages.some(m => m.isStreaming) && (
          <div className="flex items-center gap-3 animate-fade-in pl-1">
            <div className="w-8 h-8 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] flex items-center justify-center border border-[#7668D8]/20">
              <RobotIllustration className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F9F7FD] dark:bg-[#21233F] border border-[#ECE7F6] dark:border-[#2D2F54] text-xs text-[#7668D8] dark:text-[#B2A4FA]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7668D8] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7668D8] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7668D8] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-medium text-[#62627A] dark:text-[#9B99BC]">SoulGuide is listening...</span>

              {onStopGeneration && (
                <button
                  onClick={onStopGeneration}
                  className="ml-2 px-2 py-0.5 rounded-lg bg-white dark:bg-[#151628] text-[10px] font-semibold text-rose-500 hover:bg-rose-50"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips Carousel */}
      <div className="px-4 py-2 bg-[#FAF8FE] dark:bg-[#18192D] border-t border-[#F1EEF6] dark:border-[#242742] overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#8D8DA0] shrink-0">Prompts:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 text-xs px-3 py-1 rounded-full border border-[#E9E5EE] dark:border-[#2E3152] bg-white dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB] hover:text-[#7668D8] hover:border-[#7668D8]/40 transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-[#191B2E] border-t border-[#F1EEF6] dark:border-[#242742]">
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            id="chat-input-textarea"
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message SoulGuide... (e.g. 'I’m having a hard time with my subjects')"
            className="w-full resize-none pl-4 pr-12 py-3 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-[#FCFAF8] dark:bg-[#151628] text-xs sm:text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] focus:ring-2 focus:ring-[#7668D8]/20 transition-all"
          />

          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-[#7668D8] text-white disabled:opacity-40 hover:bg-[#6557cb] active:scale-95 transition-all shadow-2xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareScriptureModal
        verse={shareVerse}
        isOpen={Boolean(shareVerse)}
        onClose={() => setShareVerse(null)}
      />
    </div>
  );
};

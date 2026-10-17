export type NavPage = 
  | 'home'
  | 'chat'
  | 'daily'
  | 'bible'
  | 'lessons'
  | 'journal'
  | 'prayer'
  | 'goals'
  | 'music';

export type EmotionalResponseMode = 
  | 'CALM'
  | 'ENCOURAGE'
  | 'COMFORT'
  | 'LISTEN'
  | 'REFLECT'
  | 'PRAY'
  | 'TEACH'
  | 'MOTIVATE'
  | 'CELEBRATE'
  | 'GUIDE'
  | 'GRIEF_SUPPORT'
  | 'DECISION_SUPPORT'
  | 'GRATITUDE'
  | 'HOPE'
  | 'FAITH';

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number | string;
  reference: string;
  text: string;
  translation: string;
  categories: string[];
  keywords: string[];
  moodTags: string[];
  situationTags: string[];
  shortReflection: string;
  // Backward compatibility fields
  category?: string;
  theme?: string;
  contextNote?: string;
}

export interface ScriptureRecommendation {
  primaryVerse: BibleVerse;
  additionalVerses: BibleVerse[];
  explanation: string;
  reflectionQuestion: string;
  suggestedPrayer?: string;
  identifiedConcepts: string[];
}

export type LifeLessonCategory =
  | 'Discipline'
  | 'Patience'
  | 'Forgiveness'
  | 'Relationships'
  | 'Friendship'
  | 'Leadership'
  | 'Responsibility'
  | 'Confidence'
  | 'Humility'
  | 'Failure'
  | 'Success'
  | 'Purpose'
  | 'Time Management'
  | 'Emotional Resilience'
  | 'Gratitude'
  | 'Communication'
  | 'Personal Growth'
  | 'Faith'
  | 'Integrity'
  | 'Resilience'
  | 'Self-Compassion'
  | 'Peace'
  | 'Decisions'
  | 'Growth';

export interface LifeLesson {
  id: string;
  title: string;
  category: LifeLessonCategory;
  corePrinciple: string;
  explanation: string;
  realLifeExample: string;
  biblicalConnection: string;
  reflectionQuestion: string;
  practicalAction: string;
  // Backward compatibility fields
  insight?: string;
  practicalApplication?: string;
  iconName?: string;
}

export interface GeneratedSong {
  id: string;
  title: string;
  theme?: string;
  prompt?: string;
  audioBase64?: string;
  audioUrl?: string;
  mimeType?: string;
  lyrics?: string;
  duration?: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  createdAt: string;
  isGenerating?: boolean;
  error?: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isInitial?: boolean;
  mode?: EmotionalResponseMode;
  bibleVerse?: BibleVerse;
  additionalVerses?: BibleVerse[];
  lifeLesson?: {
    title: string;
    insight: string;
  };
  reflectionQuestion?: string;
  suggestedAction?: string;
  prayer?: string;
  isStreaming?: boolean;
  song?: GeneratedSong;
}

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  content: string;
  mood?: 'peaceful' | 'grateful' | 'struggling' | 'reflective' | 'hopeful' | 'weary';
  tags?: string[];
  verseAttachment?: BibleVerse;
  prayerAttachment?: string;
  aiReflection?: string;
  isFavorite?: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'Spiritual' | 'Wellbeing' | 'Habits' | 'Relationships' | 'Personal';
  completed: boolean;
  createdAt: string;
  streak?: number;
  lastCompletedDate?: string;
  description?: string;
}

export interface DailyEncouragementItem {
  id: string;
  dayLabel: string;
  encouragement: string;
  message?: string;
  lifeLesson: string;
  reflection: string;
  prayer?: string;
  action?: string;
  verse: BibleVerse;
}

export interface PrayerTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  suggestedPrompt: string;
}

export interface SavedPrayer {
  id: string;
  topic: string;
  prayer: string;
  timestamp: string;
  isFavorite?: boolean;
  category?: string;
}

export type BreathingMode = 
  | '4-7-8 Peace'
  | 'Box Breathing'
  | 'Slow Breathing'
  | 'One-Minute Reset'
  | 'Prayer Breathing';

export type BibleTranslation = 'NIV' | 'ESV' | 'NLT' | 'KJV';
export type ResponseLength = 'concise' | 'balanced' | 'in-depth';
export type PrayerStyle = 'gentle' | 'conversational' | 'traditional';

export interface UserPreferences {
  translation: BibleTranslation;
  responseLength: ResponseLength;
  prayerStyle: PrayerStyle;
  theme: 'light' | 'dark';
  favoritedVerseIds: string[];
}

export type VoiceGender = 'female' | 'male' | 'neutral';

export interface VoiceSettings {
  gender: VoiceGender;
  pitch: number; // 1.015 is +1.5%
  speed: number; // 0.94 is 94%
  stability: number; // 70%
  clarity: number; // 80%
  expressiveness: number; // 52%
  volume: number; // 0.95
  naturalPauses: boolean;
  selectedVoiceURI?: string;
}

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  activeId: string | null;
  title?: string;
  text?: string;
}

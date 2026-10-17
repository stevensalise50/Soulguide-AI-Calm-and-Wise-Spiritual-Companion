import { VoiceSettings, VoicePlaybackState, VoiceGender } from '../types';

const STORAGE_KEY = 'soulguide_voice_settings';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  gender: 'female',
  pitch: 1.015, // +1.5% pitch (warm, slightly low-to-medium)
  speed: 0.94, // 0.94x speaking rate (94%, gentle and relaxed)
  stability: 70, // 70% stability
  clarity: 80, // 80% clarity
  expressiveness: 52, // 52% expressiveness
  volume: 0.95, // 95% soft, intimate volume
  naturalPauses: true,
  selectedVoiceURI: ''
};

type Listener = (state: VoicePlaybackState) => void;

class VoiceService {
  private settings: VoiceSettings = DEFAULT_VOICE_SETTINGS;
  private state: VoicePlaybackState = {
    isPlaying: false,
    isPaused: false,
    activeId: null,
    title: '',
    text: ''
  };
  private listeners: Set<Listener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];
  private currentUtterances: SpeechSynthesisUtterance[] = [];
  private currentUtteranceIndex = 0;

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not load stored voice settings:', e);
    }
  }

  public saveSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save voice settings:', e);
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public getState(): VoicePlaybackState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach(l => l(currentState));
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.availableVoices = window.speechSynthesis.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    return this.availableVoices;
  }

  /**
   * Selects the most soothing, natural voice matching target gender and language
   */
  public getBestVoice(gender: VoiceGender, customURI?: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    if (customURI) {
      const found = voices.find(v => v.voiceURI === customURI);
      if (found) return found;
    }

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const candidateList = enVoices.length > 0 ? enVoices : voices;

    if (gender === 'female') {
      const femaleKeywords = ['female', 'samantha', 'victoria', 'karen', 'zira', 'serena', 'moira', 'natural', 'jenny', 'google us english'];
      for (const kw of femaleKeywords) {
        const match = candidateList.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    } else if (gender === 'male') {
      const maleKeywords = ['male', 'daniel', 'david', 'guy', 'aaron', 'arthur', 'george', 'alex', 'oliver', 'google us english'];
      for (const kw of maleKeywords) {
        const match = candidateList.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    }

    // Default to the first high quality English voice or default voice
    const defaultEn = candidateList.find(v => v.default) || candidateList[0];
    return defaultEn || voices[0];
  }

  /**
   * Pre-process text to create natural conversational cadence,
   * strip markdown formatting, and insert gentle breath pauses.
   */
  public preprocessText(rawText: string, isBibleVerse = false): string[] {
    let clean = rawText
      .replace(/[\*\#\_`~]/g, '') // remove markdown symbols
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
      .replace(/\n+/g, '. ') // turn newlines into sentence breaks
      .replace(/\s+/g, ' ')
      .trim();

    // Natural conversation smoothing
    clean = clean
      .replace(/\bDr\./g, 'Doctor')
      .replace(/\bvs\b/g, 'versus')
      .replace(/\bi\.e\./g, 'that is')
      .replace(/\be\.g\./g, 'for example');

    // Split into comfortable speaking sentences/chunks for natural human pauses
    const rawChunks = clean.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];

    for (const chunk of rawChunks) {
      const trimmed = chunk.trim();
      if (trimmed.length > 0) {
        chunks.push(trimmed);
      }
    }

    return chunks.length > 0 ? chunks : [clean];
  }

  /**
   * Speaks a block of text with SoulGuide's calibrated warm, gentle parameters
   */
  public speak(id: string, text: string, title = 'Life Guide', isScripture = false) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    // If currently playing the same id, toggle pause / stop
    if (this.state.isPlaying && this.state.activeId === id) {
      if (this.state.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
      return;
    }

    // Stop any existing speech
    this.stop();

    const voice = this.getBestVoice(this.settings.gender, this.settings.selectedVoiceURI);
    const chunks = this.preprocessText(text, isScripture);

    this.state = {
      isPlaying: true,
      isPaused: false,
      activeId: id,
      title,
      text: text.slice(0, 120) + (text.length > 120 ? '...' : '')
    };
    this.notify();

    // Prepare utterances
    this.currentUtteranceIndex = 0;
    this.currentUtterances = chunks.map((chunk, index) => {
      const utt = new SpeechSynthesisUtterance(chunk);
      if (voice) utt.voice = voice;

      // Pitch calibrated to ~+1.5%
      utt.pitch = isScripture ? Math.max(0.98, this.settings.pitch - 0.02) : this.settings.pitch;
      
      // Speed calibrated to 0.94x (slightly slower for scriptures ~0.90x)
      utt.rate = isScripture ? Math.max(0.88, this.settings.speed - 0.04) : this.settings.speed;
      utt.volume = this.settings.volume;

      utt.onend = () => {
        this.currentUtteranceIndex++;
        if (this.currentUtteranceIndex >= this.currentUtterances.length) {
          this.state = {
            isPlaying: false,
            isPaused: false,
            activeId: null,
            title: '',
            text: ''
          };
          this.notify();
        } else {
          // Play next chunk with a gentle natural pause
          if (this.settings.naturalPauses) {
            setTimeout(() => {
              if (this.state.isPlaying && !this.state.isPaused) {
                window.speechSynthesis.speak(this.currentUtterances[this.currentUtteranceIndex]);
              }
            }, isScripture ? 260 : 180);
          } else {
            if (this.state.isPlaying && !this.state.isPaused) {
              window.speechSynthesis.speak(this.currentUtterances[this.currentUtteranceIndex]);
            }
          }
        }
      };

      utt.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.state = {
          isPlaying: false,
          isPaused: false,
          activeId: null,
          title: '',
          text: ''
        };
        this.notify();
      };

      return utt;
    });

    if (this.currentUtterances.length > 0) {
      window.speechSynthesis.speak(this.currentUtterances[0]);
    }
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.state.isPlaying) {
      window.speechSynthesis.pause();
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.state.isPaused) {
      window.speechSynthesis.resume();
      this.state.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterances = [];
    this.currentUtteranceIndex = 0;
    this.state = {
      isPlaying: false,
      isPaused: false,
      activeId: null,
      title: '',
      text: ''
    };
    this.notify();
  }

  /**
   * Preview test voice sample
   */
  public testSampleVoice(customSettings?: Partial<VoiceSettings>) {
    const sampleText = "Hi Steven, I'm right here with you. Take a slow breath. You don't have to carry everything alone today.";
    if (customSettings) {
      const prev = this.settings;
      this.settings = { ...this.settings, ...customSettings };
      this.speak('test-sample', sampleText, 'Voice Preview');
      this.settings = prev;
    } else {
      this.speak('test-sample', sampleText, 'Voice Preview');
    }
  }
}

export const voiceService = new VoiceService();

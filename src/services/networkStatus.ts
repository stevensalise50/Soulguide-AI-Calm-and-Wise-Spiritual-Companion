export interface DiagnosticsState {
  isOnline: boolean;
  firebaseConnected: boolean;
  geminiConnected: boolean;
  voiceEngineReady: boolean;
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  localCacheCount: number;
  apiLatencyMs: number | null;
  errorCount: number;
  recentErrors: string[];
}

type DiagnosticsListener = (state: DiagnosticsState) => void;

class NetworkStatusService {
  private state: DiagnosticsState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    firebaseConnected: true,
    geminiConnected: false,
    voiceEngineReady: typeof window !== 'undefined' && 'speechSynthesis' in window,
    lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    syncStatus: 'synced',
    localCacheCount: 0,
    apiLatencyMs: null,
    errorCount: 0,
    recentErrors: []
  };

  private listeners: Set<DiagnosticsListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateState({ isOnline: true, syncStatus: 'synced' });
      });
      window.addEventListener('offline', () => {
        this.updateState({ isOnline: false, syncStatus: 'idle' });
      });
      this.checkApiHealth();
      this.countLocalCache();
    }
  }

  public subscribe(listener: DiagnosticsListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public getState(): DiagnosticsState {
    return { ...this.state };
  }

  public updateState(partial: Partial<DiagnosticsState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public recordSyncSuccess() {
    this.updateState({
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      syncStatus: 'synced'
    });
    this.countLocalCache();
  }

  public recordSyncStart() {
    this.updateState({ syncStatus: 'syncing' });
  }

  public recordError(friendlyMessage: string) {
    const updatedErrors = [friendlyMessage, ...this.state.recentErrors].slice(0, 10);
    this.updateState({
      errorCount: this.state.errorCount + 1,
      recentErrors: updatedErrors,
      syncStatus: 'error'
    });
  }

  public async checkApiHealth() {
    const start = Date.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const latency = Date.now() - start;
      this.updateState({
        geminiConnected: Boolean(data.hasGeminiKey),
        apiLatencyMs: latency
      });
    } catch {
      this.updateState({
        geminiConnected: false,
        apiLatencyMs: null
      });
    }
  }

  public countLocalCache() {
    if (typeof window === 'undefined') return;
    try {
      let count = 0;
      const keys = ['soulguide_chat', 'soulguide_journal', 'soulguide_goals', 'soulguide_prayers', 'soulguide_favorites'];
      for (const k of keys) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) count += parsed.length;
          } catch {
            // Ignore parse errors
          }
        }
      }
      this.updateState({ localCacheCount: count });
    } catch {
      // Ignore
    }
  }
}

export const networkService = new NetworkStatusService();

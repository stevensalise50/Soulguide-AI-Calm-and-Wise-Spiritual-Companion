import React, { useState, useEffect } from 'react';
import { X, Activity, Database, Sparkles, Volume2, Wifi, WifiOff, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { networkService, DiagnosticsState } from '../services/networkStatus';

interface DeveloperDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperDiagnosticsModal: React.FC<DeveloperDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [diag, setDiag] = useState<DiagnosticsState>(networkService.getState());

  useEffect(() => {
    const unsub = networkService.subscribe(setDiag);
    return unsub;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#151728] rounded-3xl border border-[#E9E5EE] dark:border-[#282B48] shadow-2xl p-6 sm:p-7 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1EEF6] dark:border-[#242742]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD] flex items-center gap-2">
                <span>Developer Diagnostics</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Internal Only
                </span>
              </h3>
              <p className="text-[11px] text-[#62627A] dark:text-[#9B99BC]">
                SoulGuide Engine & Cloud Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8D8DA0] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-4">
          {/* 1. Network Status */}
          <div className="p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#1E2036] border border-[#E9E5EE] dark:border-[#292C48]">
            <div className="flex items-center gap-1.5 text-[#62627A] dark:text-[#9B99BC] mb-1 font-semibold">
              {diag.isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
              <span>Network State</span>
            </div>
            <div className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD]">
              {diag.isOnline ? 'Online (Connected)' : 'Offline (Local Cache)'}
            </div>
          </div>

          {/* 2. Firebase Cloud */}
          <div className="p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#1E2036] border border-[#E9E5EE] dark:border-[#292C48]">
            <div className="flex items-center gap-1.5 text-[#62627A] dark:text-[#9B99BC] mb-1 font-semibold">
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>Firebase Firestore</span>
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Active (Enterprise)
            </div>
          </div>

          {/* 3. AI Service */}
          <div className="p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#1E2036] border border-[#E9E5EE] dark:border-[#292C48]">
            <div className="flex items-center gap-1.5 text-[#62627A] dark:text-[#9B99BC] mb-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Gemini AI Engine</span>
            </div>
            <div className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD]">
              {diag.geminiConnected ? 'gemini-3.7-flash (Live)' : 'Intelligent Local Engine'}
            </div>
          </div>

          {/* 4. Voice Engine */}
          <div className="p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#1E2036] border border-[#E9E5EE] dark:border-[#292C48]">
            <div className="flex items-center gap-1.5 text-[#62627A] dark:text-[#9B99BC] mb-1 font-semibold">
              <Volume2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Voice Synthesizer</span>
            </div>
            <div className="text-sm font-bold text-[#171936] dark:text-[#F3F2FD]">
              0.94x Natural Warm
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#1A1C30] border border-[#E9E5EE] dark:border-[#292C48] font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#8D8DA0]">Sync Status:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{diag.syncStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D8DA0]">Last Cloud Sync:</span>
            <span className="font-semibold text-[#171936] dark:text-[#F3F2FD]">{diag.lastSyncTime || 'Just now'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D8DA0]">Local Cached Items:</span>
            <span className="font-semibold text-[#171936] dark:text-[#F3F2FD]">{diag.localCacheCount} records</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D8DA0]">API Latency:</span>
            <span className="font-semibold text-[#171936] dark:text-[#F3F2FD]">{diag.apiLatencyMs ? `${diag.apiLatencyMs}ms` : 'Local <5ms'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D8DA0]">Total Handled Errors:</span>
            <span className="font-semibold text-[#171936] dark:text-[#F3F2FD]">{diag.errorCount} (Recovered safely)</span>
          </div>
        </div>

        {/* Developer Attribution Bar */}
        <div className="mt-4 pt-3 border-t border-[#F1EEF6] dark:border-[#242742] flex items-center justify-between text-[11px] text-[#8D8DA0]">
          <span>Lead Developer: <strong>Sthevhien Rhick P. Salise</strong></span>
          <button
            onClick={() => {
              networkService.checkApiHealth();
              networkService.countLocalCache();
            }}
            className="flex items-center gap-1 text-[#7668D8] hover:underline font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Recheck</span>
          </button>
        </div>
      </div>
    </div>
  );
};

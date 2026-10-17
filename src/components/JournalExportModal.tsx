import React, { useState } from 'react';
import { X, Download, FileText, Check, BookOpen, Sparkles, Filter, Calendar } from 'lucide-react';
import { JournalEntry } from '../types';
import { exportJournalAsPdf, exportJournalAsText } from '../services/journalExportService';

interface JournalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allEntries: JournalEntry[];
  filteredEntries: JournalEntry[];
  singleEntry?: JournalEntry | null;
  aiReflectionsMap?: Record<string, string>;
}

export const JournalExportModal: React.FC<JournalExportModalProps> = ({
  isOpen,
  onClose,
  allEntries,
  filteredEntries,
  singleEntry,
  aiReflectionsMap = {}
}) => {
  const [format, setFormat] = useState<'pdf' | 'txt'>('pdf');
  const [scope, setScope] = useState<'all' | 'filtered' | 'single'>(
    singleEntry ? 'single' : (filteredEntries.length !== allEntries.length ? 'filtered' : 'all')
  );
  const [includeScriptures, setIncludeScriptures] = useState(true);
  const [includeReflections, setIncludeReflections] = useState(true);
  const [includeMoods, setIncludeMoods] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Compute entries to export
  let targetEntries: JournalEntry[] = [];
  if (scope === 'single' && singleEntry) {
    targetEntries = [singleEntry];
  } else if (scope === 'filtered') {
    targetEntries = filteredEntries;
  } else {
    targetEntries = allEntries;
  }

  const dateSlug = new Date().toISOString().slice(0, 10);
  const proposedFileName = scope === 'single' && singleEntry
    ? `SoulGuide_Reflection_${singleEntry.date.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`
    : `SoulGuide_Journal_Archive_${dateSlug}.${format}`;

  const handleExecuteExport = () => {
    setIsExporting(true);
    try {
      const options = {
        includeScriptures,
        includeReflections,
        includeMoods,
        aiReflectionsMap
      };

      if (format === 'pdf') {
        exportJournalAsPdf(targetEntries, proposedFileName, options);
      } else {
        exportJournalAsText(targetEntries, proposedFileName, options);
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#191B2E] border border-[#E9E5EE] dark:border-[#2A2D4E] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEE9FB] dark:bg-[#2B2852] text-[#7668D8] dark:text-[#B2A4FA] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#171936] dark:text-[#F3F2FD]">
                Export Journal to Local Storage
              </h3>
              <p className="text-xs text-[#62627A] dark:text-[#A9A8C4]">
                Download your sanctuary reflections as a formatted file.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8D8DA0] hover:text-[#171936] dark:hover:text-[#F3F2FD] hover:bg-[#F7F4FC] dark:hover:bg-[#20223B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8D8DA0] uppercase tracking-wider block">
            Reflections to Export
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-3 py-2.5 rounded-2xl text-xs font-medium border text-left transition-all ${
                scope === 'all'
                  ? 'border-[#7668D8] bg-[#EEE9FB]/60 dark:bg-[#2B2852] text-[#7668D8] dark:text-[#B2A4FA] font-bold shadow-2xs'
                  : 'border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC]'
              }`}
            >
              <div className="font-bold">All Reflections</div>
              <div className="text-[11px] opacity-80">{allEntries.length} entries</div>
            </button>

            {filteredEntries.length !== allEntries.length && (
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`px-3 py-2.5 rounded-2xl text-xs font-medium border text-left transition-all ${
                  scope === 'filtered'
                    ? 'border-[#7668D8] bg-[#EEE9FB]/60 dark:bg-[#2B2852] text-[#7668D8] dark:text-[#B2A4FA] font-bold shadow-2xs'
                    : 'border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC]'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtered
                </div>
                <div className="text-[11px] opacity-80">{filteredEntries.length} matching</div>
              </button>
            )}

            {singleEntry && (
              <button
                type="button"
                onClick={() => setScope('single')}
                className={`px-3 py-2.5 rounded-2xl text-xs font-medium border text-left transition-all ${
                  scope === 'single'
                    ? 'border-[#7668D8] bg-[#EEE9FB]/60 dark:bg-[#2B2852] text-[#7668D8] dark:text-[#B2A4FA] font-bold shadow-2xs'
                    : 'border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC]'
                }`}
              >
                <div className="font-bold">Single Entry</div>
                <div className="text-[11px] opacity-80 truncate">{singleEntry.date}</div>
              </button>
            )}
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8D8DA0] uppercase tracking-wider block">
            File Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                format === 'pdf'
                  ? 'border-[#7668D8] bg-[#EEE9FB]/50 dark:bg-[#2B2852] shadow-2xs'
                  : 'border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] hover:bg-[#F7F4FC]'
              }`}
            >
              <div className={`p-2 rounded-xl ${format === 'pdf' ? 'bg-[#7668D8] text-white' : 'bg-[#E9E5EE] dark:bg-[#2E3154] text-[#62627A]'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD] flex items-center gap-1.5">
                  <span>Formatted PDF</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#7668D8]/15 text-[#7668D8] dark:text-[#B2A4FA] font-bold">
                    Recommended
                  </span>
                </div>
                <div className="text-[11px] text-[#62627A] dark:text-[#A9A8C4] mt-0.5">
                  Styled document with headers, mood badges & scripture cards.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('txt')}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                format === 'txt'
                  ? 'border-[#7668D8] bg-[#EEE9FB]/50 dark:bg-[#2B2852] shadow-2xs'
                  : 'border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] hover:bg-[#F7F4FC]'
              }`}
            >
              <div className={`p-2 rounded-xl ${format === 'txt' ? 'bg-[#7668D8] text-white' : 'bg-[#E9E5EE] dark:bg-[#2E3154] text-[#62627A]'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#171936] dark:text-[#F3F2FD]">
                  Plain Text (.txt)
                </div>
                <div className="text-[11px] text-[#62627A] dark:text-[#A9A8C4] mt-0.5">
                  Clean ASCII text file compatible with all note editors.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Toggles */}
        <div className="space-y-2 pt-1 border-t border-[#F1EEF6] dark:border-[#242742]">
          <label className="text-xs font-semibold text-[#8D8DA0] uppercase tracking-wider block">
            Include in Export
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-[#171936] dark:text-[#F3F2FD] cursor-pointer">
              <input
                type="checkbox"
                checked={includeScriptures}
                onChange={(e) => setIncludeScriptures(e.target.checked)}
                className="w-4 h-4 rounded text-[#7668D8] accent-[#7668D8] focus:ring-[#7668D8]"
              />
              <BookOpen className="w-3.5 h-3.5 text-[#7668D8]" />
              <span>Attached Scripture verses & references</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#171936] dark:text-[#F3F2FD] cursor-pointer">
              <input
                type="checkbox"
                checked={includeReflections}
                onChange={(e) => setIncludeReflections(e.target.checked)}
                className="w-4 h-4 rounded text-[#7668D8] accent-[#7668D8] focus:ring-[#7668D8]"
              />
              <Sparkles className="w-3.5 h-3.5 text-[#7668D8]" />
              <span>SoulGuide AI compassionate reflections</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#171936] dark:text-[#F3F2FD] cursor-pointer">
              <input
                type="checkbox"
                checked={includeMoods}
                onChange={(e) => setIncludeMoods(e.target.checked)}
                className="w-4 h-4 rounded text-[#7668D8] accent-[#7668D8] focus:ring-[#7668D8]"
              />
              <Calendar className="w-3.5 h-3.5 text-[#7668D8]" />
              <span>Mood tags and timestamps</span>
            </label>
          </div>
        </div>

        {/* Output File Info */}
        <div className="p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#20223B] border border-[#E9E5EE] dark:border-[#2C2F52] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#7668D8]" />
            <span className="font-mono text-[11px] text-[#171936] dark:text-[#F3F2FD] truncate max-w-[240px]">
              {proposedFileName}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#7668D8] dark:text-[#B2A4FA]">
            {targetEntries.length} {targetEntries.length === 1 ? 'reflection' : 'reflections'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-[#E9E5EE] dark:border-[#2C2F52] text-xs font-semibold text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC] dark:hover:bg-[#20223B] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={targetEntries.length === 0 || isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7668D8] text-white text-xs sm:text-sm font-semibold hover:bg-[#6557cb] active:scale-95 disabled:opacity-50 transition-all shadow-sm"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

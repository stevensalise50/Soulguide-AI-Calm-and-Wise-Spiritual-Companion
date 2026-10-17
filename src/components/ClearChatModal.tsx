import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface ClearChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearChatModal: React.FC<ClearChatModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#8D8DA0] hover:bg-[#EEE9FB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#171936] dark:text-[#F3F2FD]">
            Clear conversation?
          </h3>
          <p className="text-xs sm:text-sm text-[#62627A] dark:text-[#A9A8C4] mt-1.5 leading-relaxed">
            This will clear your current conversation and give you a fresh, peaceful space to share what's on your heart. Your saved favorites, journal reflections, and goals will not be affected.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1EEF6] dark:border-[#242742]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E9E5EE] dark:border-[#2A2D4E] text-xs font-semibold text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#F7F4FC] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
          >
            Clear Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

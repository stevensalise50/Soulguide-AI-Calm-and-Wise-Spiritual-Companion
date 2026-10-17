import React, { useState } from 'react';
import { Sprout, Lightbulb, MessageSquare, Compass, CheckCircle2, Volume2, Heart, BookOpen, UserCheck, Sparkles } from 'lucide-react';
import { LIFE_LESSONS } from '../data/lifeLessons';
import { LifeLesson } from '../types';
import { voiceService } from '../services/voiceService';

interface LifeLessonsViewProps {
  onReflectWithGuide: (prompt: string) => void;
}

export const LifeLessonsView: React.FC<LifeLessonsViewProps> = ({ onReflectWithGuide }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const categories = [
    'All',
    'Emotional Resilience',
    'Patience',
    'Forgiveness',
    'Relationships',
    'Friendship',
    'Humility',
    'Integrity',
    'Discipline',
    'Communication',
    'Gratitude',
    'Leadership',
    'Personal Growth',
    'Time Management',
    'Faith',
    'Confidence',
    'Responsibility',
    'Purpose',
    'Failure'
  ];

  const filteredLessons = selectedCategory === 'All'
    ? LIFE_LESSONS
    : LIFE_LESSONS.filter(l => l.category === selectedCategory);

  const handleSpeakLesson = (lesson: LifeLesson) => {
    const text = `${lesson.title}. Core principle: ${lesson.corePrinciple}. ${lesson.explanation} Real life example: ${lesson.realLifeExample}. Biblical connection: ${lesson.biblicalConnection}. Reflection question: ${lesson.reflectionQuestion}. Practical action: ${lesson.practicalAction}`;
    voiceService.speak(`lesson-${lesson.id}`, text, `Lesson: ${lesson.title}`);
  };

  return (
    <div id="life-lessons-view" className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EE] dark:bg-[#1A3324] text-[#16A34A] dark:text-[#86EFAC] text-xs font-semibold mb-2.5">
          <Sprout className="w-3.5 h-3.5" />
          <span>Wisdom for Maturing Well (19 Life Disciplines)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#171936] dark:text-[#F3F2FD] tracking-tight">
          Life Lessons & Principles
        </h2>
        <p className="text-sm text-[#62627A] dark:text-[#A9A8C4] mt-1 max-w-2xl">
          Deep, timeless insights to help you reframe setbacks, cultivate patience, protect your peace, and grow with dignity.
        </p>

        {/* Category Carousel */}
        <div className="mt-5 pt-4 border-t border-[#F1EEF6] dark:border-[#242742] flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#7668D8] text-white shadow-xs'
                    : 'bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB] hover:text-[#7668D8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Life Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLessons.map((lesson) => {
          const isExpanded = expandedLessonId === lesson.id;

          return (
            <div
              key={lesson.id}
              id={`lesson-card-${lesson.id}`}
              className="flex flex-col justify-between rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Category & Audio */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA]">
                    {lesson.category}
                  </span>
                  
                  <button
                    onClick={() => handleSpeakLesson(lesson)}
                    title="Listen with warm 0.94x voice"
                    className="p-1.5 rounded-xl hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] text-[#8D8DA0] hover:text-[#7668D8] transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Core Principle */}
                <h3 className="text-base sm:text-lg font-bold text-[#171936] dark:text-[#F3F2FD] mb-2 leading-snug">
                  {lesson.title}
                </h3>

                <div className="p-3 rounded-2xl bg-[#FFF4D9]/60 dark:bg-[#2B2515] border border-[#FDE68A]/60 dark:border-[#42371E] mb-3">
                  <span className="text-[11px] font-bold text-[#D97706] dark:text-[#FBBF24] uppercase tracking-wider block mb-1">
                    Core Principle:
                  </span>
                  <p className="text-xs sm:text-sm text-[#78350F] dark:text-[#FCD34D] font-medium leading-relaxed">
                    “{lesson.corePrinciple || lesson.insight}”
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#62627A] dark:text-[#C5C4DE] leading-relaxed mb-3">
                  {lesson.explanation}
                </p>

                {/* Real-Life Example & Biblical Connection */}
                <div className="space-y-2 pt-2 border-t border-[#F1EEF6] dark:border-[#242742] text-xs">
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-[#7668D8] shrink-0 mt-0.5" />
                    <p className="text-[#62627A] dark:text-[#9B99BC]">
                      <strong className="text-[#171936] dark:text-[#F3F2FD]">Real Life:</strong> {lesson.realLifeExample}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                    <p className="text-[#62627A] dark:text-[#9B99BC]">
                      <strong className="text-[#171936] dark:text-[#F3F2FD]">Biblical Anchor:</strong> {lesson.biblicalConnection}
                    </p>
                  </div>
                </div>

                {/* Practical Action & Reflection Question */}
                <div className="mt-3 p-3 rounded-2xl bg-[#F7F4FC] dark:bg-[#20223B] border border-[#E9E5EE] dark:border-[#2E3152] text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[#62627A] dark:text-[#C5C4DE]">
                      <strong className="text-emerald-700 dark:text-emerald-400">Practical Action:</strong> {lesson.practicalAction || lesson.practicalApplication}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-current/10">
                    <Compass className="w-3.5 h-3.5 text-[#7668D8] shrink-0 mt-0.5" />
                    <p className="text-[#62627A] dark:text-[#A9A8C4] italic">
                      "{lesson.reflectionQuestion}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Trigger to Chat */}
              <div className="mt-4 pt-3 border-t border-[#F1EEF6] dark:border-[#242742]">
                <button
                  onClick={() => onReflectWithGuide(`Can we talk about the life lesson "${lesson.title}"? I'd like to reflect on how to apply it.`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[#7668D8] dark:text-[#B2A4FA] hover:bg-[#EEE9FB] dark:hover:bg-[#28274B] transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reflect on this with SoulGuide →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2, Trophy, Sparkles, Flame, Heart, BookOpen, Compass, Wind, Smile, RefreshCw } from 'lucide-react';
import { GoalItem } from '../types';
import { auth, syncService } from '../services/firebaseSync';

const GOALS_STORAGE_KEY = 'soulguide_goals';

const HABIT_PRESETS: Array<{ title: string; category: GoalItem['category']; icon: string }> = [
  { title: 'Read Scripture & meditate on one verse', category: 'Spiritual', icon: '📖' },
  { title: 'Morning or evening prayer (5 mins)', category: 'Spiritual', icon: '🙏' },
  { title: 'Write in personal journal', category: 'Wellbeing', icon: '✍️' },
  { title: 'Practice 4-7-8 calming breath', category: 'Wellbeing', icon: '🌬️' },
  { title: 'Name 3 things I am grateful for', category: 'Spiritual', icon: '🌻' },
  { title: 'Memorize one comforting verse', category: 'Spiritual', icon: '🧠' },
  { title: 'Do an act of unexpected kindness', category: 'Relationships', icon: '🤝' },
  { title: '15 minutes of quiet time without phone', category: 'Personal', icon: '☕' },
  { title: 'Reflect on a timeless life lesson', category: 'Personal', icon: '🌱' },
  { title: 'Reach out to encourage a friend', category: 'Relationships', icon: '💌' }
];

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('Spiritual');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        setGoals(JSON.parse(stored));
      } else {
        const initialGoals: GoalItem[] = [
          { id: 'goal-1', title: 'Read Scripture & meditate on one verse', category: 'Spiritual', completed: true, createdAt: 'Today', streak: 3 },
          { id: 'goal-2', title: 'Morning or evening prayer (5 mins)', category: 'Spiritual', completed: true, createdAt: 'Today', streak: 4 },
          { id: 'goal-3', title: '15 minutes of quiet time without phone', category: 'Personal', completed: false, createdAt: 'Today', streak: 1 },
          { id: 'goal-4', title: 'Reach out to encourage a friend', category: 'Relationships', completed: false, createdAt: 'This week', streak: 0 }
        ];
        setGoals(initialGoals);
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(initialGoals));
      }
    } catch (e) {
      console.error('Failed loading goals', e);
    }

    const user = auth.currentUser;
    if (user) {
      const unsub = syncService.subscribeGoals(user.uid, (cloudGoals) => {
        if (cloudGoals && cloudGoals.length > 0) {
          setGoals(cloudGoals);
          localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(cloudGoals));
        }
      });
      return () => unsub();
    }
  }, []);

  const saveGoals = (updated: GoalItem[]) => {
    setGoals(updated);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: GoalItem = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      createdAt: 'Today',
      streak: 0
    };

    const updated = [item, ...goals];
    saveGoals(updated);
    if (auth.currentUser) {
      syncService.saveGoal(auth.currentUser.uid, item);
    }
    setNewTitle('');
  };

  const handleAddPreset = (preset: typeof HABIT_PRESETS[0]) => {
    if (goals.some(g => g.title === preset.title)) return;

    const item: GoalItem = {
      id: `goal-${Date.now()}`,
      title: preset.title,
      category: preset.category,
      completed: false,
      createdAt: 'Today',
      streak: 0
    };

    const updated = [item, ...goals];
    saveGoals(updated);
    if (auth.currentUser) {
      syncService.saveGoal(auth.currentUser.uid, item);
    }
  };

  const handleToggleComplete = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed;
        const currentStreak = g.streak || 0;
        const nextStreak = nextCompleted ? currentStreak + 1 : Math.max(0, currentStreak - 1);
        const toggled = { ...g, completed: nextCompleted, streak: nextStreak };
        if (auth.currentUser) {
          syncService.saveGoal(auth.currentUser.uid, toggled);
        }
        return toggled;
      }
      return g;
    });
    saveGoals(updated);
  };

  const handleDelete = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
    if (auth.currentUser) {
      syncService.deleteGoal(auth.currentUser.uid, id);
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;
  const maxStreak = goals.reduce((max, g) => Math.max(max, g.streak || 0), 0);

  const categories = ['All', 'Spiritual', 'Wellbeing', 'Habits', 'Relationships', 'Personal'];

  const filteredGoals = activeCategory === 'All'
    ? goals
    : goals.filter(g => g.category === activeCategory);

  return (
    <div id="goals-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] text-xs font-semibold mb-2.5">
              <Target className="w-3.5 h-3.5" />
              <span>Spiritual Habits & Intentional Steps</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171936] dark:text-[#F3F2FD] tracking-tight">
              Habits of Grace & Growth
            </h2>
            <p className="text-sm text-[#62627A] dark:text-[#A9A8C4] mt-1">
              Gentle consistency over rigid perfection. Celebrate small steps every single day.
            </p>
          </div>

          {/* Gentle Streak Badge */}
          <div className="flex items-center gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300">
            <Flame className="w-5 h-5 text-amber-500 fill-current" />
            <div>
              <span className="block text-xs font-bold leading-none">{maxStreak} Day Momentum</span>
              <span className="text-[10.5px] opacity-80">Faithful consistency</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Gentle Non-Shaming Message */}
        <div className="mt-6 pt-5 border-t border-[#F1EEF6] dark:border-[#242742]">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[#62627A] dark:text-[#A9A8C4]">
              Today's Rhythm: {completedCount} of {goals.length} completed
            </span>
            <span className="text-[#7668D8] dark:text-[#B2A4FA] font-bold">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#F3EFFD] dark:bg-[#20223B] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7668D8] to-[#9B8BEA] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Non-Shaming Affirmation */}
          <p className="text-xs text-[#62627A] dark:text-[#9B99BC] mt-2.5 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#7668D8] fill-current" />
            <span>
              {progressPercent === 100
                ? "Wonderful job! You completed all your intentional steps today."
                : progressPercent > 0
                ? "Every small step counts. You are doing great."
                : "Missed a day? That's completely okay. You can pause, breathe, and begin again today."}
            </span>
          </p>
        </div>
      </div>

      {/* Suggested Spiritual Habits Presets */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7668D8] dark:text-[#9B8BEA] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Add Spiritual & Wellness Habits</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {HABIT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAddPreset(preset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E5EE] dark:border-[#2C2F52] bg-[#FDFCFE] dark:bg-[#20223B] text-xs font-medium text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB] hover:text-[#7668D8] transition-all"
            >
              <span>{preset.icon}</span>
              <span>{preset.title}</span>
              <Plus className="w-3 h-3 ml-0.5 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Goal Form */}
      <div className="rounded-3xl border border-[#E9E5EE] dark:border-[#292C48] bg-white dark:bg-[#191B2E] p-6 shadow-sm">
        <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a custom habit or goal (e.g., '10 minutes of evening reflection')..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-[#FCFAF8] dark:bg-[#151628] text-xs sm:text-sm text-[#171936] dark:text-[#F3F2FD] placeholder-[#8D8DA0] focus:outline-none focus:border-[#7668D8] transition-all"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as GoalItem['category'])}
            className="px-3 py-2.5 rounded-2xl border border-[#E9E5EE] dark:border-[#2F3254] bg-[#FCFAF8] dark:bg-[#151628] text-xs text-[#62627A] dark:text-[#A9A8C4] focus:outline-none"
          >
            <option value="Spiritual">Spiritual</option>
            <option value="Wellbeing">Wellbeing</option>
            <option value="Habits">Habits</option>
            <option value="Relationships">Relationships</option>
            <option value="Personal">Personal</option>
          </select>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7668D8] text-white text-xs sm:text-sm font-semibold hover:bg-[#6557cb] active:scale-95 disabled:opacity-50 transition-all shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </form>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#7668D8] text-white shadow-xs'
                  : 'bg-[#F7F4FC] dark:bg-[#20223B] text-[#62627A] dark:text-[#A9A8C4] hover:bg-[#EEE9FB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredGoals.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              item.completed
                ? 'bg-[#F6F4FC] dark:bg-[#1C1E34] border-[#E2DCFA] dark:border-[#2D2A54] opacity-90'
                : 'bg-white dark:bg-[#191B2E] border-[#E9E5EE] dark:border-[#292C48] shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => handleToggleComplete(item.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                  item.completed
                    ? 'bg-[#7668D8] border-[#7668D8] text-white'
                    : 'border-[#CBD5E1] dark:border-[#475569] hover:border-[#7668D8]'
                }`}
              >
                {item.completed && <Check className="w-4 h-4" />}
              </button>

              <div className="min-w-0">
                <span
                  className={`block text-xs sm:text-sm font-medium truncate ${
                    item.completed
                      ? 'line-through text-[#8D8DA0] dark:text-[#6E7092]'
                      : 'text-[#171936] dark:text-[#F3F2FD]'
                  }`}
                >
                  {item.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#EEE9FB] dark:bg-[#28274B] text-[#7668D8] dark:text-[#B2A4FA] font-medium">
                    {item.category}
                  </span>
                  {(item.streak || 0) > 0 && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-current" />
                      {item.streak}d streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-[#8D8DA0] hover:text-rose-500 hover:bg-[#FDE8E8] dark:hover:bg-[#3D1A1A] transition-colors ml-2 shrink-0"
              title="Remove habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

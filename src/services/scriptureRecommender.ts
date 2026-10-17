import { BIBLE_VERSES } from '../data/bibleVerses';
import { BibleVerse, ScriptureRecommendation } from '../types';

interface ConceptRule {
  concept: string;
  keywords: string[];
  categories: string[];
  moods: string[];
}

const CONCEPT_RULES: ConceptRule[] = [
  {
    concept: 'discouragement & giving up',
    keywords: ['giving up', 'give up', 'quit', 'hopeless', 'discouraged', 'nothing works', 'fail', 'failing', 'ruined', 'lost cause'],
    categories: ['hope', 'perseverance', 'strength', 'patience'],
    moods: ['discouraged', 'hopeless', 'depleted']
  },
  {
    concept: 'overwhelm & anxiety',
    keywords: ['overwhelm', 'stressed', 'anxi', 'panic', 'freaking out', 'too much', 'cannot take', "can't handle", 'fast heart', 'sleepless'],
    categories: ['peace', 'anxiety', 'rest', 'protection'],
    moods: ['anxious', 'overwhelmed', 'restless']
  },
  {
    concept: 'fear & uncertainty',
    keywords: ['afraid', 'fear', 'scared', 'terrified', 'dread', 'what if', 'threatened', 'unsafe', 'uncertainty'],
    categories: ['fear', 'courage', 'protection', 'peace'],
    moods: ['fearful', 'terrified', 'shaky']
  },
  {
    concept: 'weariness & exhaustion',
    keywords: ['tired', 'exhausted', 'drained', 'burned out', 'burnout', 'fatigue', 'weary', 'heavy burden', 'sleepy'],
    categories: ['rest', 'strength', 'peace'],
    moods: ['exhausted', 'drained', 'weary']
  },
  {
    concept: 'loneliness & rejection',
    keywords: ['lonely', 'alone', 'abandoned', 'rejected', 'left out', 'nobody cares', 'isolated', 'breakup', 'broken heart'],
    categories: ['loneliness', 'grief', 'love', 'protection'],
    moods: ['lonely', 'brokenhearted', 'isolated']
  },
  {
    concept: 'seeking guidance & decisions',
    keywords: ['decision', 'what should i do', 'direction', 'crossroads', 'choice', 'future', 'career', 'college', 'confused'],
    categories: ['wisdom', 'guidance', 'purpose', 'trust'],
    moods: ['indecisive', 'confused', 'uncertain']
  },
  {
    concept: 'guilt, failure & forgiveness',
    keywords: ['guilt', 'guilty', 'shame', 'ashamed', 'mistake', 'regret', 'screwed up', 'messed up', 'forgive me', 'bad person'],
    categories: ['forgiveness', 'hope', 'identity', 'love'],
    moods: ['ashamed', 'regretful', 'contrite']
  },
  {
    concept: 'grief, sorrow & loss',
    keywords: ['grief', 'mourning', 'died', 'loss', 'crying', 'tears', 'hurt deeply', 'heartbreak', 'brokenhearted'],
    categories: ['grief', 'comfort', 'healing', 'peace'],
    moods: ['brokenhearted', 'mourning', 'sorrowful']
  },
  {
    concept: 'gratitude, praise & celebration',
    keywords: ['grateful', 'thankful', 'blessed', 'praise', 'achieved', 'happy', 'rejoice', 'glad', 'won', 'good news'],
    categories: ['gratitude', 'joy', 'worship'],
    moods: ['grateful', 'rejoicing', 'peaceful']
  },
  {
    concept: 'anger & conflict',
    keywords: ['angry', 'mad', 'furious', 'unfair', 'hate', 'betrayal', 'resentment', 'bitter', 'offended'],
    categories: ['forgiveness', 'peace', 'relationships', 'self-control'],
    moods: ['bitter', 'angry']
  },
  {
    concept: 'temptation & self-discipline',
    keywords: ['temptation', 'habit', 'relapse', 'weakness', 'discipline', 'self-control', 'addiction', 'lust', 'procrastination'],
    categories: ['protection', 'self-control', 'discipline', 'perseverance'],
    moods: ['tempted', 'struggling with habit']
  }
];

export function recommendScriptures(userInput: string, excludeIds: string[] = []): ScriptureRecommendation {
  const text = userInput.toLowerCase();
  const matchedConcepts: string[] = [];
  const scoreMap = new Map<string, number>();

  // Initialize all verses with 0 score
  for (const v of BIBLE_VERSES) {
    scoreMap.set(v.id, 0);
  }

  // Check matching rules
  for (const rule of CONCEPT_RULES) {
    let matchesRule = false;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matchesRule = true;
        break;
      }
    }

    if (matchesRule) {
      matchedConcepts.push(rule.concept);

      for (const v of BIBLE_VERSES) {
        let score = scoreMap.get(v.id) || 0;

        // Categories match
        for (const cat of rule.categories) {
          if (v.categories.includes(cat) || v.category === cat) {
            score += 4;
          }
        }

        // Mood tags match
        for (const mood of rule.moods) {
          if (v.moodTags.some(m => m.toLowerCase().includes(mood))) {
            score += 3;
          }
        }

        // Textual keywords in verse
        for (const kw of rule.keywords) {
          if (v.keywords.some(k => k.toLowerCase().includes(kw)) || v.text.toLowerCase().includes(kw)) {
            score += 2;
          }
        }

        scoreMap.set(v.id, score);
      }
    }
  }

  // Also direct keyword scanning on all verses
  const words = text.split(/\W+/).filter(w => w.length > 3);
  for (const w of words) {
    for (const v of BIBLE_VERSES) {
      let score = scoreMap.get(v.id) || 0;
      if (v.keywords.some(k => k.toLowerCase() === w)) score += 3;
      if (v.categories.some(c => c.toLowerCase() === w)) score += 4;
      if (v.text.toLowerCase().includes(w)) score += 1;
      scoreMap.set(v.id, score);
    }
  }

  // Sort candidates by score descending
  const sorted = [...BIBLE_VERSES]
    .map(v => ({ verse: v, score: scoreMap.get(v.id) || 0 }))
    // Deprioritize recently shown unless no choice
    .map(item => ({
      ...item,
      score: excludeIds.includes(item.verse.id) ? item.score - 5 : item.score
    }))
    .sort((a, b) => b.score - a.score);

  // If no strong concept was matched, default to peace/hope/presence
  const fallbackVerses = [
    BIBLE_VERSES.find(v => v.id === 'philippians-4-6-7') || BIBLE_VERSES[0],
    BIBLE_VERSES.find(v => v.id === 'matthew-11-28-30') || BIBLE_VERSES[1],
    BIBLE_VERSES.find(v => v.id === 'isaiah-41-10') || BIBLE_VERSES[2],
    BIBLE_VERSES.find(v => v.id === 'jeremiah-29-11') || BIBLE_VERSES[3],
  ];

  const primaryVerse = sorted[0]?.score > 0 ? sorted[0].verse : fallbackVerses[0];
  const candidatePool = sorted.length > 1 && sorted[1]?.score > 0
    ? sorted.slice(1).map(s => s.verse)
    : fallbackVerses.filter(v => v.id !== primaryVerse.id);

  const additionalVerses = candidatePool
    .filter(v => v.id !== primaryVerse.id)
    .slice(0, 3);

  const displayConcepts = matchedConcepts.length > 0 
    ? matchedConcepts 
    : ['peace & presence', 'hope in uncertainty'];

  const explanation = `These verses speak directly into ${displayConcepts.join(', ')}. ${primaryVerse.shortReflection}`;
  
  const reflectionQuestion = primaryVerse.categories.includes('anxiety') || primaryVerse.categories.includes('peace')
    ? 'What is one specific weight you are holding right now that you can entrust into God\'s care today?'
    : primaryVerse.categories.includes('strength') || primaryVerse.categories.includes('courage')
    ? 'Where do you feel your strength running low, and how can you allow God\'s grace to meet you there?'
    : primaryVerse.categories.includes('wisdom')
    ? 'If you chose the path that produces the most long-term peace rather than immediate relief, what step would you take?'
    : 'How does knowing that God is intimately attentive to your heart change how you see this situation?';

  const suggestedPrayer = `Lord, thank You that Your word is living and true. When I feel ${displayConcepts[0] || 'heavy'}, remind me of ${primaryVerse.reference}. Guard my mind with Your peace, renew my strength, and lead me one faithful step at a time. Amen.`;

  return {
    primaryVerse,
    additionalVerses,
    explanation,
    reflectionQuestion,
    suggestedPrayer,
    identifiedConcepts: displayConcepts
  };
}

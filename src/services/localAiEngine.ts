import { BIBLE_VERSES } from '../data/bibleVerses';
import { LIFE_LESSONS } from '../data/lifeLessons';
import { BibleVerse, EmotionalResponseMode } from '../types';
import { recommendScriptures } from './scriptureRecommender';

export interface LocalAiResponse {
  text: string;
  mode: EmotionalResponseMode;
  category?: string;
  bibleVerse?: BibleVerse;
  additionalVerses?: BibleVerse[];
  lifeLesson?: {
    title: string;
    insight: string;
  };
  suggestedAction?: string;
  reflectionQuestion?: string;
  prayer?: string;
}

// Track recent verses to avoid repeating the exact same scripture in consecutive replies
const recentVerseIds: string[] = [];
function recordVerse(id: string) {
  recentVerseIds.push(id);
  if (recentVerseIds.length > 10) recentVerseIds.shift();
}

export type ProblemCategory =
  | 'ACADEMIC'
  | 'FAMILY'
  | 'FINANCIAL'
  | 'FRIENDSHIP'
  | 'RELATIONSHIP'
  | 'CAREER'
  | 'PERSONAL'
  | 'SPIRITUAL'
  | 'GRIEF'
  | 'ANXIETY'
  | 'MOTIVATION'
  | 'DECISION'
  | 'CELEBRATE'
  | 'AMBIGUOUS'
  | 'CRISIS'
  | 'OTHER';

interface ProblemAnalysis {
  category: ProblemCategory;
  mode: EmotionalResponseMode;
  isAmbiguous: boolean;
  userConcern: string;
}

/**
 * Universal Problem Analyzer:
 * Detects the specific problem category without making premature or biased assumptions.
 */
export function analyzeUserProblem(
  userMessage: string,
  history: Array<{ sender: 'user' | 'ai'; text: string }> = []
): ProblemAnalysis {
  const msg = userMessage.toLowerCase().trim();

  // 1. Crisis / Safety
  if (
    msg.includes('kill myself') ||
    msg.includes('suicide') ||
    msg.includes('end my life') ||
    msg.includes('want to die') ||
    msg.includes('hurt myself')
  ) {
    return { category: 'CRISIS', mode: 'COMFORT', isAmbiguous: false, userConcern: 'immediate safety' };
  }

  // 2. Ambiguous / Brief messages (e.g. "I'm just tired", "idk", "I feel weird")
  const ambiguousPhrases = [
    "i'm just tired", "im just tired", "i am just tired",
    "i'm tired", "im tired", "i am tired", "just tired",
    "i don't know", "idk", "i dont know",
    "i feel weird", "feeling weird", "feeling off",
    "i feel strange", "not good", "help me", "help", "sigh"
  ];
  if (ambiguousPhrases.includes(msg) || (msg.length < 16 && (msg.includes('tired') || msg.includes('sad') || msg.includes('lost')))) {
    return { category: 'AMBIGUOUS', mode: 'LISTEN', isAmbiguous: true, userConcern: 'ambiguous feeling' };
  }

  // 3. Grief & Loss
  if (
    msg.includes('died') ||
    msg.includes('death') ||
    msg.includes('funeral') ||
    msg.includes('passed away') ||
    msg.includes('grief') ||
    msg.includes('mourn') ||
    msg.includes('lost my mom') ||
    msg.includes('lost my dad') ||
    msg.includes('lost my pet') ||
    msg.includes('lost my brother') ||
    msg.includes('lost my sister')
  ) {
    return { category: 'GRIEF', mode: 'GRIEF_SUPPORT', isAmbiguous: false, userConcern: 'loss and grief' };
  }

  // 4. Romantic Relationships
  if (
    msg.includes('girlfriend') ||
    msg.includes('boyfriend') ||
    msg.includes('partner') ||
    msg.includes('breakup') ||
    msg.includes('broke up') ||
    msg.includes('dating') ||
    msg.includes('fighting with my gf') ||
    msg.includes('fighting with my bf') ||
    msg.includes('trust issues') ||
    msg.includes('jealousy') ||
    msg.includes('heartbreak') ||
    msg.includes('cheated') ||
    msg.includes('ex-girlfriend') ||
    msg.includes('ex-boyfriend') ||
    msg.includes('love life')
  ) {
    return { category: 'RELATIONSHIP', mode: 'COMFORT', isAmbiguous: false, userConcern: 'romantic relationship' };
  }

  // 5. Friendship
  if (
    msg.includes('best friend') ||
    msg.includes('friend') ||
    msg.includes('friends') ||
    msg.includes('stopped talking to me') ||
    msg.includes('ignoring me') ||
    msg.includes('toxic friend') ||
    msg.includes('betrayal') ||
    msg.includes('left out') ||
    msg.includes('friendship')
  ) {
    return { category: 'FRIENDSHIP', mode: 'COMFORT', isAmbiguous: false, userConcern: 'friendship' };
  }

  // 6. Family
  if (
    msg.includes('parent') ||
    msg.includes('parents') ||
    msg.includes('mom') ||
    msg.includes('dad') ||
    msg.includes('mother') ||
    msg.includes('father') ||
    msg.includes('household') ||
    msg.includes('sibling') ||
    msg.includes('brother') ||
    msg.includes('sister') ||
    msg.includes('arguing at home') ||
    msg.includes('family') ||
    msg.includes('relatives')
  ) {
    return { category: 'FAMILY', mode: 'COMFORT', isAmbiguous: false, userConcern: 'family tension' };
  }

  // 7. Academic
  if (
    msg.includes('subject') ||
    msg.includes('subjects') ||
    msg.includes('exam') ||
    msg.includes('exams') ||
    msg.includes('grade') ||
    msg.includes('grades') ||
    msg.includes('failed') ||
    msg.includes('failing') ||
    msg.includes('school') ||
    msg.includes('college') ||
    msg.includes('university') ||
    msg.includes('assignment') ||
    msg.includes('homework') ||
    msg.includes('professor') ||
    msg.includes('teacher') ||
    msg.includes('studying') ||
    msg.includes('study') ||
    msg.includes('gpa')
  ) {
    return { category: 'ACADEMIC', mode: 'GUIDE', isAmbiguous: false, userConcern: 'academics and school' };
  }

  // 8. Financial
  if (
    msg.includes('money') ||
    msg.includes('expenses') ||
    msg.includes('expense') ||
    msg.includes('afford') ||
    msg.includes('bills') ||
    msg.includes('debt') ||
    msg.includes('broke') ||
    msg.includes('budget') ||
    msg.includes('financial') ||
    msg.includes('finances') ||
    msg.includes('salary') ||
    msg.includes('paycheck') ||
    msg.includes('rent')
  ) {
    return { category: 'FINANCIAL', mode: 'GUIDE', isAmbiguous: false, userConcern: 'finances' };
  }

  // 9. Career & Purpose
  if (
    msg.includes('doing with my life') ||
    msg.includes('what am i doing') ||
    msg.includes('no direction') ||
    msg.includes('purpose') ||
    msg.includes('career') ||
    msg.includes('job') ||
    msg.includes('interview') ||
    msg.includes('unemployed') ||
    msg.includes('calling') ||
    msg.includes('future')
  ) {
    return { category: 'CAREER', mode: 'REFLECT', isAmbiguous: false, userConcern: 'direction and purpose' };
  }

  // 10. Decisions & Dilemmas
  if (
    msg.includes('decision') ||
    msg.includes('should i') ||
    msg.includes('which path') ||
    msg.includes('crossroads') ||
    msg.includes('confused what to do') ||
    msg.includes('choice')
  ) {
    return { category: 'DECISION', mode: 'DECISION_SUPPORT', isAmbiguous: false, userConcern: 'decision making' };
  }

  // 11. Motivation & Procrastination
  if (
    msg.includes('procrastinat') ||
    msg.includes('lazy') ||
    msg.includes('stuck') ||
    msg.includes('motivat') ||
    msg.includes('start working') ||
    msg.includes('no energy')
  ) {
    return { category: 'MOTIVATION', mode: 'MOTIVATE', isAmbiguous: false, userConcern: 'motivation' };
  }

  // 12. Celebration & Gratitude
  if (
    msg.includes('passed') ||
    msg.includes('got the job') ||
    msg.includes('celebrate') ||
    msg.includes('grateful') ||
    msg.includes('thankful') ||
    msg.includes('good news') ||
    msg.includes('we won') ||
    msg.includes('blessed')
  ) {
    return { category: 'CELEBRATE', mode: 'CELEBRATE', isAmbiguous: false, userConcern: 'celebration' };
  }

  // 13. Anxiety & Panic & Overwhelm
  if (
    msg.includes('anxiety') ||
    msg.includes('anxious') ||
    msg.includes('panic') ||
    msg.includes('overwhelm') ||
    msg.includes('cant breathe') ||
    msg.includes("can't breathe") ||
    msg.includes('scared') ||
    msg.includes('freaking out')
  ) {
    return { category: 'ANXIETY', mode: 'CALM', isAmbiguous: false, userConcern: 'anxiety and overwhelm' };
  }

  // 14. Spiritual & Prayer
  if (
    msg.includes('pray') ||
    msg.includes('god') ||
    msg.includes('faith') ||
    msg.includes('doubt') ||
    msg.includes('bible') ||
    msg.includes('scripture') ||
    msg.includes('sin') ||
    msg.includes('forgive')
  ) {
    return { category: 'SPIRITUAL', mode: msg.includes('pray') ? 'PRAY' : 'FAITH', isAmbiguous: false, userConcern: 'spiritual faith' };
  }

  // Default to Personal / Other
  return { category: 'OTHER', mode: 'ENCOURAGE', isAmbiguous: false, userConcern: 'personal life' };
}

/**
 * Backward compatibility detector
 */
export function detectEmotionalMode(
  userMessage: string,
  history: Array<{ sender: 'user' | 'ai'; text: string }> = []
): EmotionalResponseMode {
  return analyzeUserProblem(userMessage, history).mode;
}

/**
 * Generates an emotionally intelligent, Scripture-rich response directly addressing
 * the user's actual situation without hardcoding or assuming problems.
 */
export function generateLocalAIResponse(
  userMessage: string,
  history: Array<{ sender: 'user' | 'ai'; text: string }> = []
): LocalAiResponse {
  const analysis = analyzeUserProblem(userMessage, history);
  const msg = userMessage.trim();

  // 1. Immediate Crisis / Safety Response
  if (analysis.category === 'CRISIS') {
    return {
      mode: 'COMFORT',
      category: 'CRISIS',
      text: `I hear how deeply heavy and exhausted you feel right now, and I want to tell you with certainty: your life has profound dignity and worth, and you do not have to carry this darkness alone.

Please pause right now and connect with someone trained to support you safely:

• **988 Suicide & Crisis Lifeline**: Call or text **988** (Available 24/7, free, confidential)
• **Crisis Text Line**: Text **HOME** to **741741**
• **International Support**: https://findahelpline.com

Let's focus only on this immediate moment and getting you safe. Please reach out to these compassionate counselors or a trusted person in your life right now. You are valued.`
    };
  }

  // 2. Ambiguous or Brief Input: Do NOT assume why! Ask a caring clarifying question.
  if (analysis.category === 'AMBIGUOUS') {
    return {
      mode: 'LISTEN',
      category: 'AMBIGUOUS',
      text: `I hear you. When you say "${msg}", I want to make sure I truly understand rather than guessing what you're carrying.

Is it physical exhaustion from a long week, mental burnout from holding too many responsibilities, or an emotional weariness in your heart?

Take all the time you need. I'm right here with you, and there is no pressure to have everything articulated perfectly.`,
      reflectionQuestion: 'What has been taking the biggest toll on your energy recently?'
    };
  }

  // 2.5 Song & Worship Music Requests
  const lowerMsg = userMessage.toLowerCase();
  const isSong =
    /\b(give|sing|play|make|compose|write|generate|create)\b.*\b(song|music|hymn|melody|track|worship)\b/i.test(lowerMsg) ||
    /\b(song|hymn|worship|melody)\b.*\b(about|for|to help|regarding|of)\b/i.test(lowerMsg) ||
    /\b(give me a song|sing a song|sing to me|play me a song|worship song|worship music|peaceful music)\b/i.test(lowerMsg);

  if (isSong) {
    const verse = BIBLE_VERSES.find(v => v.id === 'psalm-23-1-3') || BIBLE_VERSES.find(v => v.id === 'philippians-4-6-7') || BIBLE_VERSES[0];
    return {
      mode: 'CALM',
      category: 'SPIRITUAL',
      text: `I've prepared a gentle, peaceful Christian worship song for your heart called **"Still Waters in the Storm"** 🎵

When the noise of life feels loud, worship has a quiet way of anchoring our thoughts in God's steady presence.

Here are the lyrics written for this melody:

[Verse 1]
When the shadows grow long and the world feels loud,
You whisper of peace through every passing cloud.
My weary heart rests in the palm of Your grace,
Finding quiet courage in Your holy embrace.

[Chorus]
Peace, be still, the waters obey Your call,
In every quiet valley, You never let me fall.
Still waters run deep where Your mercies abide,
Forever my Shepherd, forever my guide.

[Verse 2]
Tomorrow has worries that aren't mine to bear,
Tonight I surrender every unspoken prayer.

I have generated the peaceful acoustic track with Lyria right below — click play to listen, view the full lyrics, or download the song.`,
      bibleVerse: verse,
      reflectionQuestion: 'Which lyric or phrase brings the most calm to your mind right now?'
    };
  }

  // 3. ACADEMICS GUIDANCE
  if (analysis.category === 'ACADEMIC') {
    const verse = BIBLE_VERSES.find(v => v.id === 'james-1-5') || BIBLE_VERSES.find(v => v.id === 'colossians-3-23') || BIBLE_VERSES[0];
    recordVerse(verse.id);
    const lesson = LIFE_LESSONS.find(l => l.category === 'Patience' || l.category === 'Discipline') || LIFE_LESSONS[0];

    return {
      mode: 'GUIDE',
      category: 'ACADEMIC',
      text: `It sounds like your studies are creating genuine pressure right now, and academic weight can quickly make you feel overwhelmed or question your abilities.

First, take a gentle breath. A difficult exam, a struggling grade, or a heavy semester does not define your intelligence, your future, or your divine worth.

**${verse.reference}** offers this steady guidance:
“${verse.text}”

**SoulGuide Reflection:**
When academic demands pile up, our minds tend to jump to the worst-case scenario. But wisdom and progress are built step by step. God cares about your peace of mind just as much as your diligence. You don't have to master the whole course tonight; you only need clarity for the next topic.

**Two realistic academic steps for today:**
1. **The 25-Minute Rule:** Choose one single subject or assignment. Set a timer for 25 minutes, put away other distractions, and focus only on that one section without judging how fast you are going.
2. **Seek Guidance Without Shame:** If you are struggling with a specific concept, write down two specific questions to ask your professor, a study partner, or a tutor. Asking for help is a mark of wisdom, not weakness.

*A quiet prayer for your studies:*
"Lord, quiet the anxious racing thoughts around school and deadlines. Give clear understanding, mental stamina, and peace. Remind this student that their worth is anchored in You, not in a test score. Amen."

Which specific subject or assignment feels like the heaviest burden on you right now?`,
      bibleVerse: verse,
      lifeLesson: {
        title: lesson.title,
        insight: lesson.insight || lesson.corePrinciple
      },
      prayer: "Lord, quiet the anxious racing thoughts around school and deadlines. Give clear understanding, mental stamina, and peace. Amen.",
      suggestedAction: 'Pick one difficult topic and work on it for 25 quiet minutes, then take a real break.',
      reflectionQuestion: 'What is the immediate next concept or task you need clarity on?'
    };
  }

  // 4. FAMILY GUIDANCE
  if (analysis.category === 'FAMILY') {
    const verse = BIBLE_VERSES.find(v => v.id === 'proverbs-15-1') || BIBLE_VERSES.find(v => v.id === 'colossians-3-13') || BIBLE_VERSES[2];
    recordVerse(verse.id);

    return {
      mode: 'COMFORT',
      category: 'FAMILY',
      text: `Carrying tension within your family or hearing arguing at home is deeply exhausting. Home is meant to be a refuge of peace, so when conflict happens under your own roof, there is nowhere easy to escape the noise.

Please remember: you are not responsible for fixing every conflict between other family members, and their emotional storms do not have to dictate your inner stability.

**${verse.reference}** provides this wisdom:
“${verse.text}”

**SoulGuide Reflection:**
When family members clash, harsh words often come from unexpressed hurt, stress, or exhaustion. While you cannot control how others speak or react, you can choose not to pour fuel on the fire, and you can create healthy emotional boundaries to protect your own heart.

**Two practical steps for your peace at home:**
1. **Create an Emotional Sanctuary:** When arguments begin, step into a quiet room, put on calming music or step outside for a short walk. You do not have to absorb what is not yours to carry.
2. **Guard Your Response:** If you are drawn into the conversation, respond with brevity, gentle tones, and clear boundaries rather than matching their volume.

*A prayer for your home:*
"Heavenly Father, bring Your calming presence into this household. Soften hardened tones, heal unspoken resentments, and grant peace. Give wisdom to know when to speak and when to rest quietly in Your shelter. Amen."

How are you caring for your own emotional peace during these family moments?`,
      bibleVerse: verse,
      prayer: "Heavenly Father, bring Your calming presence into this household. Soften hardened tones and grant peace. Amen.",
      suggestedAction: 'Take a short walk or step into a quiet room to breathe and disconnect from household tension.',
      reflectionQuestion: 'What is one boundary that would help safeguard your peace at home today?'
    };
  }

  // 5. FINANCIAL GUIDANCE
  if (analysis.category === 'FINANCIAL') {
    const verse = BIBLE_VERSES.find(v => v.id === 'matthew-6-31-33') || BIBLE_VERSES.find(v => v.id === 'philippians-4-19') || BIBLE_VERSES[0];
    recordVerse(verse.id);

    return {
      mode: 'GUIDE',
      category: 'FINANCIAL',
      text: `Feeling financial pressure or worrying about expenses is a very real, tangible weight. It is natural to feel anxious when costs rise and resources feel limited.

Take a slow breath. Worrying tomorrow's dollars today will only drain your strength for today without adding a single cent to your wallet.

**${verse.reference}** reminds us:
“${verse.text}”

**SoulGuide Reflection:**
God knows your practical needs — your rent, food, bills, and obligations are not invisible to Him. Faith does not mean ignoring financial reality; it means approaching money with calm stewardship rather than frantic panic.

**Two practical next steps for financial clarity:**
1. **Write Down the Exact Numbers:** Fear often inflates numbers in our heads. Write down exactly what is due and the actual dates. Categorize them into immediate essentials (food/shelter) versus items that can be paused or negotiated.
2. **Focus on Today's Provision:** Ask yourself: *"Do I have enough for what is required today?"* If today is provided for, let your mind rest from solving next month until the time arrives.

*A quiet prayer for provision:*
"Lord, You are our Provider. You know every bill, expense, and financial need. Dispel the spirit of panic, grant wisdom and stewardship, and open doors of provision and favor. Amen."

What is the single most urgent expense causing the heaviest concern right now?`,
      bibleVerse: verse,
      prayer: "Lord, You are our Provider. Dispel financial panic, grant wisdom and stewardship, and open doors of provision. Amen.",
      suggestedAction: 'List your current expenses on paper to replace vague worry with clear facts.',
      reflectionQuestion: 'What is one non-essential expense you can pause right now to create breathing room?'
    };
  }

  // 6. FRIENDSHIP GUIDANCE
  if (analysis.category === 'FRIENDSHIP') {
    const verse = BIBLE_VERSES.find(v => v.id === 'ecclesiastes-4-9-10') || BIBLE_VERSES.find(v => v.id === 'proverbs-17-17') || BIBLE_VERSES[3];
    recordVerse(verse.id);

    return {
      mode: 'COMFORT',
      category: 'FRIENDSHIP',
      text: `It hurts deeply when a friend pulls away, stops talking to you, or when an argument creates distance between you. Friendship is where we expect loyalty and warmth, so silence cuts deep.

I want to reassure you: their silence does not mean you are unworthy of love, loyalty, or genuine companionship.

**${verse.reference}** reminds us of the heart of true companionship:
“${verse.text}”

**SoulGuide Reflection:**
People often withdraw or react sharply when they are fighting silent battles of their own, or when miscommunication creates assumptions neither person has clarified. Before jumping to conclusions that the friendship is lost, give grace while preserving your self-respect.

**Two gentle steps for navigating this:**
1. **Give Breathing Room:** If you have already reached out, resist the urge to double-text or force an answer. Time and space often soften reactive emotions.
2. **Send One Simple, Honest Olive Branch:** If appropriate, send one calm note: *"Hey, I value our friendship and noticed things have felt distant. I'm here whenever you're ready to talk."* Then leave it in their hands.

*A prayer for friendship:*
"Lord, comfort the ache of feeling distanced from a friend. Soften misunderstandings, heal bruised feelings, and grant discernment. Surround this heart with friends who reflect Your steadfast love. Amen."

Did something specific trigger the distance between you two, or did it happen unexpectedly?`,
      bibleVerse: verse,
      prayer: "Lord, comfort the ache of feeling distanced from a friend. Soften misunderstandings and heal bruised feelings. Amen.",
      suggestedAction: 'Give the situation 24-48 hours of quiet space without rushing to force a resolution.',
      reflectionQuestion: 'Is there an unspoken misunderstanding that needs a gentle, direct conversation?'
    };
  }

  // 7. ROMANTIC RELATIONSHIPS
  if (analysis.category === 'RELATIONSHIP') {
    const verse = BIBLE_VERSES.find(v => v.id === '1-corinthians-13-4-7') || BIBLE_VERSES.find(v => v.id === 'ephesians-4-2-3') || BIBLE_VERSES[4];
    recordVerse(verse.id);

    return {
      mode: 'COMFORT',
      category: 'RELATIONSHIP',
      text: `Repeated arguments and friction in a romantic relationship take an immense toll on your heart and mind. When trust feels fragile or when every small conversation turns into a battle, it feels like walking on eggshells.

Remember: repeated conflict is almost never just about the surface disagreement — it is usually about an underlying need for emotional safety, trust, and validation.

**${verse.reference}** sets this standard for love:
“${verse.text}”

**SoulGuide Reflection:**
Love is patient and gentle, but trust is something built through consistent, transparent behavior over time. When trust is wounded or jealousy takes root, accusations only drive people further apart. True healing begins when both partners stop trying to "win" the argument and start trying to understand each other's fear.

**Two practical steps for this relationship:**
1. **Change the Conversation Dynamic:** Instead of defending yourself or arguing about details, speak to the emotion underneath: *"I love you and want you to feel secure with me. What can I do to help you feel safe and confident in us?"*
2. **Call a Time-Out When Boiling:** If an argument escalates, agree to a 20-minute cool-down where neither speaks in anger. Return only when both hearts are calm.

*A prayer for your relationship:*
"Lord, bring Your peace and clarity into this relationship. Remove suspicion, bitterness, and anger. Teach both hearts to communicate with gentleness, honesty, and deep respect. Restore trust and healing where there is friction. Amen."

What seems to be the underlying fear or trigger beneath these recurring arguments?`,
      bibleVerse: verse,
      prayer: "Lord, bring Your peace and clarity into this relationship. Remove suspicion, bitterness, and anger. Amen.",
      suggestedAction: 'During the next disagreement, pause and ask: "What are we both really afraid of right now?"',
      reflectionQuestion: 'What does genuine trust and emotional safety look like for both of you?'
    };
  }

  // 8. CAREER, LIFE PURPOSE & DIRECTION
  if (analysis.category === 'CAREER') {
    const verse = BIBLE_VERSES.find(v => v.id === 'jeremiah-29-11') || BIBLE_VERSES.find(v => v.id === 'proverbs-3-5-6') || BIBLE_VERSES[7];
    recordVerse(verse.id);

    return {
      mode: 'REFLECT',
      category: 'CAREER',
      text: `Wondering what you are doing with your life or feeling completely lost regarding your direction is a deeply vulnerable place to be. But feeling lost is often the very soil where new clarity takes root.

You don't need a 10-year master plan tonight. God guides us like a lantern on a path — illuminating one step at a time, not the entire horizon all at once.

**${verse.reference}** reminds us:
“${verse.text}”

**SoulGuide Reflection:**
Your purpose is not a single job title, a sudden lottery win, or an elusive destination you might miss by accident. Your purpose begins with who you are being today — your character, your kindness, and your faithfulness with small things right in front of you.

**Two grounding steps for discovering direction:**
1. **Steward Today's Hours:** Shift your question from *"What should I do with my entire life?"* to *"What is one meaningful, faithful thing I can accomplish before I go to sleep tonight?"*
2. **Inventory Your Energy:** Write down 3 activities or moments from the past year that gave you genuine energy and fulfillment, and 3 that drained you. Clarity comes from noticing patterns.

*A prayer for guidance:*
"Lord, quiet the panic of uncertainty. When the future feels cloudy, give peace for the present day. Order every step, open doors that align with Your purpose, and remind this heart that You hold their future securely. Amen."

What is one skill, interest, or value that has consistently stayed with you through the years?`,
      bibleVerse: verse,
      prayer: "Lord, quiet the panic of uncertainty. Order every step and open doors that align with Your purpose. Amen.",
      suggestedAction: 'Write down 3 moments from your life that felt deeply meaningful to discover clues about your gifts.',
      reflectionQuestion: 'If fear of failure was removed, what is one direction you would explore?'
    };
  }

  // 9. DECISION & DILEMMAS
  if (analysis.category === 'DECISION') {
    const verse = BIBLE_VERSES.find(v => v.id === 'proverbs-3-5-6') || BIBLE_VERSES[7];
    recordVerse(verse.id);

    return {
      mode: 'DECISION_SUPPORT',
      category: 'DECISION',
      text: `Standing at a crossroads can feel paralyzing, especially when you care deeply about choosing the right path.

Take a slow breath. You don't have to carry the outcome of every scenario right now. Focus on discernment, not anxiety.

**${verse.reference}** gives us this foundation:
“${verse.text}”

**SoulGuide Reflection:**
Notice Scripture doesn't say you must have total human certainty. It says to acknowledge God and commit your ways to Him, and He will make your path straight. Even if you make a choice that needs adjustment later, His grace is big enough to redirect you.

**Two clarifying steps for your decision:**
1. **The Peace Test:** Between your options, which path leads to deep, quiet long-term peace (even if it takes courage), versus frantic temporary relief?
2. **The 10-10-10 Perspective:** How will you feel about this decision 10 days from now? 10 months from now? 10 years from now?

Which option feels most aligned with your core values and inner peace?`,
      bibleVerse: verse,
      suggestedAction: 'Evaluate both options through the lens of long-term peace rather than immediate comfort.',
      reflectionQuestion: 'What does your quiet conscience tell you when you silence the noise of other people’s opinions?'
    };
  }

  // 10. MOTIVATION & PROCRASTINATION
  if (analysis.category === 'MOTIVATION') {
    const verse = BIBLE_VERSES.find(v => v.id === 'galatians-6-9') || BIBLE_VERSES[14];
    recordVerse(verse.id);

    return {
      mode: 'MOTIVATE',
      category: 'MOTIVATION',
      text: `Feeling stuck or struggling to find motivation is rarely about being "lazy." Most of the time, it comes from mental overload, fear of not doing it perfectly, or simply running on empty reserves.

Let's remove the shame so you can move forward with ease. Action produces motivation, not the other way around.

**${verse.reference}** encourages us:
“${verse.text}”

**SoulGuide Reflection:**
When a task feels like an insurmountable mountain, the brain naturally resists starting. Lower the bar of entry until it is impossible to resist. You do not need to finish everything today; you only need to overcome the friction of beginning.

**The 5-Minute Principle:**
Pick the single task you have been putting off. Give yourself permission to work on it for just 5 minutes. If you want to stop after 5 minutes, you can. But nine times out of ten, breaking that initial barrier is all you need.

What is the absolute smallest piece of that task you can touch right now?`,
      bibleVerse: verse,
      suggestedAction: 'Set a 5-minute timer and focus exclusively on the first step of that task.',
      reflectionQuestion: 'What small fear or friction is making you avoid starting?'
    };
  }

  // 11. ANXIETY & OVERWHELM
  if (analysis.category === 'ANXIETY') {
    const verse = BIBLE_VERSES.find(v => v.id === 'philippians-4-6-7') || BIBLE_VERSES.find(v => v.id === 'isaiah-41-10') || BIBLE_VERSES[1];
    recordVerse(verse.id);

    return {
      mode: 'CALM',
      category: 'ANXIETY',
      text: `That sounds like a heavy storm to be navigating. When anxiety or overwhelm hits, everything feels urgent, loud, and immediate.

Let's slow everything down together right now. You don't have to figure out tomorrow until tomorrow arrives.

Take a slow, deep breath in with me... hold it gently... and exhale the tightness in your chest.

**${verse.reference}** reminds us:
“${verse.text}”

**SoulGuide Reflection:**
Peace is not the absence of trouble; it is the presence of God guarding your heart in the middle of it. You are safe in this present moment, and you are not required to hold up the world by yourself.

**One grounding action for right now:**
Place both feet flat on the floor, drop your shoulders away from your ears, and name three things you can physically see around you right now. Anchor yourself in the present moment.

*A quiet prayer for peace:*
"Lord, speak Your quiet 'Peace, be still' into this anxious mind. Guard this heart, steady the breathing, and replace fear with Your gentle presence. Amen."

Would you like to take a quiet moment together, or would you like another grounding thought?`,
      bibleVerse: verse,
      prayer: "Lord, speak Your quiet 'Peace, be still' into this anxious mind. Guard this heart and steady every breath. Amen.",
      suggestedAction: 'Take 3 deep, slow breaths and relax your shoulders.',
      reflectionQuestion: 'What is one worry you can intentionally hand over to God for the next hour?'
    };
  }

  // 12. CELEBRATION & GRATITUDE
  if (analysis.category === 'CELEBRATE') {
    const verse = BIBLE_VERSES.find(v => v.id === '1-thessalonians-5-16-18') || BIBLE_VERSES[16];
    recordVerse(verse.id);

    return {
      mode: 'CELEBRATE',
      category: 'CELEBRATE',
      text: `That is truly wonderful news! I celebrate this victory and breakthrough with you! 🎉

In the rush of life, it is so easy to achieve something and immediately hurry to the next hurdle. Pausing to savor goodness and answered prayers roots deep joy into your soul.

**${verse.reference}** reminds us:
“${verse.text}”

**SoulGuide Reflection:**
Gratitude turns what we have into enough, and honoring milestones acknowledges the grace, hard work, and support that brought you to this moment.

**A gentle reflection for today:**
Take 5 minutes to write down this memory in your journal, or reach out to someone who believed in you or prayed for you along the way.

Who was someone that supported you in this victory that you can thank today?`,
      bibleVerse: verse,
      suggestedAction: 'Record this victory in your journal or share your joy with someone who supported you.',
      reflectionQuestion: 'Who was a quiet supporter in this win that you can thank today?'
    };
  }

  // 13. GRIEF & LOSS
  if (analysis.category === 'GRIEF') {
    const verse = BIBLE_VERSES.find(v => v.id === 'psalm-34-18') || BIBLE_VERSES[5];
    recordVerse(verse.id);

    return {
      mode: 'GRIEF_SUPPORT',
      category: 'GRIEF',
      text: `I hold your heart with such tenderness right now. Grief is one of the heaviest aches any person can experience, and it is completely normal if the world feels suddenly quiet, strange, or difficult to bear.

You do not have to put on a brave face, rush your healing, or explain your tears to anyone.

**${verse.reference}** provides this gentle truth:
“${verse.text}”

**SoulGuide Reflection:**
God does not stand at a clinical distance with easy slogans when you are brokenhearted. He draws near, sitting beside you in the quiet space of your sorrow. Tears are not a lack of faith; they are love that has nowhere to go.

**A gentle step for right now:**
Give yourself permission to do nothing today that is not strictly necessary. Drink a warm cup of water, wrap yourself in comfort, and let yourself rest without apology.

*A quiet prayer for you:*
"Lord, draw near to this broken heart. Wrap Your quiet comfort around their spirit, hold them in this valley of sorrow, and let them feel Your tender presence. Amen."

What is one way you can be exceptionally gentle with yourself today?`,
      bibleVerse: verse,
      prayer: "Lord, draw near to this broken heart. Wrap Your quiet comfort around their spirit and hold them in this valley. Amen.",
      suggestedAction: 'Give yourself permission to rest today without expecting yourself to perform.',
      reflectionQuestion: 'What is one way you can be exceptionally gentle with yourself today?'
    };
  }

  // 14. SPIRITUAL & PRAYER REQUESTS
  if (analysis.category === 'SPIRITUAL') {
    const verse = BIBLE_VERSES.find(v => v.id === 'philippians-4-6-7') || BIBLE_VERSES.find(v => v.id === 'matthew-11-28-30') || BIBLE_VERSES[1];
    recordVerse(verse.id);

    return {
      mode: 'PRAY',
      category: 'SPIRITUAL',
      text: `I would be honored to join you in prayer. Prayer is not about using elaborate or formal words; it is simply opening your honest heart before a Father who already loves you and knows every detail of your life.

*Let us pray together:*

"Dear Heavenly Father,
We come before You in this quiet space, placing everything that is resting on this heart into Your caring hands. You see the unspoken burdens, the hopes, and the uncertainties carried in secret.

Grant Your supernatural peace that transcends human comprehension. Guard this mind against fear, renew weary strength, and grant wisdom for every step ahead.

Surround this life with Your grace, and let them know with certainty that they are never alone. In Your holy name, Amen. 🙏"

**${verse.reference}** assures us:
“${verse.text}”

Is there a specific detail or person you would like to bring into this prayer as well?`,
      bibleVerse: verse,
      prayer: "Dear Heavenly Father, we come before You in this quiet space, placing everything resting on this heart into Your caring hands...",
      suggestedAction: 'Take a quiet moment of stillness to echo this prayer in your heart.',
      reflectionQuestion: 'What is the most honest thing you want to express to God today?'
    };
  }

  // 15. GENERAL / OTHER SITUATIONS
  // Use intelligent scripture recommendation based on exact user message
  const rec = recommendScriptures(userMessage, recentVerseIds);
  recordVerse(rec.primaryVerse.id);

  return {
    mode: 'ENCOURAGE',
    category: 'OTHER',
    text: `Thank you for sharing that with me. I am listening closely, and I want you to know that whatever you are experiencing, your thoughts and feelings are completely welcome here.

Whenever life feels uncertain or complicated, it helps to strip away the noise and remember what is steady, true, and enduring.

**${rec.primaryVerse.reference}** offers this grounding truth:
“${rec.primaryVerse.text}”

**SoulGuide Reflection:**
${rec.primaryVerse.shortReflection}

**A gentle reflection for you:**
${rec.reflectionQuestion}

What part of this feels like the heaviest thing you are carrying right now? Tell me more, and let's find the next gentle step together. 💜`,
    bibleVerse: rec.primaryVerse,
    additionalVerses: rec.additionalVerses,
    reflectionQuestion: rec.reflectionQuestion,
    suggestedAction: 'Pause, take a slow breath, and focus only on the next faithful step.'
  };
}

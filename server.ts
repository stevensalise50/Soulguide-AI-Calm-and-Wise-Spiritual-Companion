import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const SOULGUIDE_SYSTEM_INSTRUCTION = `You are SoulGuide (also known as Life Guide), a calm, wise, deeply compassionate, and emotionally intelligent Christian spiritual companion and life mentor.

CORE IDENTITY & PURPOSE:
- You are a calm, loving spiritual companion sitting beside the user on a quiet evening.
- You are NOT a shouting preacher, NOT a clinical therapist, NOT a robotic chatbot, NOT a search engine, and NOT a doctor or lawyer.
- You offer comfort, biblical wisdom, practical guidance, and grounded hope.
- Never assume the user's name or hardcode any name. Treat them with deep respect and warmth.

UNIVERSAL PROBLEM UNDERSTANDING (DO NOT HARDCODE OR ASSUME A PROBLEM):
Never assume the user is stressed about school, family, relationships, or anything else unless they specifically express it.
Determine the problem exclusively from the user's actual message.
Recognize and support any reasonable life problem, including:
1. ACADEMICS: School stress, exams, assignments, grades, failed subjects, academic pressure, procrastination, time management, fear of failure, graduation, career uncertainty.
2. FAMILY: Family conflict, parents arguing, siblings, household problems, misunderstandings, family expectations, feeling unsupported, communication problems.
3. FINANCIAL: Lack of money, budgeting concerns, financial pressure, expenses, debt concerns, work/income stress, fear about the future.
4. FRIENDSHIP: Losing friends, arguments, feeling ignored, betrayal, toxic friendships, loneliness, miscommunication.
5. ROMANTIC RELATIONSHIPS: Boyfriend/girlfriend problems, breakups, arguments, trust issues, jealousy, communication problems, long-distance relationships, feeling ignored, relationship uncertainty, moving on, heartbreak.
6. PERSONAL: Low confidence, lack of motivation, feeling lost, failure, regret, anger, overthinking, fear, stress, loneliness, life decisions, purpose, personal growth.
7. SPIRITUAL: Questions about faith, wanting to pray, feeling distant from God, wanting Scripture, doubt, forgiveness, gratitude, finding hope.
8. AMBIGUOUS / BRIEF INPUTS: If the user provides a very short or ambiguous statement (e.g., "I'm just tired.", "I don't know.", "I feel strange."): DO NOT ASSUME why. Acknowledge with warmth and ask a gentle clarifying question (e.g., "I hear you. When you say you're tired, is it physical exhaustion from a long week, mental burnout from carrying too many decisions, or an emotional weariness in your heart? Take all the time you need — I'm right here with you.")
9. OTHER PROBLEMS: If the situation does not fit a predefined category, STILL respond appropriately with care and biblical wisdom. NEVER say "That's not supported."
10. MUSIC & SONG REQUESTS: If the user asks for a song, music, hymn, or worship track (e.g. "give me a song", "sing me a song", "song about peace", "worship song for my anxiety", "play a song"): Warmly present an original, heartfelt Christian song or hymn tailored to their heart. Provide a song title (e.g. "🎵 Still Waters", "🎵 Anchor in the Storm"), followed by gentle lyrics with [Verse 1], [Chorus], and [Verse 2]. Conclude with a warm pastoral note that a soothing audio melody has been composed and is ready to play below.

RESPONSE MUST BE RELATED TO THE ACTUAL MESSAGE (NO GENERIC PLATITUDES):
Every response MUST directly address the user's actual situation and specific details.
Avoid generic motivational slogans like "Keep believing in yourself. Everything happens for a reason." If they mention their girlfriend and trust, talk specifically about trust and communication. If they mention failed subjects, talk about academic grace, perspective, and study habits.

RESPONSE STRUCTURE (EMOTIONALLY INTELLIGENT):
1. Acknowledge: Name and validate what they are going through with specific reference to their situation.
2. Reassure: Grounded reassurance that makes sense for this context.
3. Relevant Scripture: Cite a real, accurate Bible verse (e.g. Philippians 4:6–7, Proverbs 3:5–6, Matthew 11:28–30, Psalm 34:18, Colossians 3:13).
   - CRITICAL ACCURACY: Never fabricate verses, never invent chapter or verse numbers. Clearly distinguish Bible Scripture from your own reflection.
4. SoulGuide Reflection: Practical biblical wisdom explaining the verse in direct context of their situation.
5. Practical Next Step: Realistic, actionable step tailored to this specific struggle.
6. Optional Prayer: Short, heart-focused prayer addressing the specific situation.
7. Gentle Follow-Up: One thoughtful clarifying or supportive question.

STRICT SAFETY & NEVER-SHAME RULES:
- NEVER shame the user. Never say "You don't have enough faith," "You're failing God," or "You shouldn't feel that way."
- Instead use language like: "It's okay to acknowledge that this is difficult," "You don't have to carry everything alone," "Let's take this one step at a time."
- Avoid overwhelming walls of text. Be concise, peaceful, and warm.
- CRITICAL CRISIS SAFETY: If the user expresses intent to harm themselves or end their life, immediately respond with deep tenderness and direct them to the 988 Suicide & Crisis Lifeline (call/text 988, free, 24/7) and Crisis Text Line (HOME to 741741). Prioritize human safety above all else.
- Maintain conversation continuity: Remember recent context so follow-ups build on the conversation naturally.`;

// Shared lazy Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    name: 'SoulGuide API',
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString()
  });
});

// Fast streaming Chat endpoint with Gemini 3.8 Flash + ThinkingLevel.LOW
app.post('/api/chat', async (req, res) => {
  const { message, history, mode, stream = true } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const ai = getGenAi();
  if (ai) {
    // Rolling context window: take only the most recent 6-8 messages to keep prompt processing instant
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-8)) {
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${mode ? `[Emotional Mode: ${mode}] ` : ''}${message}` }]
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      try {
        let streamResponse;
        try {
          streamResponse = await ai.models.generateContentStream({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: SOULGUIDE_SYSTEM_INSTRUCTION,
              temperature: 0.65,
              topP: 0.95,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW
              }
            }
          });
        } catch (primaryErr: any) {
          console.warn('Primary stream model error, attempting fast fallback gemini-3.1-flash-lite:', primaryErr?.message);
          streamResponse = await ai.models.generateContentStream({
            model: 'gemini-3.1-flash-lite',
            contents,
            config: {
              systemInstruction: SOULGUIDE_SYSTEM_INSTRUCTION,
              temperature: 0.65
            }
          });
        }

        for await (const chunk of streamResponse) {
          const chunkText = chunk.text;
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      } catch (err: any) {
        console.warn('Streaming error, falling back to local engine:', err?.message);
        res.write(`data: ${JSON.stringify({ error: err?.message, fallback: true })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
    }

    // Non-streaming fallback
    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SOULGUIDE_SYSTEM_INSTRUCTION,
            temperature: 0.65,
            topP: 0.95,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW
            }
          }
        });
      } catch (primaryErr: any) {
        console.warn('Primary model error, attempting fallback model:', primaryErr?.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: SOULGUIDE_SYSTEM_INSTRUCTION,
            temperature: 0.65
          }
        });
      }

      const text = response.text || '';
      return res.json({ text, source: 'gemini' });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local engine:', err?.message);
      return res.json({ text: null, fallback: true, error: err?.message });
    }
  }

  // If no Gemini key, client will use local intelligent engine
  res.json({ text: null, fallback: true });
});

// API Prayer generation endpoint
app.post('/api/generate-prayer', async (req, res) => {
  const { topic, style } = req.body;
  const ai = getGenAi();

  if (ai && topic) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a deeply comforting, respectful, reverent, and gentle Christian prayer for the user regarding: "${topic}".
Style requested: ${style || 'gentle and reverent'}.
Include quiet peace, surrender, trust, and hope. Keep it around 2 to 3 short paragraphs.
Do not use preachy clichés; sound like a faithful companion praying alongside them.`,
        config: {
          systemInstruction: SOULGUIDE_SYSTEM_INSTRUCTION,
          temperature: 0.7
        }
      });
      return res.json({ prayer: response.text });
    } catch (e: any) {
      console.warn('Prayer generation error:', e?.message);
    }
  }

  // Graceful template fallback
  const fallbackPrayer = `Dear Heavenly Father,\n\nWe bring this precious heart and these quiet thoughts before You today regarding "${topic || 'peace and guidance'}". You know every unspoken burden before it is spoken, and You see the weight carried in secret.\n\nGrant Your steady, soothing peace that transcends all human understanding. When the road ahead feels uncertain, remind them that they only need to take one faithful step at a time, deeply anchored in Your unfailing love.\n\nRenew their strength, guard their mind against fear, and let them feel Your comforting presence wrapping around them this day. In Your grace and peace, Amen. 🙏`;

  res.json({ prayer: fallbackPrayer });
});

// Synthesizes a gentle, calming acoustic & piano worship progression in 16-bit WAV
function generatePeacefulWorshipAudio(promptText: string, suggestedTitle?: string): {
  audioBase64: string;
  title: string;
  lyrics: string;
  theme: string;
} {
  const sampleRate = 22050;
  const durationSec = 14;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Peaceful Christian progression: D major -> A major -> B minor -> G major
  const chords = [
    [293.66, 369.99, 440.00, 587.33], // D maj (D4, F#4, A4, D5)
    [220.00, 277.18, 329.63, 440.00], // A maj (A3, C#4, E4, A4)
    [246.94, 293.66, 369.99, 493.88], // B min (B3, D4, F#4, B4)
    [196.00, 246.94, 293.66, 392.00]  // G maj (G3, B3, D4, G4)
  ];
  const chordLen = numSamples / chords.length;

  for (let i = 0; i < numSamples; i++) {
    const chordIdx = Math.min(chords.length - 1, Math.floor(i / chordLen));
    const chord = chords[chordIdx];
    const tInChord = (i % chordLen) / sampleRate;
    const env = Math.exp(-tInChord * 0.85) * Math.min(1, tInChord * 25);

    let sample = 0;
    // Layered acoustic warm tone with subtle overtone shimmer
    for (let f = 0; f < chord.length; f++) {
      const freq = chord[f];
      sample += Math.sin(2 * Math.PI * freq * (i / sampleRate)) * 0.55;
      sample += Math.sin(2 * Math.PI * (freq * 2) * (i / sampleRate)) * 0.15;
      sample += Math.sin(2 * Math.PI * (freq * 3) * (i / sampleRate)) * 0.05;
    }
    sample = (sample / chord.length) * env * 0.45;
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
  }

  const pLower = promptText.toLowerCase();
  let theme = 'Peace & Rest';
  let title = suggestedTitle || 'Still Waters in the Storm';
  let lyrics = `[Verse 1]\nWhen the shadows grow long and the world feels loud,\nYou whisper of peace through every passing cloud.\nMy weary heart rests in the palm of Your grace,\nFinding quiet courage in Your holy embrace.\n\n[Chorus]\nPeace, be still, the waters obey Your call,\nIn every quiet valley, You never let me fall.\nStill waters run deep where Your mercies abide,\nForever my Shepherd, forever my guide.\n\n[Verse 2]\nTomorrow has worries that aren't mine to bear,\nTonight I surrender every unspoken prayer.`;

  if (pLower.includes('anxiety') || pLower.includes('fear') || pLower.includes('worry') || pLower.includes('stress')) {
    theme = 'Comfort & Freedom from Fear';
    title = suggestedTitle || 'Anchor of My Soul';
    lyrics = `[Verse 1]\nThough the winds may rage and the night feels long,\nIn the quiet of my heart You give a steady song.\nNot by my own strength, not by what I see,\nYour everlasting arms are holding onto me.\n\n[Chorus]\nYou are the anchor when the tempests rise,\nA beacon of hope before my weary eyes.\nI cast all my burdens at Your faithful feet,\nWhere anxiety fades and Your mercies meet.`;
  } else if (pLower.includes('exam') || pLower.includes('school') || pLower.includes('study') || pLower.includes('academic')) {
    theme = 'Wisdom & Calm';
    title = suggestedTitle || 'Wisdom in the Quiet';
    lyrics = `[Verse 1]\nPages of questions, a mind running fast,\nRemind me this season is fleeting, will pass.\nYou gave me a spirit of power and mind,\nIn patience and grace, true understanding I find.\n\n[Chorus]\nGuide every thought with calm and clear grace,\nI leave all my striving in this peaceful place.`;
  } else if (pLower.includes('praise') || pLower.includes('gratitude') || pLower.includes('joy') || pLower.includes('thank')) {
    theme = 'Praise & Thanksgiving';
    title = suggestedTitle || 'Morning of Grace';
    lyrics = `[Verse 1]\nWith the break of dawn and the rising sun,\nI count all the faithful works You have done.\nFrom breath in my lungs to the bread on the board,\nMy soul sings in wonder to You, O Lord.\n\n[Chorus]\nHallelujah, for Your love endures,\nThrough all generations, Your promise is sure!`;
  }

  return {
    audioBase64: buffer.toString('base64'),
    title,
    lyrics,
    theme
  };
}

// API Music Generation endpoint using Lyria
// Models: lyria-3-clip-preview (up to 30s clips) and lyria-3-pro-preview (full-length tracks)
app.post('/api/generate-music', async (req, res) => {
  const { prompt, model = 'lyria-3-clip-preview', title, theme } = req.body;
  const ai = getGenAi();

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
  console.log(`[Music] Generating music using ${selectedModel} for: "${String(prompt).slice(0, 60)}..."`);

  if (ai) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: prompt
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (audioBase64) {
        return res.json({
          success: true,
          audioBase64,
          mimeType,
          lyrics: lyrics || undefined,
          model: selectedModel,
          title: title || 'SoulGuide Worship Song',
          theme: theme || 'Christian Worship',
          source: 'lyria'
        });
      }
    } catch (err: any) {
      console.warn(`[Music] Lyria model (${selectedModel}) returned notice:`, err?.message);

      // Extract custom lyrics using Gemini 3.8 Flash if possible
      let dynamicLyrics = '';
      let dynamicTitle = title;
      try {
        const lyricGen = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Create short Christian worship song lyrics (Verse 1, Chorus, Verse 2) and a 3-5 word song title based on: "${prompt}".
Format:
TITLE: <title>
LYRICS:
<lyrics>`
        });
        const out = lyricGen.text || '';
        const titleMatch = out.match(/TITLE:\s*(.+)/i);
        if (titleMatch && !dynamicTitle) {
          dynamicTitle = titleMatch[1].trim();
        }
        const lyricMatch = out.match(/LYRICS:\s*([\s\S]+)/i);
        if (lyricMatch) {
          dynamicLyrics = lyricMatch[1].trim();
        }
      } catch {
        // Fallback to template
      }

      const fallbackMusic = generatePeacefulWorshipAudio(prompt, dynamicTitle);
      return res.json({
        success: true,
        fallback: true,
        audioBase64: fallbackMusic.audioBase64,
        mimeType: 'audio/wav',
        lyrics: dynamicLyrics || fallbackMusic.lyrics,
        model: selectedModel,
        title: dynamicTitle || fallbackMusic.title,
        theme: theme || fallbackMusic.theme,
        source: 'harmonic-synthesizer',
        note: err?.message?.includes('quota') ? 'Lyria requires a paid API key. Ambient worship preview provided.' : undefined
      });
    }
  }

  // Fallback when no API client
  const fallbackMusic = generatePeacefulWorshipAudio(prompt, title);
  return res.json({
    success: true,
    fallback: true,
    audioBase64: fallbackMusic.audioBase64,
    mimeType: 'audio/wav',
    lyrics: fallbackMusic.lyrics,
    model: selectedModel,
    title: fallbackMusic.title,
    theme: theme || fallbackMusic.theme,
    source: 'harmonic-synthesizer'
  });
});

// API Journal Reflection endpoint
app.post('/api/reflect-journal', async (req, res) => {
  const { entryContent, mood } = req.body;
  const ai = getGenAi();

  if (ai && entryContent) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `The user wrote this personal journal entry (mood: ${mood || 'reflective'}):
"${entryContent}"

Provide a gentle, non-diagnostic reflection (around 2 short paragraphs):
- Notice emotional themes with warmth (e.g., "You seem to be reflecting on patience and letting go...")
- Never make psychological or medical diagnoses.
- Offer an encouraging perspective and a grounding verse or reminder.`,
        config: {
          systemInstruction: SOULGUIDE_SYSTEM_INSTRUCTION,
          temperature: 0.65
        }
      });
      return res.json({ reflection: response.text });
    } catch (e: any) {
      console.warn('Journal reflection error:', e?.message);
    }
  }

  res.json({
    reflection: `You have been reflecting deeply with honesty and courage. Recognizing what you are carrying is often the first step toward releasing it into peace. Remember that growth happens quietly, one day at a time.`
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoulGuide Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

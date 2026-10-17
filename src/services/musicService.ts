import { GeneratedSong } from '../types';

export function isSongRequest(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  
  // Direct patterns for song requests
  const songPatterns = [
    /\b(give|sing|play|make|compose|write|generate|create)\b.*\b(song|music|hymn|melody|track|worship)\b/i,
    /\b(song|hymn|worship|melody)\b.*\b(about|for|to help|regarding|of)\b/i,
    /\b(worship song|praise song|gospel song|christian song)\b/i,
    /\b(can you (sing|play|give me a song))\b/i,
    /\b(give me a song)\b/i,
    /\b(sing a song)\b/i,
    /\b(sing to me)\b/i,
    /\b(play me a song)\b/i,
    /\b(need a song)\b/i,
    /\b(worship music)\b/i,
    /\b(peaceful music)\b/i
  ];

  return songPatterns.some((pattern) => pattern.test(lower));
}

export function extractSongTheme(text: string): { title: string; theme: string } {
  const lower = text.toLowerCase();

  if (lower.includes('anxi') || lower.includes('fear') || lower.includes('panic') || lower.includes('worry')) {
    return { title: 'Anchor in the Storm', theme: 'Comfort & Stillness' };
  }
  if (lower.includes('exam') || lower.includes('school') || lower.includes('study') || lower.includes('stress')) {
    return { title: 'Quiet Understanding', theme: 'Academic Peace & Clarity' };
  }
  if (lower.includes('peace') || lower.includes('rest') || lower.includes('sleep') || lower.includes('calm')) {
    return { title: 'Still Waters', theme: 'Peace & Holy Rest' };
  }
  if (lower.includes('praise') || lower.includes('thank') || lower.includes('gratitude') || lower.includes('joy')) {
    return { title: 'Morning of Grace', theme: 'Praise & Thanksgiving' };
  }
  if (lower.includes('heal') || lower.includes('grief') || lower.includes('loss') || lower.includes('sad')) {
    return { title: 'Held in Everlasting Arms', theme: 'Healing in Sorrow' };
  }
  if (lower.includes('friend') || lower.includes('love') || lower.includes('relationship')) {
    return { title: 'Bound in Gentle Grace', theme: 'Restoration & Love' };
  }

  return { title: 'Song of Living Hope', theme: 'Spiritual Peace & Guidance' };
}

export async function requestSongGeneration(
  prompt: string,
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' = 'lyria-3-clip-preview',
  customTitle?: string
): Promise<GeneratedSong> {
  const { title: detectedTitle, theme: detectedTheme } = extractSongTheme(prompt);
  const songTitle = customTitle || detectedTitle;
  const songId = `song-${Date.now()}`;

  try {
    const res = await fetch('/api/generate-music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Create a deeply comforting Christian worship song track. Theme: ${detectedTheme}. Mood: gentle, soothing, acoustic, reverent, peaceful piano and acoustic guitar. User prompt: "${prompt}".`,
        model,
        title: songTitle,
        theme: detectedTheme
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    let audioUrl: string | undefined;

    if (data.audioBase64) {
      try {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        audioUrl = URL.createObjectURL(blob);
      } catch (decodeErr) {
        console.warn('Could not decode audioBlob into URL, falling back to data URL', decodeErr);
        audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      }
    }

    return {
      id: songId,
      title: data.title || songTitle,
      theme: data.theme || detectedTheme,
      prompt,
      audioBase64: data.audioBase64,
      audioUrl,
      mimeType: data.mimeType || 'audio/wav',
      lyrics: data.lyrics,
      duration: model === 'lyria-3-pro-preview' ? 'Full Track (~2:00)' : '30s Clip',
      model,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGenerating: false,
      note: data.note
    };
  } catch (err: any) {
    console.error('Song generation request error:', err);
    return {
      id: songId,
      title: songTitle,
      theme: detectedTheme,
      prompt,
      model,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGenerating: false,
      error: err?.message || 'Could not generate song'
    };
  }
}

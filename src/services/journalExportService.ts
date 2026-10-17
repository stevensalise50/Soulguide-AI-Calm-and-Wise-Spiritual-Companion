import { jsPDF } from 'jspdf';
import { JournalEntry } from '../types';

export interface ExportOptions {
  title?: string;
  scope?: 'all' | 'filtered' | 'single';
  includeScriptures?: boolean;
  includeReflections?: boolean;
  includeMoods?: boolean;
  aiReflectionsMap?: Record<string, string>;
}

const MOOD_LABELS: Record<string, string> = {
  peaceful: 'Peaceful',
  grateful: 'Grateful',
  hopeful: 'Hopeful',
  reflective: 'Reflective',
  struggling: 'Struggling',
  weary: 'Weary'
};

/**
 * Strips characters that cannot be rendered in standard jsPDF WinAnsi fonts.
 */
function sanitizeForPdf(text: string): string {
  if (!text) return '';
  return text
    // Replace smart quotes and dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    // Replace common emoji icons with clean text tags
    .replace(/🕊️|🕊/g, '[Peace]')
    .replace(/🙏/g, '[Prayer]')
    .replace(/🌱/g, '[Growth]')
    .replace(/☕/g, '[Reflection]')
    .replace(/🌧️|🌧/g, '[Struggle]')
    .replace(/🛌/g, '[Rest]')
    .replace(/📖/g, '[Scripture]')
    .replace(/✨|⭐/g, '*')
    .replace(/❤️|💖|🤍/g, '<3>')
    // Filter out unprintable high unicode characters that might corrupt PDF rendering
    .replace(/[^\x00-\x7F\u00A0-\u00FF]/g, '');
}

/**
 * Downloads a Blob directly to the user's local machine.
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a formatted Plain Text (.txt) file.
 */
export function exportJournalAsText(
  entries: JournalEntry[],
  filename = 'SoulGuide_Journal_Reflections.txt',
  options: ExportOptions = {}
) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const lines: string[] = [];
  lines.push('================================================================================');
  lines.push('                      SOULGUIDE — PERSONAL SANCTUARY JOURNAL');
  lines.push('                        Local Export & Private Archive');
  lines.push('================================================================================');
  lines.push(`Exported On : ${dateFormatted} at ${timeFormatted}`);
  lines.push(`Total Items : ${entries.length} ${entries.length === 1 ? 'reflection' : 'reflections'}`);
  lines.push('Storage     : Local Client Storage');
  lines.push('================================================================================\n');

  if (entries.length === 0) {
    lines.push('No journal reflections recorded yet in this view.');
  }

  entries.forEach((entry, index) => {
    lines.push('--------------------------------------------------------------------------------');
    lines.push(`REFLECTION #${index + 1} — ${entry.date} at ${entry.time}`);
    if (options.includeMoods !== false && entry.mood) {
      const moodLabel = MOOD_LABELS[entry.mood] || entry.mood;
      lines.push(`Heart Mood : ${moodLabel}`);
    }
    lines.push('--------------------------------------------------------------------------------');
    lines.push('');
    lines.push(entry.content);
    lines.push('');

    // Scripture Attachment
    if (options.includeScriptures !== false && entry.verseAttachment) {
      lines.push('--- [ATTACHED SCRIPTURE] ---');
      lines.push(`Reference : ${entry.verseAttachment.reference}`);
      lines.push(`Verse     : "${entry.verseAttachment.text}"`);
      if (entry.verseAttachment.theme) {
        lines.push(`Theme     : ${entry.verseAttachment.theme}`);
      }
      lines.push('');
    }

    // AI Reflection
    const aiReflection = entry.aiReflection || (options.aiReflectionsMap && options.aiReflectionsMap[entry.id]);
    if (options.includeReflections !== false && aiReflection) {
      lines.push('--- [SOULGUIDE COMPASSIONATE REFLECTION] ---');
      lines.push(aiReflection);
      lines.push('');
    }

    lines.push('');
  });

  lines.push('================================================================================');
  lines.push('       End of SoulGuide Journal Archive • Stored Safely on Local Device');
  lines.push('================================================================================');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename);
}

/**
 * Generates and downloads a beautifully styled, formatted PDF (.pdf) file.
 */
export function exportJournalAsPdf(
  entries: JournalEntry[],
  filename = 'SoulGuide_Journal_Reflections.pdf',
  options: ExportOptions = {}
) {
  // A4 dimensions in points: width = 595.28, height = 841.89
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const now = new Date();
  const exportDateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 50) {
      doc.addPage();
      y = margin;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // Primary Title Area
      doc.setFillColor(118, 104, 216); // Brand Purple #7668D8
      doc.roundedRect(margin, y, contentWidth, 54, 8, 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SoulGuide -- Personal Sanctuary Journal', margin + 18, y + 24);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(238, 233, 251);
      doc.text(
        `Exported: ${exportDateStr}  |  ${entries.length} ${entries.length === 1 ? 'reflection' : 'reflections'}  |  Local Storage Archive`,
        margin + 18,
        y + 42
      );

      y += 70;
    } else {
      // Running top header on subsequent pages
      doc.setDrawColor(230, 225, 240);
      doc.setLineWidth(0.75);
      doc.line(margin, y, margin + contentWidth, y);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(140, 140, 160);
      doc.text('SoulGuide Sanctuary Journal -- Archive', margin, y - 6);
      doc.text(exportDateStr, margin + contentWidth - 60, y - 6);

      y += 18;
    }
  };

  // Draw initial header
  drawHeaderBanner(true);

  if (entries.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 130);
    doc.text('No journal reflections recorded yet in this selection.', margin, y + 20);
  }

  entries.forEach((entry, index) => {
    checkPageBreak(90);

    // Entry Card Border / Header
    const moodName = entry.mood ? (MOOD_LABELS[entry.mood] || entry.mood) : 'Peaceful';
    const dateLabel = `${entry.date} at ${entry.time}`;

    // Entry Title Row
    doc.setFillColor(248, 246, 252);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(23, 25, 54);
    doc.text(`Reflection #${index + 1} -- ${sanitizeForPdf(dateLabel)}`, margin + 10, y + 16);

    if (options.includeMoods !== false && entry.mood) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(118, 104, 216);
      const moodText = `Mood: ${moodName}`;
      const textWidth = doc.getTextWidth(moodText);
      doc.text(moodText, margin + contentWidth - textWidth - 10, y + 16);
    }

    y += 34;

    // Journal Entry Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40, 42, 60);

    const sanitizedContent = sanitizeForPdf(entry.content);
    const bodyLines = doc.splitTextToSize(sanitizedContent, contentWidth - 16);

    bodyLines.forEach((line: string) => {
      checkPageBreak(16);
      doc.text(line, margin + 8, y);
      y += 14;
    });

    y += 8;

    // Attached Scripture Card
    if (options.includeScriptures !== false && entry.verseAttachment) {
      const scriptureRef = sanitizeForPdf(entry.verseAttachment.reference);
      const scriptureText = sanitizeForPdf(`"${entry.verseAttachment.text}"`);
      const scriptureLines = doc.splitTextToSize(scriptureText, contentWidth - 36);

      const boxHeight = 22 + scriptureLines.length * 13 + 6;
      checkPageBreak(boxHeight + 10);

      doc.setFillColor(245, 243, 253);
      doc.setDrawColor(218, 210, 245);
      doc.roundedRect(margin + 6, y, contentWidth - 12, boxHeight, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 85, 200);
      doc.text(`Attached Scripture: ${scriptureRef}`, margin + 14, y + 15);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 95);

      let sy = y + 28;
      scriptureLines.forEach((sLine: string) => {
        doc.text(sLine, margin + 14, sy);
        sy += 13;
      });

      y += boxHeight + 10;
    }

    // AI Compassionate Reflection Card
    const aiReflection = entry.aiReflection || (options.aiReflectionsMap && options.aiReflectionsMap[entry.id]);
    if (options.includeReflections !== false && aiReflection) {
      const cleanReflection = sanitizeForPdf(aiReflection);
      const refLines = doc.splitTextToSize(cleanReflection, contentWidth - 36);
      const boxHeight = 22 + refLines.length * 13 + 6;
      checkPageBreak(boxHeight + 10);

      doc.setFillColor(250, 248, 255);
      doc.setDrawColor(225, 220, 245);
      doc.roundedRect(margin + 6, y, contentWidth - 12, boxHeight, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(118, 104, 216);
      doc.text('SoulGuide Reflection:', margin + 14, y + 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 75, 110);

      let ry = y + 28;
      refLines.forEach((rLine: string) => {
        doc.text(rLine, margin + 14, ry);
        ry += 13;
      });

      y += boxHeight + 10;
    }

    // Divider between entries
    checkPageBreak(25);
    doc.setDrawColor(238, 235, 245);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 18;
  });

  // Page Numbers on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 180);
    doc.text(
      `SoulGuide Sanctuary -- Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

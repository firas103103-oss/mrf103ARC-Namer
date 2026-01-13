import * as mammoth from 'mammoth';
import JSZip from 'jszip';
import { PublishingPackage, BookMetadata } from '../types';

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (file.name.endsWith('.docx')) {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (err) { reject(err); }
      } else {
        const decoder = new TextDecoder('utf-8');
        resolve(decoder.decode(arrayBuffer));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const createPublishingZip = async (pkg: PublishingPackage, meta: BookMetadata): Promise<Blob> => {
  const zip = new JSZip();
  const safeTitle = meta.title.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_').substring(0, 30);
  const folderName = `MrF_SeventhShadow_${safeTitle}`;
  const root = zip.folder(folderName);

  if (!root) throw new Error("Failed to create zip");

  // 1. Signature Letter (The Official Document)
  const date = new Date().toLocaleDateString();
  const signatureLetter = `
  THE SEVENTH SHADOW | MRF X OS ORGANIZATION
  ===========================================
  OFFICIAL COMPLETION CERTIFICATE
  
  REF ID: 7TH-${Date.now().toString().slice(-6)}
  DATE: ${date}
  
  TO: ${meta.userName}
  LOCATION: ${meta.userCountry}
  ROLE: ${meta.publisherName || 'Independent Author'}
  
  SUBJECT: DEPLOYMENT OF PUBLISHING ASSETS FOR "${meta.title.toUpperCase()}"

  Dear ${meta.userName},

  This document certifies that "The Seventh Shadow" AI Agent, operating under the authority of MrF X OS Organization, has successfully completed the analysis, enhancement, and packaging of your manuscript.

  The following assets have been generated using our proprietary Gemini 3 Pro architecture:

  [X] PRODUCTION MANUSCRIPT (.txt + .html)
      - Standardized Formatting
      - Stylistic Editing (${meta.style})
      - HTML Layout & Typography

  [X] INTELLIGENCE REPORTS
      - Deep Literary Analysis
      - Legal & Compliance Audit (${meta.targetRegion})
      - Editor's Strategic Notes

  [X] VISUAL & MARKETING SUITE
      - High-Fidelity Cover Art
      - Synopsis & Blurb

  We have processed approximately ${pkg.originalText.length} characters of data to ensure the highest quality output.

  We wish you absolute success in your publishing journey.

  Authorized Signature:
  
  The Seventh Shadow
  AI Autonomous Agent
  MrF X OS Organization
  -------------------------------------------
  Confidential & Proprietary.
  `;
  
  root.file("00_MrF_OFFICIAL_LETTER.txt", signatureLetter);

  // 2. The Dossier
  const reportFolder = root.folder("01_Intelligence_Reports");
  reportFolder?.file("Literary_Analysis.txt", pkg.analysisReport);
  reportFolder?.file("Legal_Compliance.txt", pkg.legalReport);
  reportFolder?.file("Strategic_Editor_Notes.txt", pkg.editorNotes);
  
  // 3. Marketing Assets
  const assetsFolder = root.folder("02_Marketing_&_Visuals");
  assetsFolder?.file("Synopsis.txt", pkg.extras.synopsis);
  assetsFolder?.file("Back_Cover_Blurb.txt", pkg.extras.suggestedBlurb);
  if (pkg.coverImageBase64) {
    assetsFolder?.file("Cover_Art_HighRes.jpg", pkg.coverImageBase64, { base64: true });
  }

  // 4. The Manuscript
  const htmlContent = createManuscriptHtml(pkg, meta);
  root.file(`03_${safeTitle}_Production_Master.html`, htmlContent);
  root.file(`03_${safeTitle}_Production_Master.txt`, pkg.editedText);

  return await zip.generateAsync({ type: "blob" });
};

const createManuscriptHtml = (pkg: PublishingPackage, meta: BookMetadata): string => {
  const isRTL = meta.language === 'ar';
  const paragraphs = pkg.editedText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
  const contentHtml = paragraphs
    .map(text => {
      const isChapter = 
        (text.length < 60 && (text.toLowerCase().startsWith('chapter') || text.startsWith('الفصل') || text.startsWith('الباب'))) ||
        (text.length < 30 && text === text.toUpperCase() && /^[A-Z0-9\s]+$/.test(text)) || 
        (text.length < 10 && !isNaN(Number(text))); 
      const tag = isChapter ? 'h2' : 'p';
      return `<${tag}>${escapeHtml(text)}</${tag}>`;
    })
    .join('\n');

  const coverHtml = pkg.coverImageBase64
    ? `<div class="cover"><img src="data:image/jpeg;base64,${pkg.coverImageBase64}" alt="Cover art" /></div>`
    : '';

  return `<!doctype html>
<html lang="${meta.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(meta.title)}</title>
    <style>
      body { font-family: ${isRTL ? '"Cairo", "Noto Naskh Arabic", serif' : '"Times New Roman", serif'}; line-height: 1.8; margin: 48px; color: #0f172a; }
      h1, h2 { text-align: ${isRTL ? 'right' : 'left'}; margin-top: 32px; }
      h1 { font-size: 2.2rem; margin-bottom: 12px; }
      h2 { font-size: 1.4rem; }
      .meta { text-align: center; margin-bottom: 32px; }
      .cover { text-align: center; margin-bottom: 40px; }
      .cover img { max-width: 60%; height: auto; border-radius: 8px; }
      p { text-align: ${isRTL ? 'right' : 'justify'}; margin: 0 0 18px; }
    </style>
  </head>
  <body>
    ${coverHtml}
    <div class="meta">
      <h1>${escapeHtml(meta.title)}</h1>
      <div>${escapeHtml(meta.author)}</div>
      <div>${escapeHtml(meta.publisherName || 'MrF Group Publishing')}</div>
      <div>${escapeHtml(meta.publishingYear || '2025')}</div>
    </div>
    ${contentHtml}
  </body>
</html>`;
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

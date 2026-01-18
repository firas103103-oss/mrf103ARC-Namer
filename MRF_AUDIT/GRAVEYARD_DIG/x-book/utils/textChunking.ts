/**
 * Text Chunking Utilities - Smart Chunking for Large Manuscripts
 * MrF X OS Organization - X-Book System
 */

export interface ChunkMetadata {
  index: number;
  totalChunks: number;
  startPosition: number;
  endPosition: number;
  overlapStart: string;  // آخر 500 حرف من الـ chunk السابق
  overlapEnd: string;    // أول 500 حرف من الـ chunk التالي
}

export interface SmartChunk {
  text: string;
  metadata: ChunkMetadata;
}

/**
 * التقسيم الذكي - يقسم النص عند حدود الفقرات مع overlap
 * @param text - النص الكامل
 * @param maxChunkSize - الحجم الأقصى للقطعة (افتراضي 75000 حرف)
 * @param overlapSize - حجم التداخل بين القطع (افتراضي 1000 حرف)
 */
export function chunkTextSmart(
  text: string,
  maxChunkSize: number = 75000,
  overlapSize: number = 1000
): SmartChunk[] {
  const chunks: SmartChunk[] = [];
  
  // إذا كان النص أصغر من الحد الأقصى، نرجعه كاملاً
  if (text.length <= maxChunkSize) {
    return [{
      text: text,
      metadata: {
        index: 0,
        totalChunks: 1,
        startPosition: 0,
        endPosition: text.length,
        overlapStart: '',
        overlapEnd: ''
      }
    }];
  }

  let position = 0;
  let previousOverlap = '';

  while (position < text.length) {
    const remainingLength = text.length - position;
    let chunkEnd = position + maxChunkSize;

    // إذا كان المتبقي أقل من الحد الأقصى + overlap، نأخذ كل شيء
    if (remainingLength <= maxChunkSize + overlapSize) {
      chunkEnd = text.length;
    } else {
      // البحث عن أقرب نهاية فقرة (سطرين جديدين)
      const searchStart = Math.max(position + maxChunkSize - 2000, position);
      const searchEnd = Math.min(position + maxChunkSize + 2000, text.length);
      const searchText = text.substring(searchStart, searchEnd);
      
      // البحث عن نهاية فقرة
      const paragraphBreaks = [
        searchText.lastIndexOf('\n\n'),
        searchText.lastIndexOf('\n \n'),
        searchText.lastIndexOf('.\n'),
        searchText.lastIndexOf('。\n'), // للنصوص اليابانية/صينية
        searchText.lastIndexOf('؟\n'), // للعربية
        searchText.lastIndexOf('!\n')
      ];

      const bestBreak = Math.max(...paragraphBreaks.filter(i => i > 0));
      
      if (bestBreak > 0) {
        chunkEnd = searchStart + bestBreak + 2; // +2 للسطرين الجديدين
      } else {
        // إذا لم نجد نهاية فقرة، نبحث عن نهاية جملة
        const sentenceBreaks = [
          searchText.lastIndexOf('. '),
          searchText.lastIndexOf('。 '),
          searchText.lastIndexOf('؟ '),
          searchText.lastIndexOf('! ')
        ];
        
        const bestSentence = Math.max(...sentenceBreaks.filter(i => i > 0));
        if (bestSentence > 0) {
          chunkEnd = searchStart + bestSentence + 2;
        }
        // وإلا نستخدم التقسيم الصارم
      }
    }

    const chunkText = text.substring(position, chunkEnd);
    const nextOverlap = chunkEnd < text.length 
      ? text.substring(chunkEnd, Math.min(chunkEnd + overlapSize, text.length))
      : '';

    chunks.push({
      text: chunkText,
      metadata: {
        index: chunks.length,
        totalChunks: 0, // سنحدثه لاحقاً
        startPosition: position,
        endPosition: chunkEnd,
        overlapStart: previousOverlap,
        overlapEnd: nextOverlap
      }
    });

    previousOverlap = chunkText.substring(Math.max(0, chunkText.length - overlapSize));
    position = chunkEnd;
  }

  // تحديث totalChunks لكل قطعة
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * دمج القطع المحررة بسلاسة - يتأكد من عدم وجود انقطاعات عند الحدود
 */
export function mergeEditedChunks(editedChunks: string[]): string {
  if (editedChunks.length === 0) return '';
  if (editedChunks.length === 1) return editedChunks[0];

  let merged = editedChunks[0];

  for (let i = 1; i < editedChunks.length; i++) {
    const currentChunk = editedChunks[i];
    
    // التحقق من التداخل والدمج بذكاء
    // نبحث عن أفضل نقطة دمج في آخر 500 حرف من merged وأول 500 حرف من current
    const overlapSize = 500;
    const mergedEnd = merged.substring(Math.max(0, merged.length - overlapSize));
    const currentStart = currentChunk.substring(0, Math.min(overlapSize, currentChunk.length));

    // البحث عن تطابق في التداخل
    let bestOverlap = 0;
    for (let j = Math.min(200, mergedEnd.length); j > 50; j--) {
      const snippet = mergedEnd.substring(mergedEnd.length - j);
      const index = currentStart.indexOf(snippet);
      if (index >= 0) {
        bestOverlap = j;
        merged = merged.substring(0, merged.length - bestOverlap) + currentChunk;
        break;
      }
    }

    // إذا لم نجد تداخل، ندمج مباشرة مع التأكد من وجود فراغ مناسب
    if (bestOverlap === 0) {
      // التحقق من أن آخر حرف في merged ليس سطر جديد وأول حرف في current ليس سطر جديد
      if (!merged.endsWith('\n') && !currentChunk.startsWith('\n')) {
        // إضافة سطر جديد إذا لزم الأمر
        if (!merged.endsWith(' ') && !currentChunk.startsWith(' ')) {
          merged += ' ';
        }
      }
      merged += currentChunk;
    }
  }

  return merged;
}

/**
 * التحقق من طول النص المحرر مقارنة بالأصلي
 * @returns { isValid, ratio, message }
 */
export function validateEditedLength(
  originalText: string,
  editedText: string,
  tolerancePercent: number = 10
): { isValid: boolean; ratio: number; message: string } {
  const originalLength = originalText.trim().split(/\s+/).length; // عدد الكلمات
  const editedLength = editedText.trim().split(/\s+/).length;
  
  const ratio = (editedLength / originalLength) * 100;
  const difference = Math.abs(100 - ratio);

  const isValid = difference <= tolerancePercent;

  let message = '';
  if (!isValid) {
    if (ratio < 100 - tolerancePercent) {
      message = `⚠️ النص المحرر أقصر من الأصل بنسبة ${difference.toFixed(1)}% (${originalLength} كلمة → ${editedLength} كلمة)`;
    } else {
      message = `⚠️ النص المحرر أطول من الأصل بنسبة ${difference.toFixed(1)}% (${originalLength} كلمة → ${editedLength} كلمة)`;
    }
  } else {
    message = `✓ طول النص مناسب (${originalLength} كلمة → ${editedLength} كلمة، نسبة: ${ratio.toFixed(1)}%)`;
  }

  return { isValid, ratio, message };
}

/**
 * حساب عدد الكلمات في النص
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * حساب النسبة المئوية للتقدم
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

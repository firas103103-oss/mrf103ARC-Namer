import { useState, useCallback } from 'react';
import { BookMetadata, AspectRatio, ProcessingStatus } from '../types';
import { 
  analyzeManuscriptScalable, 
  generateBookExtras, 
  generateCoverImage, 
  processBasedOnPrimaryGoal 
} from '../services/geminiService';
import { withErrorRecovery } from '../utils/errorRecovery';

export function useProcessingEngine() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startProcessing = useCallback(async (
    manuscript: string,
    metadata: BookMetadata,
    onProgress: (status: ProcessingStatus) => void
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Stage 1: Analysis
      setCurrentStage('analyzing');
      setProgress(10);
      onProgress({
        stage: 'analyzing',
        progress: 10,
        message: 'Running Literary & Legal Analysis...'
      });
      
      const analysis = await analyzeWithRetry(manuscript, metadata, onProgress);
      
      // Stage 2: Editing
      setCurrentStage('editing');
      setProgress(40);
      onProgress({
        stage: 'editing',
        progress: 40,
        message: 'Professional editing in progress...'
      });
      
      const edited = await editWithRetry(manuscript, metadata, onProgress);
      
      // Stage 3: Extras
      setCurrentStage('creating_package');
      setProgress(70);
      onProgress({
        stage: 'creating_package',
        progress: 70,
        message: 'Generating Marketing Extras...'
      });
      
      const extras = await generateExtrasWithRetry(manuscript, metadata);
      
      // Stage 4: Cover
      setCurrentStage('generating_cover');
      setProgress(90);
      onProgress({
        stage: 'generating_cover',
        progress: 90,
        message: 'Designing Cinematic Cover...'
      });
      
      const cover = await generateCoverWithRetry(metadata);
      
      setProgress(100);
      setCurrentStage('complete');
      
      return { analysis, edited, extras, cover };
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    progress,
    currentStage,
    error,
    startProcessing
  };
}

// Retry helpers with Exponential Backoff
async function analyzeWithRetry(
  text: string, 
  meta: BookMetadata, 
  onProgress: (status: ProcessingStatus) => void,
  maxRetries = 3
) {
  return withErrorRecovery(
    () => analyzeManuscriptScalable(text, meta, onProgress),
    {
      maxRetries,
      onRetry: (attempt, error) => {
        console.warn(`⚠️ Analysis retry ${attempt}/${maxRetries}:`, error.message);
      },
      fallback: () => ({
        analysis: 'Analysis unavailable (using fallback)',
        legalReport: 'Manual review required',
        editorNotes: 'Processing failed, please retry'
      })
    }
  );
}

async function editWithRetry(
  text: string, 
  meta: BookMetadata,
  onProgress: (status: ProcessingStatus) => void,
  maxRetries = 3
) {
  return withErrorRecovery(
    () => processBasedOnPrimaryGoal(meta.primaryGoal!, text, meta, onProgress),
    {
      maxRetries,
      onRetry: (attempt, error) => {
        console.warn(`⚠️ Editing retry ${attempt}/${maxRetries}:`, error.message);
      },
      fallback: () => text // Return original text as fallback
    }
  );
}

async function generateExtrasWithRetry(text: string, meta: BookMetadata, maxRetries = 3) {
  return withErrorRecovery(
    () => generateBookExtras(text, meta),
    {
      maxRetries,
      onRetry: (attempt, error) => {
        console.warn(`⚠️ Extras generation retry ${attempt}/${maxRetries}:`, error.message);
      },
      fallback: () => ({
        dedication: '',
        aboutAuthor: '',
        synopsis: '',
        suggestedBlurb: ''
      })
    }
  );
}

async function generateCoverWithRetry(meta: BookMetadata, maxRetries = 3) {
  return withErrorRecovery(
    () => generateCoverImage(
      meta.coverDescription || '',
      meta.title || '',
      meta.coverAspectRatio as AspectRatio
    ),
    {
      maxRetries,
      onRetry: (attempt, error) => {
        console.warn(`⚠️ Cover generation retry ${attempt}/${maxRetries}:`, error.message);
      },
      fallback: () => '' // Return empty string as fallback
    }
  );
}

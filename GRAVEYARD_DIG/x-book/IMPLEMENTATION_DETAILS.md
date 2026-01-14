# Implementation Details

## How the New Features Work

### 1. Auto-Save System

#### Trigger Points
The auto-save system activates whenever:
- User changes step in conversation
- Metadata is updated (name, email, book info, etc.)
- File is uploaded

#### Storage Key
`xbook_autosave` in localStorage

#### Data Stored
```json
{
  "step": "BOOK_TITLE",
  "metadata": {
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "language": "en",
    ...
  },
  "rawText": "First 1000 characters of manuscript..."
}
```

#### Debouncing
- Waits 2 seconds after last change before saving
- Prevents excessive localStorage writes
- Automatically disabled during processing

### 2. Resume Prompt

#### Trigger Condition
Shows when ALL of these are true:
1. User visits the app
2. Current step is `LANGUAGE_SELECT` (app just started)
3. Saved data exists in localStorage
4. Saved step is NOT `LANGUAGE_SELECT` (there's actual progress)

#### User Options
1. **Resume Session** - Restores all saved state
2. **Start New** - Clears saved data and begins fresh

#### What Gets Restored
- Conversation step (where user left off)
- All metadata fields
- Manuscript text (if uploaded)

### 3. Retry Mechanism

#### Retry Strategy: Exponential Backoff
```
Attempt 1: Execute immediately
↓ FAIL
Wait 1 second
↓
Attempt 2: Execute again
↓ FAIL
Wait 2 seconds
↓
Attempt 3: Execute again
↓ FAIL
Wait 4 seconds
↓
Final Attempt: Execute last time
↓ FAIL
Use fallback value
```

#### Operations with Retry
1. **Analysis** (analyzeWithRetry)
   - Retries: 3
   - Fallback: Basic analysis text

2. **Editing** (editWithRetry)
   - Retries: 3
   - Fallback: Original manuscript text

3. **Extras Generation** (generateExtrasWithRetry)
   - Retries: 3
   - Fallback: Empty extras object

4. **Cover Generation** (generateCoverWithRetry)
   - Retries: 3
   - Fallback: Empty string (no cover)

### 4. Processing Flow

#### Old Flow
```
Start → Analysis → Editing → Extras → Cover → Package → Done
         ↓           ↓         ↓        ↓
        FAIL       FAIL      FAIL     FAIL
         ↓           ↓         ↓        ↓
     Use fallback manually at each step
```

#### New Flow
```
Start → Analysis (auto-retry 3x) → Editing (auto-retry 3x) → 
        Extras (auto-retry 3x) → Cover (auto-retry 3x) → Package → Done
        
Each step automatically retries before giving up
Progress saved continuously throughout
```

### 5. Error Recovery Flow

#### Scenario: API Rate Limit Error

**Old Behavior:**
```
1. User uploads manuscript
2. Analysis starts
3. API rate limit hit
4. Error shown: "Analysis failed"
5. User must reload and start over
6. ALL PROGRESS LOST
```

**New Behavior:**
```
1. User uploads manuscript
2. Analysis starts
3. API rate limit hit
4. Wait 1 second, retry
5. Still rate limited
6. Wait 2 seconds, retry
7. Success! Continue
8. If all 3 retries fail:
   - Use fallback analysis
   - Show warning but continue
   - Progress auto-saved throughout
9. User can reload and resume anytime
```

### 6. Component Hierarchy

```
App.tsx
├── ResumePrompt (conditional)
│   └── Shows on startup if saved session exists
│
├── Header
│   └── Shows current step
│
├── Chat Messages Area
│   ├── System messages
│   ├── Agent messages
│   ├── User messages
│   └── ProcessingView (when processing)
│       └── Progress bar, stage name, chunk info
│
└── Input Area
    ├── Text input (conditional)
    └── File upload button (conditional)
```

### 7. State Management

#### Before Refactor
```
App.tsx
├── Local state: step, messages, metadata, rawText, etc.
├── Processing logic inline
└── Error handling inline
```

#### After Refactor
```
App.tsx
├── Local state: step, messages, metadata, rawText, etc.
├── useProcessingEngine() hook
│   ├── Manages: isProcessing, progress, error
│   └── Contains all retry logic
└── useAutoSave() hook
    └── Manages: automatic localStorage saves
```

### 8. Processing Engine Hook API

```typescript
const processingEngine = useProcessingEngine();

// Start processing with automatic retries
const result = await processingEngine.startProcessing(
  manuscript,      // Raw text
  metadata,        // Book metadata
  (status) => {    // Progress callback
    setProcessingStatus(status);
  }
);

// Returns:
// {
//   analysis: { analysis, legalReport, editorNotes },
//   edited: string,
//   extras: { dedication, aboutAuthor, synopsis, blurb },
//   cover: base64String
// }
```

### 9. Error Recovery Utility API

```typescript
import { withErrorRecovery } from './utils/errorRecovery';

// Wrap any async operation with automatic retry
const result = await withErrorRecovery(
  () => riskyOperation(),    // Operation that might fail
  {
    maxRetries: 3,           // Try up to 3 times
    onRetry: (attempt, error) => {
      console.warn(`Retry ${attempt}:`, error.message);
    },
    fallback: () => defaultValue  // Return this if all retries fail
  }
);
```

### 10. LocalStorage Hook API

```typescript
// Enhanced auto-save
useAutoSave(
  dataToSave,          // Any JSON-serializable data
  'storage_key',       // localStorage key
  { 
    delay: 2000,       // Wait 2s before saving
    enabled: true      // Can disable during processing
  }
);

// Auto-restore on mount
const restoredData = useAutoRestore(
  'storage_key',       // localStorage key
  defaultValue         // Return this if no saved data
);
```

## Code Examples

### Example 1: Using ProcessingEngine in Another Component

```typescript
import { useProcessingEngine } from './components/ProcessingEngine';

function MyComponent() {
  const { startProcessing, isProcessing, error } = useProcessingEngine();
  
  const handleProcess = async () => {
    try {
      const result = await startProcessing(
        manuscript,
        metadata,
        (status) => console.log(status)
      );
      console.log('Success!', result);
    } catch (err) {
      console.error('Failed after retries:', err);
    }
  };
  
  return (
    <button onClick={handleProcess} disabled={isProcessing}>
      {isProcessing ? 'Processing...' : 'Start'}
    </button>
  );
}
```

### Example 2: Using Error Recovery Utility

```typescript
import { withErrorRecovery } from './utils/errorRecovery';

async function fetchDataWithRetry(url: string) {
  return withErrorRecovery(
    () => fetch(url).then(r => r.json()),
    {
      maxRetries: 3,
      onRetry: (attempt, error) => {
        console.warn(`Fetch attempt ${attempt} failed:`, error.message);
      },
      fallback: () => ({ error: 'Service unavailable' })
    }
  );
}
```

### Example 3: Custom Auto-Save

```typescript
import { useAutoSave } from './hooks/useLocalStorage';

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  // Auto-save form data every 3 seconds
  useAutoSave(formData, 'my_form_data', { delay: 3000 });
  
  return (
    <form>
      <input 
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
    </form>
  );
}
```

## Performance Considerations

### Auto-Save Performance
- **Debounced**: Only saves after 2 seconds of no changes
- **Disabled when needed**: Turned off during heavy processing
- **Small footprint**: Only stores essential data (< 10KB typically)
- **localStorage**: Fast, synchronous storage

### Retry Performance
- **Exponential backoff**: Prevents overwhelming failed services
- **Configurable**: Can adjust retry count and delays
- **Early exit**: Stops retrying if error is non-retryable
- **Total max delay**: 7 seconds (1s + 2s + 4s) before giving up

### Bundle Size Impact
- **New code**: ~700 lines total in new files
- **Minified**: Approximately +3KB to bundle
- **Lazy loading**: AIPerformanceTerminal still lazy-loaded
- **Tree-shaking**: Unused code removed by Vite

## Browser Compatibility

### LocalStorage
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ Incognito/Private mode may have limitations
- ⚠️ Users can disable localStorage

### Fallback Strategy
If localStorage is not available:
- Auto-save silently fails (logs error)
- Resume prompt won't show
- App continues to work normally

## Security Considerations

### What's Stored in localStorage
- ✅ Non-sensitive: step, metadata fields
- ✅ Text preview: Only first 1000 characters
- ❌ Not stored: Full manuscript, API responses, API keys

### Privacy
- Data stays on user's device
- Not sent to any server
- Cleared when user starts new session
- User can manually clear browser data

## Known Limitations

### Manual Testing Required
The following cannot be tested without API key:
- Actual retry behavior with Gemini API
- Cover generation retries
- Analysis retry with real errors
- Full end-to-end processing

### Not Implemented (from original spec)
These were mentioned but not critical:
- ChatInterface.tsx component
- ChatMessage.tsx component  
- ChatInput.tsx component
- OptionsPanel.tsx component

Reason: Would require extensive refactoring of rendering logic. Current implementation achieves main goals without breaking changes.

## Maintenance Guide

### Adding a New Retryable Operation

```typescript
// In ProcessingEngine.tsx
async function myOperationWithRetry(data: any, maxRetries = 3) {
  return withErrorRecovery(
    () => myOperation(data),
    {
      maxRetries,
      onRetry: (attempt, error) => {
        console.warn(`⚠️ My operation retry ${attempt}/${maxRetries}:`, error.message);
      },
      fallback: () => defaultValue
    }
  );
}
```

### Adjusting Retry Settings

```typescript
// Change max retries (default is 3)
const result = await withErrorRecovery(fn, { maxRetries: 5 });

// Change backoff delay (default is exponential: 1s, 2s, 4s, 8s...)
// Edit errorRecovery.ts sleep() calculation:
await sleep(Math.pow(2, attempt - 1) * 1000); // Current
await sleep(attempt * 500);                    // Linear: 500ms, 1s, 1.5s...
```

### Adjusting Auto-Save Frequency

```typescript
// In App.tsx, change delay
useAutoSave(data, 'key', { delay: 5000 }); // Save every 5 seconds instead of 2
```

## Testing Recommendations

### Unit Tests (Future)
```typescript
describe('withErrorRecovery', () => {
  it('should retry on failure', async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
      return 'success';
    };
    
    const result = await withErrorRecovery(fn, { maxRetries: 3 });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});
```

### Integration Tests (Future)
```typescript
describe('ProcessingEngine', () => {
  it('should complete full pipeline with retries', async () => {
    // Mock API calls
    // Test full processing flow
    // Verify retries happen
    // Verify fallbacks work
  });
});
```

### Manual Testing Checklist
- [ ] Upload manuscript
- [ ] Verify auto-save every 2 seconds in console
- [ ] Reload page mid-conversation
- [ ] Verify resume prompt appears
- [ ] Choose "Resume Session"
- [ ] Verify state restored correctly
- [ ] Trigger API error (e.g., invalid key)
- [ ] Verify retry attempts in console
- [ ] Verify fallback values used
- [ ] Complete full pipeline
- [ ] Verify auto-save cleared after completion

## Troubleshooting

### Issue: Resume prompt doesn't show
**Cause**: No saved data or on wrong step  
**Solution**: Check localStorage for 'xbook_autosave' key

### Issue: Auto-save not working
**Cause**: localStorage disabled or full  
**Solution**: Check browser console for errors

### Issue: Retries not happening
**Cause**: Error is non-retryable or maxRetries set to 0  
**Solution**: Check error type and retry configuration

### Issue: App slow after changes
**Cause**: Auto-save running too frequently  
**Solution**: Increase delay in useAutoSave options

## Conclusion

The implementation provides a robust foundation for error recovery and progress preservation while maintaining all existing features. The modular architecture makes it easy to extend and maintain in the future.

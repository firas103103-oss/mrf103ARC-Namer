# Changelog

## [v2.0.0] - The Awakening - 2025-05-21

### 🚀 Major Features
*   **Conversational Interface:** Completely removed the static dashboard `App.tsx` and replaced it with a Chat Terminal UI.
*   **Verification Loop:** Implemented `validateUserInput` service to sanity-check user entries before acceptance.
*   **Smart Chunking:** Added logic to split files >20k tokens into manageable chunks for sequential processing.
*   **MrF Signature:** Added dynamic generation of the `00_MrF_OFFICIAL_LETTER.txt` in the final ZIP package.

### 🎨 UI/UX Improvements
*   **Dark Terminal Theme:** New color palette (Slate 950 / Gold 500) to match the "Shadow Agent" persona.
*   **Thinking Indicators:** Added "Activity" pulses when the AI is processing large data streams.
*   **Language Support:** Full RTL support for Arabic interface with `Cairo` font integration.

### 🔧 Technical Updates
*   Upgraded to `React 19`.
*   Refactored `geminiService.ts` to support `gemini-3-pro` and `flash-lite` distinct roles.
*   Integrated `mammoth` and `docx` libraries for professional document handling.

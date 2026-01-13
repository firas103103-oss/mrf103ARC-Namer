
import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { UserIcon, BotIcon } from './icons';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

// Helper function to safely parse a limited subset of Markdown to HTML
const safeMarkdownToHTML = (markdown: string) => {
    // 1. Escape HTML special characters to prevent XSS
    const escapeHTML = (str: string) =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    let html = escapeHTML(markdown);

    // 2. Process fenced code blocks (e.g., ```js...```)
    // We use a placeholder to avoid processing markdown inside code blocks
    const codeBlocks: string[] = [];
    html = html.replace(/```(\w*)\n([\s\S]+?)```/g, (match, lang, code) => {
        const unescapedCode = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
        const escapedAndHighlightedCode = escapeHTML(unescapedCode);
        codeBlocks.push(`<pre><code class="language-${lang || ''}">${escapedAndHighlightedCode}</code></pre>`);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // 3. Process other markdown elements
    // Bold (e.g., **bold**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (e.g., *italic*)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code (e.g., `code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Newlines to <br>
    html = html.replace(/\n/g, '<br />');

    // 4. Restore code blocks
    html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => codeBlocks[parseInt(index, 10)]);

    return html;
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isModel = message.role === 'model';

  const LoadingIndicator = () => (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
    </div>
  );

  return (
    <div className={`flex items-start gap-4 ${!isModel && 'justify-end'}`}>
      {isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
          <BotIcon className="w-5 h-5 text-cyan-400" />
        </div>
      )}
      <div
        className={`max-w-xl rounded-xl px-5 py-3 ${
          isModel ? 'bg-gray-700 text-gray-200 rounded-tl-none' : 'bg-cyan-600 text-white rounded-br-none'
        }`}
      >
        {isLoading ? <LoadingIndicator /> : (
          <div
            className="prose prose-invert prose-p:my-0 prose-pre:my-2 prose-pre:bg-gray-900/50 prose-pre:p-3 prose-pre:rounded-md"
            dangerouslySetInnerHTML={{
              __html: safeMarkdownToHTML(message.parts[0].text),
            }}
          />
        )}
      </div>
      {!isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

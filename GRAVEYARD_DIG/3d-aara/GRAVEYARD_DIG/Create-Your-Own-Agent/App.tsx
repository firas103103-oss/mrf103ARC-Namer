import React, { useState, useCallback, useEffect } from 'react';
import { Gem, ChatMessage as ChatMessageType } from './types';
import { GEMS } from './constants';
import GemSelector from './components/GemSelector';
import ChatWindow from './components/ChatWindow';
import { getChatResponse } from './services/geminiService';

function App() {
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gems, setGems] = useState<Gem[]>(GEMS);

  useEffect(() => {
    try {
      const customGemsJson = localStorage.getItem('customGems');
      if (customGemsJson) {
        const customGems = JSON.parse(customGemsJson);
        setGems([...GEMS, ...customGems]);
      }
    } catch (error) {
      console.error("Failed to load custom gems from localStorage", error);
    }
  }, []);

  const handleCreateGem = (newGem: Gem) => {
    const updatedGems = [...gems, newGem];
    setGems(updatedGems);
    try {
        const customGems = updatedGems.filter(gem => !GEMS.some(g => g.id === gem.id));
        localStorage.setItem('customGems', JSON.stringify(customGems));
    } catch (error) {
        console.error("Failed to save custom gems to localStorage", error);
    }
  };

  const handleImportGems = (importedGems: Gem[]) => {
    const existingIds = new Set(gems.map(g => g.id));
    const newGems = importedGems.filter(g => !existingIds.has(g.id));

    if (newGems.length === 0) {
      alert("No new agents to import. All agents in the file already exist.");
      return;
    }

    const updatedGems = [...gems, ...newGems];
    setGems(updatedGems);
    try {
      const customGems = updatedGems.filter(gem => !GEMS.some(g => g.id === gem.id));
      localStorage.setItem('customGems', JSON.stringify(customGems));
      alert(`Successfully imported ${newGems.length} new agents!`);
    } catch (error) {
      console.error("Failed to save imported gems to localStorage", error);
      alert("An error occurred while saving the imported agents.");
    }
  };


  const handleSelectGem = (gem: Gem) => {
    setSelectedGem(gem);
    setChatHistory([]);
  };

  const handleGoBack = () => {
    setSelectedGem(null);
    setChatHistory([]);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedGem) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      parts: [{ text: message }],
    };

    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setIsLoading(true);

    try {
      const response = await getChatResponse(newChatHistory, selectedGem.systemInstruction);
      const modelMessage: ChatMessageType = {
        role: 'model',
        parts: [{ text: response }],
      };
      setChatHistory(prevHistory => [...prevHistory, modelMessage]);
    } catch (error) {
      console.error("Failed to get response from Gemini:", error);
      const errorMessage: ChatMessageType = {
        role: 'model',
        parts: [{ text: "Sorry, I encountered an error. Please try again." }],
      };
      setChatHistory(prevHistory => [...prevHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory, selectedGem]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center">
      <main className="w-full max-w-4xl flex-grow flex flex-col p-4 md:p-6">
        {selectedGem ? (
          <ChatWindow
            gem={selectedGem}
            chatHistory={chatHistory}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onGoBack={handleGoBack}
          />
        ) : (
          <GemSelector 
            gems={gems} 
            onSelectGem={handleSelectGem} 
            onCreateGem={handleCreateGem}
            onImportGems={handleImportGems}
          />
        )}
      </main>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import type { Gem } from '../types';
import { BotIcon, iconMap, iconNames, PlusIcon, UploadIcon } from './icons';

interface CreateGemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGem: (gem: Gem) => void;
}

const CreateGemModal: React.FC<CreateGemModalProps> = ({ isOpen, onClose, onCreateGem }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [systemInstruction, setSystemInstruction] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = () => {
        if (!name || !description || !systemInstruction || !selectedIcon) return;
        const newGem: Gem = {
            id: `custom_${Date.now()}`,
            name,
            description,
            systemInstruction,
            icon: selectedIcon,
        };
        onCreateGem(newGem);
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setSystemInstruction('');
        setSelectedIcon(iconNames[0]);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 space-y-6 transform animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-100">Create a New Agent</h2>
                
                <div className="space-y-4">
                    <input type="text" placeholder="Agent Name (e.g., 'Python Expert')" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <textarea placeholder="Description (e.g., 'Helps with writing advanced Python code.')" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <textarea placeholder="System Instruction (e.g., 'You are an expert Python programmer specializing in data science...')" value={systemInstruction} onChange={e => setSystemInstruction(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-3">Choose an Icon</h3>
                    <div className="grid grid-cols-6 md:grid-cols-8 gap-3">
                        {iconNames.map(iconName => {
                            const IconComponent = iconMap[iconName];
                            return (
                                <button key={iconName} onClick={() => setSelectedIcon(iconName)} className={`flex justify-center items-center p-3 rounded-lg border-2 transition-colors ${selectedIcon === iconName ? 'bg-cyan-500/20 border-cyan-400' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                                    <IconComponent className="w-6 h-6 text-gray-200" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={!name || !description || !systemInstruction} className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Create Agent</button>
                </div>
            </div>
        </div>
    );
};


interface GemSelectorProps {
  gems: Gem[];
  onSelectGem: (gem: Gem) => void;
  onCreateGem: (gem: Gem) => void;
  onImportGems: (gems: Gem[]) => void;
}

const GemSelector: React.FC<GemSelectorProps> = ({ gems, onSelectGem, onCreateGem, onImportGems }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            if (typeof content !== 'string') {
                throw new Error("File content is not a string.");
            }
            const data = JSON.parse(content);
            
            // Basic validation
            if (!Array.isArray(data)) {
                throw new Error("JSON is not an array.");
            }
            const isValid = data.every(item => 
                typeof item.id === 'string' &&
                typeof item.name === 'string' &&
                typeof item.description === 'string' &&
                typeof item.systemInstruction === 'string' &&
                typeof item.icon === 'string' && iconNames.includes(item.icon)
            );

            if (!isValid) {
                throw new Error("One or more items in the JSON array do not have the required properties or have an invalid icon name.");
            }
            onImportGems(data);

        } catch (error) {
            console.error("Failed to parse or validate JSON file:", error);
            alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Reset file input to allow importing the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <CreateGemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateGem={onCreateGem} />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleFileImport}
        />
        <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-4 mb-4">
                 <BotIcon className="w-12 h-12 text-cyan-400" />
                 <h1 className="text-4xl md:text-5xl font-bold text-gray-100 tracking-tight">Gemini Agent Chat</h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl">Select an agent to begin your conversation. Each agent is specialized for different tasks.</p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {gems.map((gem) => {
            const IconComponent = iconMap[gem.icon] || BotIcon;
            return (
              <button
                key={gem.id}
                onClick={() => onSelectGem(gem)}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-left hover:bg-gray-700 hover:border-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-900 p-3 rounded-lg">
                    <IconComponent className="w-10 h-10 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100">{gem.name}</h2>
                    <p className="text-gray-400 mt-1">{gem.description}</p>
                  </div>
                </div>
              </button>
            )
        })}
         <button
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-left text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
          >
            <PlusIcon className="w-10 h-10" />
            <h2 className="text-xl font-semibold">Create Your Own Agent</h2>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-left text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
          >
            <UploadIcon className="w-10 h-10" />
            <h2 className="text-xl font-semibold">Import from File</h2>
          </button>
      </div>
    </div>
  );
};

export default GemSelector;
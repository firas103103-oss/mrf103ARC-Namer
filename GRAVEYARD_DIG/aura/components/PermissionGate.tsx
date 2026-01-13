
import React from 'react';
import { Camera, Mic } from 'lucide-react';

interface PermissionGateProps {
  onRequest: () => void;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ onRequest }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-300">Welcome to Aura</h1>
        <p className="text-lg mb-6 text-gray-300">
          This experience uses your camera and microphone to overlay a hidden, sound-reactive world onto your own.
        </p>
        <div className="flex justify-center space-x-8 mb-8 text-purple-400">
            <div className="flex flex-col items-center">
                <Camera size={48} />
                <span className="mt-2">Camera Access</span>
            </div>
            <div className="flex flex-col items-center">
                <Mic size={48} />
                <span className="mt-2">Microphone Access</span>
            </div>
        </div>
        <button
          onClick={onRequest}
          className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
        >
          Reveal the Hidden World
        </button>
      </div>
    </div>
  );
};

export default PermissionGate;

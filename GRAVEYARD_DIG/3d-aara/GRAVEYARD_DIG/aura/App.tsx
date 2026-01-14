
import React, { useState, useRef, useCallback } from 'react';
import PermissionGate from './components/PermissionGate';
import ARView from './components/ARView';
import VirtualAssistant from './components/VirtualAssistant';
import { Camera, MicOff } from 'lucide-react';

const App: React.FC = () => {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      });
      setMediaStream(stream);
      setPermissionsGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera and microphone access was denied. Please enable them in your browser settings to continue.");
        } else {
          setError(`An error occurred: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred while trying to access media devices.");
      }
      setPermissionsGranted(false);
    }
  }, []);
  
  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-red-900/50 text-white p-8 text-center">
            <MicOff size={64} className="mb-4 text-red-300"/>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-lg">{error}</p>
        </div>
      );
    }

    if (!permissionsGranted) {
      return <PermissionGate onRequest={requestPermissions} />;
    }

    if (mediaStream) {
      return (
        <div className="relative w-full h-screen overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-0 left-0 w-full h-full object-cover"
            ></video>
            <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
            <ARView mediaStream={mediaStream} />
            <div className="absolute top-0 left-0 w-full h-full p-4 md:p-6 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-center w-full">
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">AURA</h1>
                    <button 
                        onClick={() => setIsAssistantOpen(!isAssistantOpen)}
                        className="bg-purple-600/70 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-500 transition-all pointer-events-auto"
                    >
                        {isAssistantOpen ? 'Close Guide' : 'Ask Guide'}
                    </button>
                </div>
            </div>
            <VirtualAssistant isOpen={isAssistantOpen} />
        </div>
      );
    }

    return null;
  };

  return (
    <main className="w-screen h-screen bg-black text-gray-100">
      {renderContent()}
    </main>
  );
};

export default App;

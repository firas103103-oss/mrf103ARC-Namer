
import React from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import VirtualCharacter from './VirtualCharacter';

interface ARViewProps {
  mediaStream: MediaStream;
}

const ARView: React.FC<ARViewProps> = ({ mediaStream }) => {
  const volume = useAudioAnalyzer(mediaStream);

  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
      <VirtualCharacter volume={volume} />
    </div>
  );
};

export default ARView;

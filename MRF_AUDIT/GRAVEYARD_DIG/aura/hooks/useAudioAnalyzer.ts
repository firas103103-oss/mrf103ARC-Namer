
import { useState, useEffect, useRef } from 'react';

export const useAudioAnalyzer = (stream: MediaStream | null): number => {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    if (stream) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const updateVolume = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArrayRef.current[i];
          }
          const avg = sum / bufferLength;
          // Normalize the volume to a 0-1 range for easier use in animations
          setVolume(avg / 128); // 128 is half of the max value of a byte (256)
        }
        animationFrameId.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();

    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream]);

  return volume;
};

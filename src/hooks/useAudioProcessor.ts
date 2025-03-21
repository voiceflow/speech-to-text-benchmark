import { useRef, useCallback, useEffect } from "react";
import { setupAudioProcessing, cleanupAudio } from "../utils/audio";

export function useAudioProcessor(onAudioData: (data: string) => void) {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Start audio processing
  const startProcessing = useCallback(async () => {
    try {
      const onAudioProcess = (pcm16Buffer: Int16Array) => {
        // Convert to base64 and send
        const blob = new Blob([pcm16Buffer], {
          type: "application/octet-binary",
        });

        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          const base64data = fileReader.result?.toString().split(",")[1];
          if (base64data) {
            onAudioData(base64data);
          }
        };
        fileReader.readAsDataURL(blob);
      };

      const { mediaStream, audioContext, processor } =
        await setupAudioProcessing(onAudioProcess);

      mediaStreamRef.current = mediaStream;
      audioContextRef.current = audioContext;
      processorRef.current = processor;

      return true;
    } catch (err) {
      console.error("Error starting audio processing:", err);
      return false;
    }
  }, [onAudioData]);

  // Stop audio processing
  const stopProcessing = useCallback(() => {
    cleanupAudio(
      mediaStreamRef.current,
      audioContextRef.current,
      processorRef.current
    );

    mediaStreamRef.current = null;
    audioContextRef.current = null;
    processorRef.current = null;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopProcessing();
    };
  }, [stopProcessing]);

  return {
    isProcessing: !!mediaStreamRef.current,
    startProcessing,
    stopProcessing,
  };
}

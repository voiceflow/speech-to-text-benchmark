// Convert Float32Array to Int16Array for PCM
export function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let sample = float32Array[i];
    sample = Math.max(-1, Math.min(1, sample));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    int16Array[i] = sample;
  }
  return int16Array;
}

// Create audio context and processor
export async function setupAudioProcessing(
  onAudioProcess: (audioData: Int16Array) => void
): Promise<{
  mediaStream: MediaStream;
  audioContext: AudioContext;
  processor: ScriptProcessorNode;
}> {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(mediaStream);

  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = (audioEvent) => {
    const inputData = audioEvent.inputBuffer.getChannelData(0);
    const pcm16Buffer = floatTo16BitPCM(inputData);
    onAudioProcess(pcm16Buffer);
  };

  return { mediaStream, audioContext, processor };
}

// Clean up audio resources
export function cleanupAudio(
  mediaStream?: MediaStream | null,
  audioContext?: AudioContext | null,
  processor?: ScriptProcessorNode | null
): void {
  if (processor) {
    processor.disconnect();
  }

  if (audioContext) {
    audioContext.close();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }
}

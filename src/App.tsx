import { useState, useCallback } from "react";
import "./App.css";
import TranscriptionColumn from "./components/TranscriptionColumn";
import AudioControls from "./components/AudioControls";
import { useWebSocketManager } from "./hooks/useWebSocketManager";
import { useAudioProcessor } from "./hooks/useAudioProcessor";
import { TRANSCRIPTION_MODELS } from "./config/models";

const WS_PROXY_URL = "ws://localhost:3001";

function App() {
  // State for recording status
  const [isRecording, setIsRecording] = useState(false);

  // Initialize WebSocket manager
  const { connect, disconnect, sendData, subscribe } =
    useWebSocketManager(WS_PROXY_URL);

  // Handle audio data
  const handleAudioData = useCallback(
    (base64data: string) => {
      const audioMsg = {
        type: "input_audio_buffer.append",
        audio: base64data,
      };
      sendData(audioMsg);
    },
    [sendData]
  );

  // Initialize audio processor
  const { startProcessing, stopProcessing } =
    useAudioProcessor(handleAudioData);

  // Start recording and transcription
  const startRecording = useCallback(async () => {
    // Connect to WebSocket
    connect();

    // Start audio processing
    const success = await startProcessing();

    if (success) {
      setIsRecording(true);
    } else {
      disconnect();
      alert("Error accessing microphone. Please check permissions.");
    }
  }, [connect, startProcessing, disconnect]);

  // Stop recording and clean up
  const stopRecording = useCallback(() => {
    stopProcessing();
    disconnect();
    setIsRecording(false);
  }, [stopProcessing, disconnect]);

  return (
    <div className="App">
      <header>
        <h1>Realtime Transcription Demo</h1>
        <p>linear16 16kHz mono, english</p>
      </header>

      <AudioControls
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      <div className="transcription-container">
        {TRANSCRIPTION_MODELS.map((model) => (
          <TranscriptionColumn
            key={model.id}
            title={model.title}
            modelId={model.id}
            onSubscribe={subscribe}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

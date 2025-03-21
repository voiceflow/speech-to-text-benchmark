import React from "react";

interface AudioControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <div className="controls">
      <button onClick={onStartRecording} disabled={isRecording}>
        Start Transcription
      </button>
      <button onClick={onStopRecording} disabled={!isRecording}>
        Stop Transcription
      </button>
    </div>
  );
};

export default AudioControls;

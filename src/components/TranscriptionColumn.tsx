import React, { useState, useEffect } from "react";
import { Message, TranscriptionMessage } from "../types";

interface TranscriptionColumnProps {
  title: string;
  modelId: string;
  onSubscribe: (callback: (message: Message) => void) => () => void;
}

const TranscriptionColumn: React.FC<TranscriptionColumnProps> = ({
  title,
  modelId,
  onSubscribe,
}) => {
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");

  // Subscribe to messages
  useEffect(() => {
    // Handle different message types
    const handleMessage = (message: Message) => {
      // Handle system messages
      if (message.type === "clear") {
        setInterimText("");
        setFinalText("");
        return;
      }

      // Handle transcription messages
      const transcriptionMessage = message as TranscriptionMessage;

      // Only process messages for this model
      if (transcriptionMessage.platform !== modelId) return;

      if (transcriptionMessage.type === "delta") {
        setInterimText((prev) => prev + transcriptionMessage.transcript);
      } else if (transcriptionMessage.type === "interim") {
        setInterimText(transcriptionMessage.transcript);
      } else if (transcriptionMessage.type === "transcript") {
        setInterimText("");
        setFinalText((prev) => transcriptionMessage.transcript + "\n" + prev);
      }
    };

    // Subscribe to messages
    const unsubscribe = onSubscribe(handleMessage);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [modelId, onSubscribe]);

  return (
    <div className="transcription-column">
      <h2>{title}</h2>
      <div className="interim">{interimText}</div>
      <div className="final">{finalText}</div>
    </div>
  );
};

export default TranscriptionColumn;

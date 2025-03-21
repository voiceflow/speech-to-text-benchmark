export interface TranscriptionMessage {
  type: "delta" | "transcript" | "interim";
  transcript: string;
  platform: string;
}

export interface SystemMessage {
  type: "clear";
}

export type Message = TranscriptionMessage | SystemMessage;

export interface AudioProcessor {
  disconnect: () => void;
}

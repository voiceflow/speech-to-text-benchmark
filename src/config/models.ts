// Define model categories
export const MODEL_CATEGORIES = {
  openai: {
    title: "OpenAI",
    models: [
      { id: "gpt-4o-mini-transcribe", name: "GPT-4o Mini" },
      { id: "gpt-4o-transcribe", name: "GPT-4o" },
    ],
  },
  deepgram: {
    title: "Deepgram",
    models: [
      { id: "deepgram-nova-2", name: "Nova 2" },
      { id: "deepgram-nova-3", name: "Nova 3" },
    ],
  },
};

// Create a flat list of all models for rendering
export const TRANSCRIPTION_MODELS = Object.entries(MODEL_CATEGORIES).flatMap(
  ([category, { title, models }]) =>
    models.map((model) => ({
      id: model.id,
      title: `${title} (${model.name})`,
    }))
);

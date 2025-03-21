export const getDeepgramSettings = (model = "nova-3") => ({
  model: model,
  language: "en",
  smart_format: true,
  punctuate: true,
  sample_rate: 16000,
  encoding: "linear16",
  interim_results: true,
});

export const getOpenAISettings = (model = "gpt-4o-mini-transcribe") => ({
  input_audio_format: "pcm16",
  input_audio_transcription: {
    model: model,
    prompt: "",
    language: "en",
  },
  turn_detection: {
    type: "server_vad",
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 300,
  },
  input_audio_noise_reduction: {
    type: "near_field",
  },
  include: ["item.input_audio_transcription.logprobs"],
});

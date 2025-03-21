# Realtime Transcription Demo

This application demonstrates real-time speech transcription using multiple services:

- OpenAI gpt-4o-mini-transcribe
- OpenAI gpt-4o-transcribe
- Deepgram nova-3
- Deepgram nova-2

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

## Running the application

Use `bun` to run the backend server with typescript. Bun is required.

```
npm run start
```

### References
#### OpenAI
* https://platform.openai.com/docs/guides/speech-to-text#streaming
* https://platform.openai.com/docs/guides/realtime-transcription#handling-transcriptions
* https://platform.openai.com/docs/guides/realtime?use-case=transcription#connect-with-websockets

#### Deepgram
* https://developers.deepgram.com/docs/live-streaming-audio
* https://developers.deepgram.com/reference/speech-to-text-api/listen-streaming
* https://developers.deepgram.com/docs/understanding-end-of-speech-detection

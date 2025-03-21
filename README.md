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

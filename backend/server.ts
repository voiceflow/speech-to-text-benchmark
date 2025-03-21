/**
 * server.ts
 *
 * Express + WS server to proxy WebSocket connections to
 * OpenAI and Deepgram Realtime APIs
 */

import express from "express";
import http from "http";
import WebSocket from "ws";
import path from "path";
import dotenv from "dotenv";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { getOpenAISettings, getDeepgramSettings } from "./settings";

dotenv.config();

const app = express();

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, "../build")));

// Serve the React app for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});
// Create an HTTP server, then attach a WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");

wss.on("connection", (clientSocket) => {
  console.log("New client connected to the local server.");

  // Create a new WebSocket to the OpenAI Realtime API
  const createOpenAISocket = (model: string) => {
    console.log(`Creating OpenAI socket with model: ${model}`);

    const openaiSocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?intent=transcription",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    openaiSocket.on("open", () => {
      console.log(`OpenAI socket opened for ${model}`);

      const payload = {
        type: "transcription_session.update",
        session: getOpenAISettings(model),
      };

      openaiSocket.send(JSON.stringify(payload));
    });

    // Relay messages from OpenAI -> client
    openaiSocket.on("message", (json) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        const data = JSON.parse(json.toString());

        if (
          data.type === "conversation.item.input_audio_transcription.completed"
        ) {
          clientSocket.send(
            JSON.stringify({
              type: "transcript",
              transcript: data.transcript,
              platform: model,
            })
          );
        } else if (
          data.type === "conversation.item.input_audio_transcription.delta"
        ) {
          clientSocket.send(
            JSON.stringify({
              type: "delta",
              transcript: data.delta,
              platform: model,
            })
          );
        }
      }
    });

    openaiSocket.on("close", () => {
      console.log(`OpenAI socket closed for ${model}`);
    });

    openaiSocket.on("error", (err) => {
      console.error(`OpenAI socket error for ${model}:`, err);
    });

    return openaiSocket;
  };

  // Create a function to initialize Deepgram sockets
  const createDeepgramSocket = (model: string) => {
    console.log(`Creating Deepgram socket with model: ${model}`);

    // Extract model name from the platform ID (e.g., "deepgram-nova-3" -> "nova-3")
    const modelName = model.replace("deepgram-", "");

    const deepgramClient = deepgram.listen.live(getDeepgramSettings(modelName));

    deepgramClient.on(LiveTranscriptionEvents.Transcript, (event) => {
      const eventData = event.channel.alternatives[0];

      if (eventData.transcript.length === 0) return;

      if (event.is_final) {
        clientSocket.send(
          JSON.stringify({
            type: "transcript",
            transcript: eventData.transcript,
            platform: model,
          })
        );
      } else {
        clientSocket.send(
          JSON.stringify({
            type: "interim",
            transcript: eventData.transcript,
            platform: model,
          })
        );
      }
    });

    deepgramClient.on("open", () => {
      console.log(`Deepgram socket opened for ${modelName}.`);
    });

    return deepgramClient;
  };

  // Define available models
  const AVAILABLE_MODELS = {
    openai: ["gpt-4o-mini-transcribe", "gpt-4o-transcribe"],
    deepgram: ["nova-2", "nova-3"],
  };

  // Initialize model sockets
  const modelSockets = new Map();

  // Initialize OpenAI sockets
  AVAILABLE_MODELS.openai.forEach((model) => {
    modelSockets.set(model, createOpenAISocket(model));
  });

  // Initialize Deepgram sockets
  AVAILABLE_MODELS.deepgram.forEach((model) => {
    const platformId = `deepgram-${model}`;
    modelSockets.set(platformId, createDeepgramSocket(platformId));
  });

  // Relay messages from the client
  clientSocket.on("message", (message) => {
    const data = JSON.parse(message.toString());

    // Handle audio data
    if (data.type === "input_audio_buffer.append") {
      // Send to all OpenAI sockets
      AVAILABLE_MODELS.openai.forEach((model) => {
        const socket = modelSockets.get(model);
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(message.toString());
        }
      });

      // Send to all Deepgram sockets
      AVAILABLE_MODELS.deepgram.forEach((model) => {
        const platformId = `deepgram-${model}`;
        const client = modelSockets.get(platformId);
        if (client) {
          client.send(Buffer.from(data.audio, "base64"));
        }
      });
    }
  });

  // Handle close events
  clientSocket.on("close", () => {
    console.log("Client disconnected.");

    // Close all model sockets
    modelSockets.forEach((socket, model) => {
      if (model.startsWith("deepgram-")) {
        socket.disconnect();
      } else if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });
  });
});

const PORT = process.env.BACKEND_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

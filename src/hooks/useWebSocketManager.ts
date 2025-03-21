import { useRef, useCallback, useEffect } from "react";
import { TranscriptionMessage, Message, SystemMessage } from "../types";

type SubscriberCallback = (message: Message) => void;

export function useWebSocketManager(wsUrl: string) {
  // WebSocket reference
  const websocketRef = useRef<WebSocket | null>(null);

  // Subscribers reference
  const subscribersRef = useRef<Set<SubscriberCallback>>(new Set());

  // Subscribe to messages
  const subscribe = useCallback((callback: SubscriberCallback) => {
    subscribersRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Broadcast a message to all subscribers
  const broadcastMessage = useCallback((message: Message) => {
    subscribersRef.current.forEach((subscriber) => subscriber(message));
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as TranscriptionMessage;
        broadcastMessage(data);
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    },
    [broadcastMessage]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clear previous transcriptions
    const clearMessage: SystemMessage = { type: "clear" };
    broadcastMessage(clearMessage);

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      websocketRef.current = null;
    };

    return ws;
  }, [wsUrl, handleWebSocketMessage, broadcastMessage]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  }, []);

  // Send data through WebSocket
  const sendData = useCallback((data: any) => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: !!websocketRef.current,
    connect,
    disconnect,
    sendData,
    subscribe,
    broadcastMessage,
  };
}

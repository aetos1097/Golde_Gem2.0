import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5233';

export function useSignalR() {
  const connectionRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('token'),
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => setConnected(true));
    connection.onclose(() => setConnected(false));

    connection.start()
      .then(() => {
        setConnected(true);
        connectionRef.current = connection;
      })
      .catch((err) => console.error('SignalR connection error:', err));

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((conversationId) => {
    connectionRef.current?.invoke('JoinConversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    connectionRef.current?.invoke('LeaveConversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId, content) => {
    return connectionRef.current?.invoke('SendMessage', conversationId, content);
  }, []);

  const sendPriceOffer = useCallback((conversationId, price) => {
    return connectionRef.current?.invoke('SendPriceOffer', conversationId, price);
  }, []);

  const acceptPrice = useCallback((conversationId) => {
    return connectionRef.current?.invoke('AcceptPrice', conversationId);
  }, []);

  const rejectPrice = useCallback((conversationId) => {
    return connectionRef.current?.invoke('RejectPrice', conversationId);
  }, []);

  const sendTyping = useCallback((conversationId) => {
    connectionRef.current?.invoke('Typing', conversationId);
  }, []);

  const on = useCallback((event, handler) => {
    connectionRef.current?.on(event, handler);
    return () => connectionRef.current?.off(event, handler);
  }, []);

  return {
    connected,
    connection: connectionRef,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendPriceOffer,
    acceptPrice,
    rejectPrice,
    sendTyping,
    on,
  };
}

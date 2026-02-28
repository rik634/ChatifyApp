import { useEffect, useCallback, useState } from 'react';
import { wsService } from '../utils/websocket';
import { type Message } from '../types/message.types';

interface UseWebSocketProps {
  token: string | null;
  roomId: string | null;
  onMessage: (message: Message) => void;
}

export const useWebSocket = ({ token, roomId, onMessage }: UseWebSocketProps) => {
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      console.log('⚠️ No token, skipping WebSocket connection');
      return;
    }

    let mounted = true;

    const connect = async () => {
      if (!mounted) return;
      
      setConnectionState('connecting');
      setError(null);

      try {
        await wsService.connect(
          token,
          () => {
            if (mounted) {
              console.log('✅ WebSocket connected in hook');
              setConnectionState('connected');
              setError(null);
            }
          },
          (err) => {
            if (mounted) {
              console.error('❌ WebSocket connection error:', err);
              setConnectionState('disconnected');
              setError(err.message || 'Connection failed');
            }
          }
        );
      } catch (err: any) {
        if (mounted) {
          console.error('❌ Failed to connect:', err);
          setConnectionState('disconnected');
          setError(err.message || 'Failed to connect');
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      wsService.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!roomId || connectionState !== 'connected') {
      return;
    }

    let mounted = true;

    const subscribe = async () => {
      try {
        await wsService.subscribeToRoom(roomId, (message) => {
          if (mounted) {
            onMessage(message);
          }
        });
      } catch (err) {
        console.error('❌ Failed to subscribe to room:', err);
      }
    };

    subscribe();

    return () => {
      mounted = false;
    };
  }, [roomId, connectionState, onMessage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!roomId) {
      console.error('❌ No room selected');
      throw new Error('No room selected');
    }

    if (connectionState !== 'connected') {
      console.error('❌ WebSocket not connected');
      throw new Error('WebSocket is not connected. Please wait...');
    }

    try {
      await wsService.sendMessage(roomId, content);
    } catch (err: any) {
      console.error('❌ Failed to send message:', err);
      throw err;
    }
  }, [roomId, connectionState]);

  return {
    sendMessage,
    connectionState,
    error,
    isConnected: connectionState === 'connected',
  };
};
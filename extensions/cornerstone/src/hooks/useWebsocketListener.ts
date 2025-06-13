import { useEffect, useRef, useCallback } from 'react';

export function useWebSocketSender(url: string, onMessage?: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket OPEN');
    };

    ws.current.onclose = () => {
      console.log('WebSocket CLOSE');
    };

    ws.current.onerror = err => {
      console.error('WebSocket ERROR', err);
    };

    ws.current.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        console.log('Odebrano wiadomość:', data);
        onMessage?.(data);
      } catch (e) {
        console.error('Nieprawidłowy JSON w wiadomości', event.data);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url, onMessage]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
      console.log('Wysłano wiadomość:', data);
    } else {
      console.warn('WebSocket nie jest otwarty — nie można wysłać wiadomości');
    }
  }, []);

  return { sendMessage };
}

import { useEffect, useRef, useCallback } from 'react';

export function useWebSocketSender(url: string) {
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
      console.log('Odebrano wiadomość:', event.data);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

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

import { useEffect, useRef, useCallback } from 'react';
import { BroadcastChannel } from 'broadcast-channel';

export function useBroadcastChannelSender(
  channelName = 'radiology-channel',
  onMessage?: (data: any) => void
) {
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channel.current = new BroadcastChannel(channelName);

    channel.current.onmessage = event => {
      onMessage?.(event);
    };

    return () => {
      channel.current?.close();
    };
  }, [channelName, onMessage]);

  const sendMessage = useCallback((data: any) => {
    if (channel.current) {
      channel.current.postMessage(data);
    } else {
      console.warn('Kanał BroadcastChannel nie jest dostępny');
    }
  }, []);

  return { sendMessage };
}

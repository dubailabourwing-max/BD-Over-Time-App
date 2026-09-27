import { ChatMessage } from '../types';

const CHAT_STORAGE_KEY = 'otbd_chat_messages';
const CHANNEL_NAME = 'otbd_team_chat_channel';
export const MESSAGE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }
}

export const ChatStorage = {
  /**
   * Returns all active non-expired messages (less than 30 mins old)
   */
  getMessages(): ChatMessage[] {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];

    const now = Date.now();
    try {
      const parsed: ChatMessage[] = JSON.parse(raw);
      // Filter out messages older than 30 minutes
      const active = parsed.filter(m => now - m.timestamp < MESSAGE_EXPIRY_MS);
      
      // If we filtered out expired messages, clean up localStorage
      if (active.length !== parsed.length) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(active));
      }
      return active;
    } catch {
      return [];
    }
  },

  /**
   * Send a new chat message
   */
  sendMessage(senderId: string, senderName: string, senderDesignation: string | undefined, text: string): ChatMessage {
    const active = this.getMessages();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId,
      senderName,
      senderDesignation,
      text: text.trim(),
      timestamp: Date.now()
    };

    const updated = [...active, newMsg];
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));

    // Notify other tabs via BroadcastChannel & custom event
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'NEW_CHAT_MESSAGE', message: newMsg });
      } catch (e) {
        console.warn('Failed to broadcast chat:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('otbd_chat_updated'));

    return newMsg;
  },

  /**
   * Delete a single message manually
   */
  deleteMessage(id: string): void {
    const active = this.getMessages().filter(m => m.id !== id);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(active));
    
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'DELETE_CHAT_MESSAGE', id });
      } catch (e) {
        console.warn('Failed to broadcast delete:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('otbd_chat_updated'));
  },

  /**
   * Subscribe to chat updates from other tabs or timer cleanup
   */
  subscribe(callback: () => void): () => void {
    const handleEvent = () => callback();

    window.addEventListener('storage', handleEvent);
    window.addEventListener('otbd_chat_updated', handleEvent);

    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'NEW_CHAT_MESSAGE' || event.data?.type === 'DELETE_CHAT_MESSAGE') {
          callback();
        }
      };
    }

    // Interval ticker to prune expired 30-min messages automatically
    const intervalId = setInterval(() => {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const now = Date.now();
        const parsed: ChatMessage[] = JSON.parse(raw);
        const hasExpired = parsed.some(m => now - m.timestamp >= MESSAGE_EXPIRY_MS);
        if (hasExpired) {
          ChatStorage.getMessages(); // triggers auto cleanup
          callback();
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('storage', handleEvent);
      window.removeEventListener('otbd_chat_updated', handleEvent);
      clearInterval(intervalId);
    };
  }
};

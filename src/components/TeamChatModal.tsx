import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Clock, Trash2, MessageSquare, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Profile, ChatMessage, AppSettings } from '../types';
import { ChatStorage, MESSAGE_EXPIRY_MS } from '../utils/chatStorage';

interface TeamChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  settings: AppSettings;
}

export const TeamChatModal: React.FC<TeamChatModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  settings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderProfileId, setSenderProfileId] = useState(activeProfileId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isBn = settings.language === 'bn';

  // Sync senderProfileId when activeProfileId changes
  useEffect(() => {
    setSenderProfileId(activeProfileId);
  }, [activeProfileId]);

  // Load & subscribe to real-time chat messages
  useEffect(() => {
    if (!isOpen) return;

    const refreshMessages = () => {
      setMessages(ChatStorage.getMessages());
    };

    refreshMessages();
    const unsubscribe = ChatStorage.subscribe(refreshMessages);

    // Live countdown update every second
    const interval = setInterval(() => {
      setMessages(ChatStorage.getMessages());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOpen]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const currentSenderProfile = profiles.find(p => p.id === senderProfileId) || profiles[0] || {
    id: 'unknown',
    name: 'Member',
    designation: 'Staff'
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    ChatStorage.sendMessage(
      currentSenderProfile.id,
      currentSenderProfile.name,
      currentSenderProfile.designation || 'Staff',
      inputText
    );
    setInputText('');
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleDelete = (id: string) => {
    ChatStorage.deleteMessage(id);
  };

  // Format remaining minutes/seconds before 30-min auto delete
  const getRemainingTimeStr = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const remainingMs = Math.max(0, MESSAGE_EXPIRY_MS - elapsed);
    const remainingMins = Math.floor(remainingMs / (1000 * 60));
    const remainingSecs = Math.floor((remainingMs % (1000 * 60)) / 1000);

    if (remainingMins === 0 && remainingSecs < 60) {
      return `${remainingSecs}s left`;
    }
    return `${remainingMins}m left`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[85vh] max-h-[700px] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-lg shadow-inner">
              💬
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <span>{isBn ? 'মেম্বারদের টিম চ্যাট' : 'Member Team Chat'}</span>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-emerald-200" />
                <span>{isBn ? 'মেসেজগুলো ৩০ মিনিট পর অটোমেটিক মুছে যাবে' : 'Messages auto-delete after 30 mins'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender Profile Switcher Banner */}
        <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isBn ? 'আপনি পাঠাচ্ছেন:' : 'Sending as:'}
            </span>
            <select
              value={senderProfileId}
              onChange={(e) => {
                setSenderProfileId(e.target.value);
                onSelectProfile(e.target.value);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.designation || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/50">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isBn ? '৩০ মি. টাইম লিমিট' : '30 Min Auto-Clean'}</span>
          </div>
        </div>

        {/* Messages Body List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950/70">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl">
                💬
              </div>
              <p className="text-sm font-semibold max-w-xs text-slate-600 dark:text-slate-400">
                {isBn 
                  ? 'এখনো কোনো মেসেজ নেই। একজন লিখলে সব মেম্বার দেখতে পারবে এবং ৩০ মিনিট পর নিজে থেকেই মুছে যাবে।' 
                  : 'No active messages right now. Messages sent by any member will be visible to everyone and auto-delete in 30 minutes.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.senderId === senderProfileId;
              const remainingStr = getRemainingTimeStr(msg.timestamp);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group animate-fade-in`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1">
                    <span className="text-emerald-600 dark:text-emerald-400">{msg.senderName}</span>
                    {msg.senderDesignation && (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300">
                        {msg.senderDesignation}
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-sm ${
                    isSelf 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none'
                  }`}>
                    <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed break-words">
                      {msg.text}
                    </p>

                    <div className="mt-2 pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-[10px] font-bold">
                      <span className={`flex items-center gap-1 ${
                        isSelf ? 'text-emerald-100' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{remainingStr}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(msg.id)}
                        title="Delete now"
                        className={`opacity-60 hover:opacity-100 transition p-0.5 rounded ${
                          isSelf ? 'text-white hover:bg-emerald-700' : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emojis Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {isBn ? 'কুইক রিঅ্যাক্ট:' : 'Quick:'}
          </span>
          {['👍', '👌', '🚗', '📋', '⏱️', '✅', '🙏', '📍', '🙋‍♂️'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleQuickEmoji(emoji)}
              className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm hover:scale-110 active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Controls */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isBn ? 'এখানে মেসেজ লিখুন... (৩০ মি. স্থায়ী থাকবে)' : 'Type message here... (deletes in 30 mins)'}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{isBn ? 'পাঠান' : 'Send'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};

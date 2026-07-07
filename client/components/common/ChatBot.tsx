import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your DharaaBot assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'Sorry, I could not process that.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: '❌ Error connecting to server. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-[999] w-16 h-16 rounded-full bg-gray-900 text-white',
          'flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-800',
          'transition-all duration-300 ease-in-out',
          isOpen && 'scale-0 pointer-events-none'
        )}
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chatbot Container */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-[999] w-[90vw] max-w-[400px] h-[80vh] max-h-[550px]',
          'bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-gray-900 font-bold text-sm">
              🤖
            </div>
            <h3 className="text-lg font-semibold">DharaaBot</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Close chatbot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div
          ref={chatHistoryRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 scroll-smooth"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', message.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-xs px-4 py-2 rounded-2xl text-sm leading-relaxed',
                  message.sender === 'user'
                    ? 'bg-gray-900 text-white rounded-br-none'
                    : 'bg-gray-300 text-gray-900 rounded-bl-none'
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-300 text-gray-900 px-4 py-2 rounded-2xl rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

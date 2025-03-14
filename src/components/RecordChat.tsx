'use client'

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { sendChatMessage } from '@/actions/chat-actions';

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
};

type RecordChatProps = {
  recordId: string;
  filename: string;
  onClose: () => void;
};

export default function RecordChat({ recordId, filename, onClose }: RecordChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage: Message = {
      text: "AI is typing...",
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    const questionAsked = message;
    setMessage('');

    try {
      const response = await sendChatMessage(filename, questionAsked, null);

      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          text: response.answer,
          isUser: false,
          timestamp: new Date()
        }];
      });
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          text: "Sorry, I encountered an error processing your request.",
          isUser: false,
          timestamp: new Date()
        }];
      });
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area - with padding bottom to prevent overlap with fixed form */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                } ${msg.isLoading ? 'animate-pulse' : ''}`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - fixed at bottom */}
      <form 
        onSubmit={handleSubmit} 
        className="absolute bottom-0 left-0 right-0 border-t bg-white"
      >
        <div className="flex items-center gap-2 p-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this record..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
} 
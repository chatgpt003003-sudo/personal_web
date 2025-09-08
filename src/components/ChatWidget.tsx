'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: 'text' | 'decision_tree';
  options?: ChatOption[];
  timestamp: Date;
}

interface ChatOption {
  text: string;
  value: string;
  action?: string;
  mode?: string;
}

interface ChatResponse {
  message: string;
  options: ChatOption[];
  conversationId: string;
  messageId: string;
  mode: 'tree' | 'ai';
  nextNodeId?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<'tree' | 'ai'>('tree');
  const [currentNodeId, setCurrentNodeId] = useState<string>('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const startConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'tree' }),
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        setConversationId(data.conversationId);
        setCurrentNodeId(data.nextNodeId || 'welcome');
        setMessages([
          {
            id: data.messageId,
            role: 'assistant',
            content: data.message,
            messageType: 'decision_tree',
            options: data.options,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, userChoice?: string) => {
      if ((!content.trim() && !userChoice) || isLoading) return;

      try {
        setIsLoading(true);

        // Add user message if it's text input
        if (content && mode === 'ai') {
          const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            messageType: 'text',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
        }

        const requestBody: Record<string, string | undefined> = {
          conversationId,
          mode,
        };

        if (mode === 'tree') {
          requestBody.currentNodeId = currentNodeId;
          requestBody.userChoice = userChoice;
        } else {
          requestBody.message = content;
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data: ChatResponse = await response.json();

          const assistantMessage: ChatMessage = {
            id: data.messageId,
            role: 'assistant',
            content: data.message,
            messageType: data.mode === 'tree' ? 'decision_tree' : 'text',
            options: data.options,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setMode(data.mode);
          setCurrentNodeId(data.nextNodeId || currentNodeId);
          setInputValue('');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, mode, currentNodeId, isLoading]
  );

  const handleOptionClick = useCallback(
    (option: ChatOption) => {
      if (option.action === 'switch_mode' && option.mode) {
        setMode(option.mode as 'tree' | 'ai');
        if (option.mode === 'tree') {
          startConversation();
          return;
        }
      }

      if (mode === 'tree') {
        sendMessage('', option.value);
      }
    },
    [mode, sendMessage, startConversation]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [sendMessage, inputValue]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen, messages.length, startConversation]);

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        style={{ display: isOpen ? 'none' : 'block' }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 400, y: 400 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0, x: 400, y: 400 }}
            className="fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-[32rem] flex flex-col"
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={20} />
                <span className="font-semibold">Portfolio Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-red-700 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot size={16} className="mt-1 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User size={16} className="mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>

                        {/* Decision tree options */}
                        {message.options && message.options.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.options.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                className="block w-full text-left p-2 bg-white text-gray-800 rounded border hover:bg-gray-50 transition-colors text-sm"
                              >
                                {option.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot size={16} />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Only show for AI mode */}
            {mode === 'ai' && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Mode: {mode === 'ai' ? 'AI Chat' : 'Guided Chat'}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

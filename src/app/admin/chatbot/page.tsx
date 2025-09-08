'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  RefreshCw,
  MessageSquare,
  Database,
  AlertCircle,
} from 'lucide-react';

interface ChatConversation {
  id: string;
  sessionId: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: string;
  timestamp: string;
}

export default function ChatbotAdminPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingKB, setIsUpdatingKB] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
  });

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // Note: This would need a proper API endpoint to fetch all conversations
      // For now, we'll show a placeholder interface
      setStats({
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateKnowledgeBase = async () => {
    try {
      setIsUpdatingKB(true);
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Knowledge base updated successfully!');
      } else {
        throw new Error('Failed to update knowledge base');
      }
    } catch (error) {
      console.error('Failed to update knowledge base:', error);
      alert(
        'Failed to update knowledge base. Please check console for details.'
      );
    } finally {
      setIsUpdatingKB(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chatbot Management
        </h1>
        <p className="text-gray-600">
          Monitor chatbot conversations and manage the knowledge base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Conversations
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalConversations}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Messages
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalMessages}
              </p>
            </div>
            <Bot className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Messages/Chat
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.avgMessagesPerConversation.toFixed(1)}
              </p>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Knowledge Base Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Knowledge Base Management
        </h2>
        <p className="text-gray-600 mb-4">
          Update the knowledge base with the latest project information and blog
          posts for better AI responses.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                OpenAI API Required
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Make sure to set your OPENAI_API_KEY environment variable to
                enable AI features.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={updateKnowledgeBase}
          disabled={isUpdatingKB}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isUpdatingKB ? 'animate-spin' : ''}`}
          />
          <span>{isUpdatingKB ? 'Updating...' : 'Update Knowledge Base'}</span>
        </button>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Chatbot Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Decision Tree Mode
            </h3>
            <p className="text-sm text-gray-600">
              The chatbot starts in decision tree mode, providing structured
              guidance through predefined conversation flows.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI Mode</h3>
            <p className="text-sm text-gray-600">
              Users can switch to AI mode for natural language conversations
              powered by OpenAI GPT with RAG.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Knowledge Sources
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Published project descriptions and metadata</li>
              <li>Published blog post content</li>
              <li>Manual knowledge entries about skills and experience</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Chat Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test the Chatbot
        </h2>
        <p className="text-gray-600 mb-4">
          The chatbot is available on all pages of your website. Look for the
          chat button in the bottom-right corner.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Bot className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Features Available
              </h3>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                <li>Decision tree guidance for common questions</li>
                <li>AI-powered responses for complex queries</li>
                <li>Context-aware conversations with memory</li>
                <li>Seamless switching between interaction modes</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

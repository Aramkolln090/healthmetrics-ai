import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

// Minimal Ollama chat interface that directly calls the API
const SimpleOllamaChat = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {role: 'assistant', content: 'Hello! I\'m your health assistant. How can I help you today?'}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct API call to Ollama
      console.log('Sending request to Ollama API...');
      
      // Explicitly disable streaming by setting stream: false
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3.2',
          stream: false, // Explicitly disable streaming
          options: {
            num_ctx: 2048, // Set a reasonable context size
          },
          messages: [
            { role: 'system', content: 'You are a helpful health assistant. Provide accurate, concise information about health topics.' },
            ...messages,
            userMessage
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle the response as text first to debug
      const rawText = await response.text();
      console.log('Raw response:', rawText);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error(`Failed to parse Ollama response as JSON: ${jsonError.message}. Raw response: ${rawText.substring(0, 100)}...`);
      }
      
      console.log('Parsed response:', data);
      
      if (data.message && data.message.content) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message.content 
        }]);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to communicate with Ollama');
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${err.message || 'Failed to communicate with Ollama. Is it running?'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : ''
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-healthBlue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="mb-4">
            <div className="inline-block max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        {error && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
            {error}
          </div>
        )}
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a health question..."
            className="flex-1 resize-none"
            disabled={isLoading}
            rows={2}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="self-end bg-healthBlue-700 hover:bg-healthBlue-900 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleOllamaChat; 
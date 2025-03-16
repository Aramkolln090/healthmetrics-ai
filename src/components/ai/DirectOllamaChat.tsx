import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, RefreshCw } from 'lucide-react';

// Direct Ollama chat that bypasses the chat API and uses the basic completion API
const DirectOllamaChat = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {role: 'assistant', content: 'Hello! I\'m your health assistant. How can I help you today?'}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format all messages into a single prompt for the completion API
  const formatPrompt = (messages: {role: string, content: string}[], newUserMessage: string) => {
    let prompt = "You are a helpful health assistant. Only answer questions related to health and wellness.\n\n";
    
    // Add conversation history
    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }
    
    // Add the new user message
    prompt += `User: ${newUserMessage}\n`;
    prompt += "Assistant: ";
    
    return prompt;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the completion API instead of chat API
      console.log('Sending request to Ollama completion API...');
      
      // Format the prompt with conversation history
      const prompt = formatPrompt(messages, input);
      console.log('Formatted prompt:', prompt);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 500
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Get the raw text first for debugging
      const rawText = await response.text();
      console.log('Raw response:', rawText);
      
      // Parse the response
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error(`Failed to parse response: ${jsonError.message}`);
      }
      
      if (data && data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
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

  const clearChat = () => {
    setMessages([
      {role: 'assistant', content: 'Hello! I\'m your health assistant. How can I help you today?'}
    ]);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Direct Ollama Chat</h3>
        <Button variant="ghost" size="sm" onClick={clearChat} title="Clear chat">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
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

export default DirectOllamaChat; 
import React, { useState, useRef, useEffect } from "react";
import { useOllamaChat } from "@/hooks/useOllamaChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, RefreshCw, Bot, Database, BookOpen } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function HealthChatInterface() {
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    availableModels,
    selectedModel,
    changeModel,
    isUsingKnowledgeBase,
    toggleKnowledgeBase,
    refreshKnowledgeBase
  } = useOllamaChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    clearMessages();
    toast({
      description: "Chat history has been cleared",
    });
  };

  const renderMessageContent = (content: string) => {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[80vh] border rounded-lg bg-card shadow-sm health-card">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Health Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          {availableModels.length > 0 && (
            <Select value={selectedModel} onValueChange={changeModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex items-center space-x-2 ml-4 border-l pl-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="knowledge-toggle"
                checked={isUsingKnowledgeBase}
                onCheckedChange={toggleKnowledgeBase}
              />
              <Label htmlFor="knowledge-toggle" className="flex items-center cursor-pointer">
                <BookOpen className="h-4 w-4 mr-1" />
                <span className="text-sm">Knowledge Base</span>
              </Label>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              title="Refresh knowledge base" 
              onClick={refreshKnowledgeBase}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleReset} title="Clear chat">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Health AI Assistant</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Ask me any health-related questions about nutrition, fitness, 
              general wellness, or understanding medical terms.
            </p>
            {isUsingKnowledgeBase && (
              <div className="mt-4 flex items-center text-primary text-xs gap-1">
                <Database className="h-3 w-3" />
                <span>Knowledge base is active</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-lg bg-muted border border-border flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mx-4 my-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to communicate with the AI. Make sure Ollama is running."}
          </AlertDescription>
        </Alert>
      )}

      {/* Chat input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a health question..."
            className="min-h-[60px] flex-1 resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="self-end bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 
import { useState, useCallback, useEffect } from "react";
import { Message, ollamaChat, isHealthRelatedQuery, listAvailableModels } from "@/lib/ollama";
import { toast } from "@/components/ui/use-toast";
import { loadKnowledgeBase, enhanceWithKnowledgeContext } from "@/lib/knowledge-context";
import { KnowledgeEntry } from "@/components/ai/HealthKnowledgeBase";

interface UseOllamaChatOptions {
  initialMessages?: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onError?: (error: Error) => void;
  useKnowledgeBase?: boolean;
}

export function useOllamaChat({
  initialMessages = [],
  model = "llama3",
  temperature = 0.7,
  maxTokens = 500,
  onError,
  useKnowledgeBase = true
}: UseOllamaChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(model);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  const [isUsingKnowledgeBase, setIsUsingKnowledgeBase] = useState<boolean>(useKnowledgeBase);

  // Load the knowledge base on component mount
  useEffect(() => {
    if (isUsingKnowledgeBase) {
      setKnowledgeBase(loadKnowledgeBase());
    }
  }, [isUsingKnowledgeBase]);

  // Fetch available models on component mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const models = await listAvailableModels();
        setAvailableModels(models);
        
        // If our default model isn't available and we have models, select the first one
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        // Don't set an error state here as it's not critical
      }
    }
    
    fetchModels();
  }, [selectedModel]);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) return;

      // Check if query is health-related
      if (!isHealthRelatedQuery(content)) {
        // Add the user message
        const userMessage: Message = { role: "user", content };
        
        // Add a response that explains we only answer health questions
        const assistantMessage: Message = { 
          role: "assistant", 
          content: "I'm designed to answer health-related questions only. Could you please ask something about health, wellness, nutrition, fitness, or medical information?" 
        };
        
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        return;
      }

      // Add user message to the state immediately
      const userMessage: Message = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      
      setIsLoading(true);
      setError(null);

      try {
        // Prepare messages array with the system prompt and previous context
        const messageHistory = [...messages];
        
        // Enhance the user's message with knowledge base context if enabled
        let enhancedContent = content;
        if (isUsingKnowledgeBase && knowledgeBase.length > 0) {
          enhancedContent = enhanceWithKnowledgeContext(content, knowledgeBase);
        }
        
        // Add the enhanced user message for the API call
        const enhancedUserMessage: Message = { 
          role: "user", 
          content: enhancedContent 
        };
        
        // Send to Ollama API with the enhanced message
        const response = await ollamaChat([...messageHistory, enhancedUserMessage], {
          model: selectedModel,
          temperature,
          maxTokens,
        });

        // Add AI response to messages
        const assistantMessage: Message = { role: "assistant", content: response };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error("Error in chat:", err);
        setError(err);
        
        if (onError) {
          onError(err);
        } else {
          toast({
            title: "Chat Error",
            description: err.message || "Failed to get a response from the AI",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedModel, temperature, maxTokens, onError, isUsingKnowledgeBase, knowledgeBase]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const changeModel = useCallback((modelName: string) => {
    setSelectedModel(modelName);
  }, []);

  const toggleKnowledgeBase = useCallback(() => {
    setIsUsingKnowledgeBase(prev => !prev);
    
    toast({
      title: isUsingKnowledgeBase ? "Knowledge Base Disabled" : "Knowledge Base Enabled",
      description: isUsingKnowledgeBase 
        ? "AI will now use only its training data." 
        : "AI will now use your knowledge base to provide more accurate answers.",
    });
  }, [isUsingKnowledgeBase]);

  // Reload knowledge base (useful if it was updated elsewhere)
  const refreshKnowledgeBase = useCallback(() => {
    setKnowledgeBase(loadKnowledgeBase());
    
    toast({
      description: "Knowledge base refreshed.",
    });
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error,
    availableModels,
    selectedModel,
    changeModel,
    isUsingKnowledgeBase,
    toggleKnowledgeBase,
    refreshKnowledgeBase
  };
} 
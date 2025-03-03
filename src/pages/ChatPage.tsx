
import React, { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import Navbar from "@/components/layout/Navbar";
import { Heart, Brain, Activity, FileHeart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Message types
interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// AI action types for health questions
const HEALTH_ACTIONS = [
  {
    text: "Health Advice",
    icon: Heart,
    colors: {
      icon: "text-red-600",
      border: "border-red-500",
      bg: "bg-red-100",
    },
  },
  {
    text: "Symptom Analysis",
    icon: Activity,
    colors: {
      icon: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-100",
    },
  },
  {
    text: "Wellness Tip",
    icon: Brain,
    colors: {
      icon: "text-emerald-600",
      border: "border-emerald-500",
      bg: "bg-emerald-100",
    },
  },
  {
    text: "Medical Info",
    icon: FileHeart,
    colors: {
      icon: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-100",
    },
  },
];

// Recommended questions
const RECOMMENDED_QUESTIONS = [
  "What are the best exercises for heart health?",
  "How can I improve my sleep quality?",
  "What foods should I eat to boost my immunity?",
  "How do I manage stress effectively?",
  "What are common symptoms of vitamin deficiency?"
];

// Sample AI responses for demo purposes
const AI_RESPONSES: Record<string, string> = {
  default: "I'm your health AI assistant. How can I help you with your health today?",
  "Health Advice": "Based on general health guidelines, it's recommended to maintain a balanced diet, exercise regularly, get adequate sleep, and manage stress effectively. Would you like more specific advice on any of these areas?",
  "Symptom Analysis": "While I can discuss symptoms, please remember that I'm not a substitute for professional medical care. It's always best to consult with a healthcare provider for proper diagnosis and treatment.",
  "Wellness Tip": "Did you know that just 5 minutes of meditation daily can help reduce stress and improve focus? Try incorporating brief mindfulness practices into your daily routine.",
  "Medical Info": "I can provide general information about various health conditions and medications, though this should not replace professional medical advice."
};

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm your HealthyAI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const handleSubmit = (text: string, action?: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: action ? AI_RESPONSES[action] || AI_RESPONSES.default : AI_RESPONSES.default,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuestionClick = (question: string) => {
    handleSubmit(question);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-20 pb-20 relative">
        {/* Chat container */}
        <div className="container mx-auto px-4 max-w-4xl h-full flex flex-col">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl flex-1 p-6 mb-6 overflow-hidden flex flex-col">
            {/* Chat header */}
            <div className="border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-primary">HealthyAI Chat</h1>
              <p className="text-muted-foreground">Your personal health assistant</p>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-6">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended questions (only show if no messages from user yet) */}
            {messages.length === 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Try asking:</h3>
                <div className="flex flex-wrap gap-2">
                  {RECOMMENDED_QUESTIONS.map((question, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs"
                      onClick={() => handleQuestionClick(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed input area at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <AIInputWithSuggestions 
            placeholder="Ask me anything about your health..."
            onSubmit={handleSubmit}
            actions={HEALTH_ACTIONS}
            maxHeight={200}
          />
        </div>
      </div>
      
      {/* Background effect */}
      <div className="fixed inset-0 -z-10">
        <AuroraBackground showRadialGradient={true}>
          {/* Empty div to satisfy children prop requirement */}
          <div></div>
        </AuroraBackground>
      </div>
    </div>
  );
};

export default ChatPage;

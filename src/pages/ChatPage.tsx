
import React, { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import Navbar from "@/components/layout/Navbar";
import { Heart, Brain, Activity, FileHeart, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { GlowEffect } from "@/components/ui/glow-effect";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Message types
interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// AI action types for health questions
const HEALTH_ACTIONS = [{
  text: "Health Advice",
  icon: Heart,
  colors: {
    icon: "text-red-600",
    border: "border-red-500",
    bg: "bg-red-100"
  }
}, {
  text: "Symptom Analysis",
  icon: Activity,
  colors: {
    icon: "text-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-100"
  }
}, {
  text: "Wellness Tip",
  icon: Brain,
  colors: {
    icon: "text-emerald-600",
    border: "border-emerald-500",
    bg: "bg-emerald-100"
  }
}, {
  text: "Medical Info",
  icon: FileHeart,
  colors: {
    icon: "text-purple-600",
    border: "border-purple-500",
    bg: "bg-purple-100"
  }
}];

// Sample AI responses for demo purposes
const AI_RESPONSES: Record<string, string> = {
  default: "I'm your health AI assistant. How can I help you with your health today?",
  "Health Advice": "Based on general health guidelines, it's recommended to maintain a balanced diet, exercise regularly, get adequate sleep, and manage stress effectively. Would you like more specific advice on any of these areas?",
  "Symptom Analysis": "While I can discuss symptoms, please remember that I'm not a substitute for professional medical care. It's always best to consult with a healthcare provider for proper diagnosis and treatment.",
  "Wellness Tip": "Did you know that just 5 minutes of meditation daily can help reduce stress and improve focus? Try incorporating brief mindfulness practices into your daily routine.",
  "Medical Info": "I can provide general information about various health conditions and medications, though this should not replace professional medical advice."
};

// Suggested questions for users
const SUGGESTED_QUESTIONS = ["How can I improve my sleep quality?", "What are the benefits of intermittent fasting?", "Can you explain what causes headaches?", "What exercises are best for lower back pain?"];

const ChatPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string>("default");
  const [chats, setChats] = useState<Record<string, Message[]>>({
    default: [{
      id: "welcome",
      content: "Hi there! I'm your HealthyAI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date()
    }]
  });
  const [isGlowing, setIsGlowing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  const handleSubmit = (text: string, action?: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date()
    };
    setChats(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), userMessage]
    }));

    // Trigger glow effect
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 2000);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: action ? AI_RESPONSES[action] || AI_RESPONSES.default : AI_RESPONSES.default,
        sender: "ai",
        timestamp: new Date()
      };
      setChats(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), aiResponse]
      }));
    }, 1000);
  };

  const handleSuggestedQuestionClick = (question: string) => {
    handleSubmit(question);
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setChats(prev => ({
      ...prev,
      [newChatId]: [{
        id: "welcome",
        content: "Hi there! I'm your HealthyAI assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date()
      }]
    }));
    setCurrentChatId(newChatId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleChatSelect = (chatId: number) => {
    // Convert to string for our state structure
    setCurrentChatId(chatId.toString());
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-16 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-md w-full p-6 md:p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">Sign In to Use HealthyAI Chat</h1>
            <p className="text-center text-muted-foreground mb-6 md:mb-8">
              Please sign in or create an account to start chatting with our AI health assistant.
            </p>
            <AuthModal 
              triggerButton={
                <Button className="w-full" size="lg">
                  Sign In or Sign Up
                </Button>
              }
            />
          </div>
        </div>
        <div className="fixed inset-0 -z-10">
          <AuroraBackground showRadialGradient={true}>
            <div></div>
          </AuroraBackground>
        </div>
      </div>
    );
  }

  const currentMessages = chats[currentChatId] || [];
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-16">
        {/* Main chat container with sidebar */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Mobile sidebar using Sheet */}
          {isMobile ? (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden absolute left-4 top-20 z-30">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <div className="h-full">
                  <ChatSidebar onNewChat={handleNewChat} onChatSelect={handleChatSelect} />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <ChatSidebar onNewChat={handleNewChat} onChatSelect={handleChatSelect} />
          )}
          
          {/* Chat area */}
          <div className="relative flex-1 overflow-hidden">
            <div className="container mx-auto h-full px-2 sm:px-4 py-4 flex flex-col">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-lg sm:rounded-2xl shadow-xl flex-1 p-3 sm:p-6 overflow-hidden flex flex-col">
                {/* Chat header */}
                <div className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">HealthyAI Chat</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Your personal health assistant</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 sm:mb-6 space-y-4 sm:space-y-6 px-1 sm:px-0">
                  {currentMessages.map(message => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        <p className="text-sm sm:text-base">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1 sm:mt-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Suggested questions */}
                {currentMessages.length <= 2 && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Suggested questions:</h3>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_QUESTIONS.map((question, index) => (
                        <button 
                          key={index} 
                          onClick={() => handleSuggestedQuestionClick(question)} 
                          className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground rounded-full transition-colors"
                        >
                          {isSmallScreen ? question.substring(0, 20) + (question.length > 20 ? '...' : '') : question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Input area with glow effect */}
                <div className="mt-auto relative">
                  <motion.div 
                    className="relative" 
                    animate={{ opacity: isGlowing ? 1 : 0 }} 
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <GlowEffect 
                      colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']} 
                      mode="colorShift" 
                      blur="medium" 
                      scale={1.1} 
                      duration={3} 
                    />
                  </motion.div>
                  <AIInputWithSuggestions 
                    placeholder="Ask me anything about your health..." 
                    onSubmit={handleSubmit} 
                    actions={isSmallScreen ? [] : HEALTH_ACTIONS} 
                    maxHeight={isSmallScreen ? 120 : 200} 
                    className="relative z-10" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background effect */}
      <div className="fixed inset-0 -z-10">
        <AuroraBackground showRadialGradient={true}>
          <div></div>
        </AuroraBackground>
      </div>
    </div>
  );
};

export default ChatPage;

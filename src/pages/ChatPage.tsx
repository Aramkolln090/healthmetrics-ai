import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  ChevronRight, 
  Menu, 
  Loader2, 
  Send, 
  Mic, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Edit, 
  User as UserIcon,
  MessageSquarePlus,
  Settings,
  ChevronDown
} from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Chat,
  ChatFolder,
  initializeChatSession,
  saveChats,
  createChat,
  updateChat,
  deleteChat,
  createFolder,
  deleteFolder,
  getChatById
} from "@/lib/chat-service";
import { Message as OllamaMessage, ollamaChat } from "@/lib/ollama";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Suggested questions for new users
const SUGGESTED_FEATURES = [
  {
    title: "Natural Language Conversations",
    icon: "💬"
  },
  {
    title: "Knowledge Base",
    icon: "📚"
  },
  {
    title: "Personalized Recommendations",
    icon: "🎯"
  },
  {
    title: "Seamless Integrations",
    icon: "🔄"
  }
];

const FEATURE_CARDS = [
  {
    title: "Add a connection",
    description: "Connect your data sources.",
    icon: <MessageSquarePlus className="h-5 w-5 text-gray-500" />,
    actionLabel: "Connect",
    onClick: () => console.log("Add connection clicked")
  },
  {
    title: "Configure connections",
    description: "Learn how to easily connect your information sources.",
    icon: <Settings className="h-5 w-5 text-gray-500" />,
    actionLabel: "Watch",
    onClick: () => console.log("Configure clicked")
  },
  {
    title: "Explore Search",
    description: "Discover how Qatalog helps you find answers instantly.",
    icon: <MessageSquarePlus className="h-5 w-5 text-gray-500" />,
    actionLabel: "Watch",
    onClick: () => console.log("Explore clicked")
  },
  {
    title: "Invite your team",
    description: "Give your team instant access to Qatalog.",
    icon: <UserIcon className="h-5 w-5 text-gray-500" />,
    actionLabel: "Invite",
    onClick: () => console.log("Invite clicked")
  }
];

const ChatPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOllamaReady, setIsOllamaReady] = useState<boolean>(false);
  const [isCheckingOllama, setIsCheckingOllama] = useState<boolean>(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, currentChatId, isLoading]);

  // Initialize chat session and check Ollama status
  useEffect(() => {
    const { chats, folders, currentChatId } = initializeChatSession();
    setChats(chats);
    setFolders(folders);
    setCurrentChatId(currentChatId);
    
    // Check if Ollama is running
    const checkOllamaStatus = async () => {
      try {
        const response = await fetch("http://localhost:11434/api/tags");
        setIsOllamaReady(response.ok);
      } catch (error) {
        setIsOllamaReady(false);
        console.error("Ollama connection error:", error);
      } finally {
        setIsCheckingOllama(false);
      }
    };
    
    checkOllamaStatus();
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChats(chats, folders);
    }
  }, [chats, folders]);

  const handleNewChat = (folderId?: string) => {
    const newChat = createChat(folderId);
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => deleteChat(prev, chatId));
    
    // If we're deleting the current chat, select another one
    if (chatId === currentChatId) {
      const remaining = chats.filter(chat => chat.id !== chatId);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      } else {
        // If no chats left, create a new one
        const newChat = createChat();
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      }
    }
    
    toast({
      description: "Chat deleted successfully",
    });
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleCreateFolder = (name: string) => {
    const newFolder = createFolder(name);
    setFolders(prev => [...prev, newFolder]);
  };

  const handleDeleteFolder = (folderId: string) => {
    const { chats: updatedChats, folders: updatedFolders } = deleteFolder(
      chats,
      folders,
      folderId
    );
    
    setChats(updatedChats);
    setFolders(updatedFolders);
    
    // If the current chat was in the deleted folder, select another chat
    const currentChat = getChatById(chats, currentChatId);
    if (currentChat?.folderId === folderId) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else {
        // If no chats left, create a new one
        const newChat = createChat();
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      }
    }
    
    toast({
      description: "Folder and its chats deleted successfully",
    });
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, name: newName } : folder
    ));
  };

  const handleFeedback = (index: number, feedback: 'like' | 'dislike') => {
    toast({
      description: feedback === 'like' ? "Thanks for your feedback!" : "We'll work on improving our responses.",
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Text copied to clipboard",
    });
  };

  const startEditingMessage = (index: number, content: string) => {
    setEditingMessageId(`message-${index}`);
    setEditText(content);
  };

  const saveEditedMessage = async (index: number) => {
    const currentChat = getChatById(chats, currentChatId);
    if (!currentChat) return;
    
    const updatedMessages = [...currentChat.messages];
    if (index >= 0 && index < updatedMessages.length) {
      // If it's a user message, update it and send to AI again
      if (updatedMessages[index].role === 'user') {
        updatedMessages[index] = {
          ...updatedMessages[index],
          content: editText
        };
        
        // Remove all subsequent messages
        const messagesToKeep = updatedMessages.slice(0, index + 1);
        setChats(prev => updateChat(prev, currentChatId, messagesToKeep));
        
        // Get AI response for the edited message
        await handleSubmit(editText, true);
      }
    }
    
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Here you would handle the chat submission
    // For now, just clear the input
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleFeatureClick = (feature: string) => {
    handleSubmit(`Tell me about ${feature.toLowerCase()} in health`);
  };

  const renderMessageContent = (content: string) => {
    return (
      <div className="prose prose-sm max-w-none text-current dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 pt-16 flex items-center justify-center">
          <div className="max-w-md w-full p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
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
      </div>
    );
  }

  const currentChat = getChatById(chats, currentChatId);
  const currentMessages = currentChat?.messages || [];
  const hasMessages = currentMessages.length > 1; // Count beyond the initial greeting

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>AS</AvatarFallback>
            <AvatarImage src="/avatar-placeholder.png" />
          </Avatar>
          <span className="font-medium">ASMobbin</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-red-500 border-red-200">
            Connections 0
          </Button>
          <Button variant="outline" size="sm">
            Invite
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          {/* Chat logo */}
          <div className="mb-4 rounded-full bg-gray-100 p-3">
            <MessageSquarePlus className="h-6 w-6 text-gray-700" />
          </div>
          
          {/* Welcome message */}
          <h1 className="text-xl font-medium mb-8">Hello!</h1>
          
          {/* Chat input */}
          <form ref={formRef} onSubmit={handleSubmit} className="w-full">
            <div className="relative w-full">
              <Textarea 
                placeholder="How can I help?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pr-12 min-h-[80px] rounded-lg border shadow-sm"
              />
              <Button 
                size="icon" 
                className="absolute right-3 bottom-3 rounded"
                type="submit"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Connection dropdown */}
            <div className="mt-4 flex justify-between items-center">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">All connections</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-t bg-gray-50">
        {FEATURE_CARDS.map((card, index) => (
          <Card key={index} className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <h3 className="font-medium">{card.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm"
                onClick={card.onClick}
              >
                {card.actionLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t py-4 px-6 bg-gray-900 text-white flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquarePlus className="h-5 w-5 mr-2" />
          <span className="font-medium">Qatalog</span>
        </div>
        <div className="text-sm">
          curated by Mobbin
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;

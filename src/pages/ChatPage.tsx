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
  MessageSquarePlus
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

  const handleSubmit = async (text: string, isEdit: boolean = false) => {
    if (!text.trim() || isLoading) return;
    
    const currentChat = getChatById(chats, currentChatId);
    if (!currentChat) return;
    
    // If not an edit, add user message
    if (!isEdit) {
      const userMessage: OllamaMessage = {
        role: "user",
        content: text
      };
      
      const updatedMessages = [...currentChat.messages, userMessage];
      setChats(prev => updateChat(prev, currentChatId, updatedMessages));
      setInput("");
    }
    
    // Get the current messages after any updates
    const latestChat = getChatById(
      isEdit ? chats : updateChat(chats, currentChatId, [...currentChat.messages, { role: "user", content: text }]),
      currentChatId
    );
    if (!latestChat) return;
    
    // If Ollama is not ready, use a fallback response
    if (!isOllamaReady) {
      setTimeout(() => {
        const fallbackResponse: OllamaMessage = {
          role: "assistant",
          content: "I'm currently offline. Please make sure Ollama is running on your computer to get AI-powered health answers."
        };
        
        setChats(prev => updateChat(
          prev, 
          currentChatId, 
          [...latestChat.messages, fallbackResponse]
        ));
      }, 1000);
      return;
    }
    
    // Send to Ollama
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ollamaChat(latestChat.messages, {
        model: "llama3.2",
        temperature: 0.7,
        maxTokens: 500,
      });
      
      // Add AI response to messages
      const assistantMessage: OllamaMessage = { 
        role: "assistant", 
        content: response 
      };
      
      setChats(prev => updateChat(
        prev, 
        currentChatId, 
        [...latestChat.messages, assistantMessage]
      ));
    } catch (err: any) {
      console.error("Error in chat:", err);
      setError(err);
      
      // Add error message to chat
      const errorMessage: OllamaMessage = { 
        role: "assistant", 
        content: `Error: ${err.message || "Failed to communicate with Ollama"}`
      };
      
      setChats(prev => updateChat(
        prev, 
        currentChatId, 
        [...latestChat.messages, errorMessage]
      ));
      
      toast({
        title: "Chat Error",
        description: err.message || "Failed to get a response from the AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const handleFeatureClick = (feature: string) => {
    handleSubmit(`Tell me about ${feature.toLowerCase()} in health`);
  };

  const renderMessageContent = (content: string) => {
    return (
      <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200">
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
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar - always visible on larger screens */}
      <div className="hidden lg:block">
        <ChatSidebar 
          chats={chats}
          folders={folders}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
        />
      </div>
      
      {/* Mobile sidebar using Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden absolute left-4 top-4 z-30">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <div className="h-full">
              <ChatSidebar 
                chats={chats}
                folders={folders}
                currentChatId={currentChatId}
                onNewChat={handleNewChat}
                onChatSelect={handleChatSelect}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
                onRenameFolder={handleRenameFolder}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header with hamburger menu and new chat button */}
        <div className="flex items-center h-14 px-4 border-b">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 text-lg font-semibold">
            {currentChat?.title || 'New Chat'}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-md flex items-center gap-1 text-sm"
            onClick={() => handleNewChat()}
          >
            <MessageSquarePlus className="h-4 w-4 mr-1" />
            <span>New Chat</span>
          </Button>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="mb-6 p-4 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4L4 16L24 28L44 16L24 4Z" fill="currentColor" fillOpacity="0.8"/>
                  <path d="M4 32L24 44L44 32M4 24L24 36L44 24" fill="currentColor" fillOpacity="0.5"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-center">Welcome to HealthyAI!</h1>
              <p className="text-center text-muted-foreground max-w-xl mb-8">
                HealthyAI is your personal health assistant, ready to help you with health information, symptom guidance, and wellness tips.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_FEATURES.map((feature, index) => (
                  <div 
                    key={index}
                    onClick={() => handleFeatureClick(feature.title)}
                    className="flex items-center p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                  >
                    <div className="mr-3 text-xl">{feature.icon}</div>
                    <div className="text-sm font-medium">{feature.title}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 md:px-6">
              {currentMessages.slice(1).map((message, index) => {
                const isUser = message.role === 'user';
                const actualIndex = index + 1; // Account for the welcome message
                
                return (
                  <div key={index} className={`flex mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <Avatar className="mr-3 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground">HA</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      {editingMessageId === `message-${actualIndex}` ? (
                        <div className="w-full mb-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full resize-none mb-2"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingMessageId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveEditedMessage(actualIndex)}
                            >
                              Save & Regenerate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`p-3 rounded-lg ${
                            isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}>
                            {renderMessageContent(message.content)}
                          </div>
                          
                          <div className="flex items-center mt-1">
                            {isUser ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-muted-foreground"
                                onClick={() => startEditingMessage(actualIndex, message.content)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-7 w-7"
                                  onClick={() => handleFeedback(actualIndex, 'like')}
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-7 w-7"
                                  onClick={() => handleFeedback(actualIndex, 'dislike')}
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-7 w-7"
                                  onClick={() => handleCopyText(message.content)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {isUser && (
                      <Avatar className="ml-3 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex mb-8">
                  <Avatar className="mr-3 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">HA</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Chat input */}
        <div className="border-t p-4">
          <div className="relative rounded-lg border">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[50px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-3 pr-16 py-3"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8"
                disabled
              >
                <Mic className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

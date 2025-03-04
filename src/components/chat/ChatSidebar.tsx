
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Heart
} from "lucide-react";

// Animation variants
const sidebarVariants = {
  open: { width: "260px" },
  closed: { width: "60px" },
};

const contentVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

const iconVariants = {
  open: { x: 0 },
  closed: { x: 0 },
};

// Sample chat history for demo purposes
const SAMPLE_CHATS = [
  { id: 1, title: "General wellness discussion", date: "Today" },
  { id: 2, title: "Sleep improvement tips", date: "Yesterday" },
  { id: 3, title: "Nutrition advice", date: "Yesterday" },
  { id: 4, title: "Workout recommendations", date: "3 days ago" },
  { id: 5, title: "Stress management", date: "1 week ago" },
];

interface ChatSidebarProps {
  onNewChat: () => void;
  onChatSelect: (chatId: number) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onNewChat, onChatSelect }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState<number | null>(1);

  const handleChatClick = (chatId: number) => {
    setActiveChat(chatId);
    onChatSelect(chatId);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      className="relative z-30 h-full flex-shrink-0 border-r border-border bg-background/80 backdrop-blur-sm dark:bg-gray-900/80"
      initial="open"
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-6 z-40 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={toggleSidebar}
      >
        {isCollapsed ? 
          <ChevronRight className="h-3 w-3" /> : 
          <ChevronLeft className="h-3 w-3" />
        }
      </Button>

      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center p-3">
          <Heart className="h-5 w-5 text-primary" />
          <motion.span 
            className="ml-2 font-semibold"
            variants={contentVariants}
            transition={{ duration: 0.2 }}
          >
            {!isCollapsed && "HealthyAI Chat"}
          </motion.span>
        </div>
        
        {/* New chat button */}
        <div className="px-3 py-2">
          <Button 
            className="w-full justify-start gap-2" 
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
            <motion.span 
              variants={contentVariants}
              transition={{ duration: 0.2 }}
            >
              {!isCollapsed && "New Chat"}
            </motion.span>
          </Button>
        </div>
        
        {/* Search box - only shown when expanded */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search chats..."
                className="w-full rounded-md border bg-background px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Chat history */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {SAMPLE_CHATS.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-accent",
                  activeChat === chat.id && "bg-accent"
                )}
                onClick={() => handleChatClick(chat.id)}
              >
                <motion.div 
                  variants={iconVariants}
                  className="mt-0.5 flex-shrink-0"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </motion.div>
                
                {!isCollapsed && (
                  <div className="flex-1 truncate">
                    <div className="line-clamp-1 font-medium">
                      {chat.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {chat.date}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
        
        {/* Footer with settings */}
        <div className="mt-auto border-t p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
            
            {!isCollapsed && (
              <>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
                <motion.div 
                  variants={contentVariants}
                  className="ml-auto text-xs text-muted-foreground"
                >
                  HealthyAI v1.0
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;

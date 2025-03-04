
import React from "react";

// Interface for chat history items
export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
  }[];
}

interface ChatHistoryProps {
  chats: ChatHistoryItem[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  chats,
  currentChatId,
  onSelectChat
}) => {
  // This component is a placeholder for future functionality
  // Currently the chat history is managed in the ChatSidebar component
  return null;
};

export default ChatHistory;

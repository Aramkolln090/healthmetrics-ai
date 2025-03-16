import { Message } from './ollama';

// Chat types
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  folderId?: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  createdAt: Date;
}

// Constants
const STORAGE_KEY = 'health_chats_storage';
const DEFAULT_WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm your health assistant. How can I help you today?"
};

/**
 * Load all chats from localStorage
 */
export function loadChats(): { chats: Chat[], folders: ChatFolder[] } {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return { chats: [], folders: [] };
    }
    
    const data = JSON.parse(storedData);
    
    // Handle dates that were serialized as strings
    const chats = data.chats.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt)
    }));
    
    const folders = data.folders.map((folder: any) => ({
      ...folder,
      createdAt: new Date(folder.createdAt)
    }));
    
    return { chats, folders };
  } catch (error) {
    console.error('Error loading chats:', error);
    return { chats: [], folders: [] };
  }
}

/**
 * Save all chats to localStorage
 */
export function saveChats(chats: Chat[], folders: ChatFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, folders }));
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

/**
 * Create a new chat
 */
export function createChat(folderId?: string): Chat {
  const newChat: Chat = {
    id: `chat_${Date.now()}`,
    title: 'New Chat',
    messages: [{ ...DEFAULT_WELCOME_MESSAGE }],
    createdAt: new Date(),
    updatedAt: new Date(),
    folderId
  };
  
  return newChat;
}

/**
 * Create a new folder
 */
export function createFolder(name: string): ChatFolder {
  return {
    id: `folder_${Date.now()}`,
    name,
    createdAt: new Date()
  };
}

/**
 * Update a chat title based on its content
 */
export function generateChatTitle(messages: Message[]): string {
  if (messages.length <= 1) {
    return 'New Chat';
  }
  
  // Find the first user message
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) {
    return 'New Chat';
  }
  
  // Truncate to first 30 chars
  const title = firstUserMessage.content.slice(0, 30);
  return title + (firstUserMessage.content.length > 30 ? '...' : '');
}

/**
 * Update a chat with new messages
 */
export function updateChat(
  chats: Chat[],
  chatId: string, 
  updatedMessages: Message[]
): Chat[] {
  return chats.map(chat => {
    if (chat.id !== chatId) return chat;
    
    // Generate title from content if it's still the default
    const title = chat.title === 'New Chat' 
      ? generateChatTitle(updatedMessages)
      : chat.title;
    
    return {
      ...chat,
      messages: updatedMessages,
      title,
      updatedAt: new Date()
    };
  });
}

/**
 * Delete a chat by ID
 */
export function deleteChat(chats: Chat[], chatId: string): Chat[] {
  return chats.filter(chat => chat.id !== chatId);
}

/**
 * Delete a folder and all its chats
 */
export function deleteFolder(
  chats: Chat[], 
  folders: ChatFolder[], 
  folderId: string
): { chats: Chat[], folders: ChatFolder[] } {
  const updatedFolders = folders.filter(folder => folder.id !== folderId);
  const updatedChats = chats.filter(chat => chat.folderId !== folderId);
  
  return {
    chats: updatedChats,
    folders: updatedFolders
  };
}

/**
 * Get a chat by ID
 */
export function getChatById(chats: Chat[], chatId: string): Chat | undefined {
  return chats.find(chat => chat.id === chatId);
}

/**
 * Initialize a chat session
 * Returns a default chat if there are no chats
 */
export function initializeChatSession(): { 
  chats: Chat[],
  folders: ChatFolder[],
  currentChatId: string 
} {
  const { chats, folders } = loadChats();
  
  // If there are no chats, create a default one
  if (chats.length === 0) {
    const defaultChat = createChat();
    return {
      chats: [defaultChat],
      folders,
      currentChatId: defaultChat.id
    };
  }
  
  // Otherwise, use the most recently updated chat
  const sortedChats = [...chats].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  
  return {
    chats,
    folders,
    currentChatId: sortedChats[0].id
  };
} 
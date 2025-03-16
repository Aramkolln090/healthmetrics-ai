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
  Folder,
  FolderPlus,
  MoreVertical,
  Trash,
  Edit2,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Trash2,
  PlusCircle,
  LogOut,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Chat, ChatFolder } from "@/lib/chat-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { formatDistanceToNow } from "date-fns";

// Animation variants
const sidebarVariants = {
  open: {
    width: "260px"
  },
  closed: {
    width: "60px"
  }
};

const contentVariants = {
  open: {
    opacity: 1
  },
  closed: {
    opacity: 0
  }
};

const iconVariants = {
  open: {
    x: 0
  },
  closed: {
    x: 0
  }
};

// Sidebar Nav Item Component
interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  isActive?: boolean;
  children: React.ReactNode;
}

const NavItem = ({ icon, isActive, children, className, ...props }: NavItemProps) => {
  return (
    <div
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
        isActive ? "bg-accent text-accent-foreground" : "transparent hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {icon && <div className="mr-2 h-4 w-4">{icon}</div>}
      <span className="truncate">{children}</span>
    </div>
  );
};

interface ChatSidebarProps {
  chats: Chat[];
  folders: ChatFolder[];
  currentChatId: string;
  onNewChat: (folderId?: string) => void;
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
}

interface ChatGroup {
  title: string;
  chats: Chat[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  folders,
  currentChatId,
  onNewChat,
  onChatSelect,
  onDeleteChat,
  onRenameChat,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder
}) => {
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
      setNewFolderName("");
      setCreatingFolder(false);
      toast({
        description: "Folder created successfully",
      });
    }
  };

  const handleRenameFolder = () => {
    if (renamingFolderId && newFolderName.trim()) {
      onRenameFolder(renamingFolderId, newFolderName);
      setRenamingFolderId(null);
      toast({
        description: "Folder renamed successfully",
      });
    }
  };

  const handleRenameChat = () => {
    if (renamingChatId && newChatTitle.trim()) {
      onRenameChat(renamingChatId, newChatTitle);
      setRenamingChatId(null);
      toast({
        description: "Chat renamed successfully",
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm("Delete this folder and all its chats?")) {
      onDeleteFolder(folderId);
    }
  };

  const handleRenameSubmit = (id: string, type: "chat" | "folder") => {
    if (type === "chat") {
      onRenameChat(id, newChatTitle);
      setRenamingChatId(null);
    } else {
      onRenameFolder(id, newFolderName);
      setRenamingFolderId(null);
    }
  };

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  // Group chats by date
  const groupChatsByDate = (): ChatGroup[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Filter out chats that are in folders
    const standaloneChats = chats.filter(chat => !chat.folderId && (!searchQuery || chat.title.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const groups: ChatGroup[] = [
      { title: "Today", chats: [] },
      { title: "Yesterday", chats: [] },
      { title: "Last 7 Days", chats: [] },
      { title: "Last 30 Days", chats: [] },
      { title: "Older", chats: [] }
    ];
    
    standaloneChats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      
      if (chatDate >= today) {
        groups[0].chats.push(chat);
      } else if (chatDate >= yesterday) {
        groups[1].chats.push(chat);
      } else if (chatDate >= lastWeek) {
        groups[2].chats.push(chat);
      } else if (chatDate >= lastMonth) {
        groups[3].chats.push(chat);
      } else {
        groups[4].chats.push(chat);
      }
    });
    
    // Sort chats within each group by date (newest first)
    groups.forEach(group => {
      group.chats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    
    // Filter out empty groups
    return groups.filter(group => group.chats.length > 0);
  };

  const chatGroups = groupChatsByDate();

  // For mobile view in Sheet component, always show expanded sidebar
  const sidebarState = isMobile ? "open" : (isCollapsed ? "closed" : "open");

  if (isCollapsed) {
    return (
      <aside className="w-16 border-r bg-background flex flex-col items-center py-4">
        <div className="flex flex-col items-center space-y-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCollapsed(false)}>
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
          <Separator className="w-10 my-2" />
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => onNewChat()}>
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <FolderPlus className="h-5 w-5" onClick={() => setCreatingFolder(true)} />
          </Button>
          <Separator className="w-10 my-2" />
        </div>
        <div className="mt-auto mb-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold tracking-tight flex-1">HealthyAI</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)}>
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 py-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 pr-4 pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0" onClick={() => onNewChat()}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            className="w-full justify-start text-sm font-medium"
            onClick={() => onNewChat()}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>
      
      {/* Create folder UI */}
      {creatingFolder ? (
        <div className="px-4 py-2">
          <div className="flex gap-2 mb-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-xs"
              onClick={() => setCreatingFolder(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleCreateFolder}
            >
              Create
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-sm font-medium"
            onClick={() => setCreatingFolder(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      )}
      
      <Separator className="my-2" />
      
      <ScrollArea className="flex-1 px-2">
        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-4">
            {folders.map((folder) => {
              const folderChats = chats.filter(
                chat => chat.folderId === folder.id && (!searchQuery || chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              
              if (searchQuery && folderChats.length === 0) {
                return null; // Hide empty folders when searching
              }
              
              return (
                <div key={folder.id} className="mb-1">
                  {renamingFolderId === folder.id ? (
                    <div className="px-2 py-1">
                      <div className="flex gap-2 mb-1">
                        <Input
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Folder name"
                          className="h-7 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameSubmit(folder.id, "folder");
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setRenamingFolderId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => handleRenameSubmit(folder.id, "folder")}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group">
                      <div 
                        className="flex items-center rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => toggleFolder(folder.id)}
                      >
                        {expandedFolders[folder.id] ? (
                          <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                        )}
                        <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="flex-1 truncate">{folder.name}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingFolderId(folder.id);
                                  setNewFolderName(folder.name);
                                }}
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNewChat(folder.id);
                                }}
                              >
                                <PlusCircle className="h-3.5 w-3.5 mr-2" /> New Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(folder.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Folder chats */}
                      {expandedFolders[folder.id] && (
                        <div className="mt-1 ml-5 border-l pl-2 py-1">
                          {folderChats.map((chat) => (
                            <div key={chat.id} className="group">
                              {renamingChatId === chat.id ? (
                                <div className="px-2 py-1">
                                  <div className="flex gap-2 mb-1">
                                    <Input
                                      value={newChatTitle}
                                      onChange={(e) => setNewChatTitle(e.target.value)}
                                      placeholder="Chat name"
                                      className="h-7 text-sm"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleRenameSubmit(chat.id, "chat");
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="flex-1 h-7 text-xs"
                                      onClick={() => setRenamingChatId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="flex-1 h-7 text-xs"
                                      onClick={() => handleRenameSubmit(chat.id, "chat")}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <NavItem
                                  icon={<MessageSquarePlus className="h-4 w-4" />}
                                  isActive={currentChatId === chat.id}
                                  className="pl-1 py-1.5 group"
                                  onClick={() => onChatSelect(chat.id)}
                                >
                                  <div className="flex items-center w-full">
                                    <span className="flex-1 truncate">{chat.title || "Untitled chat"}</span>
                                    <div className="opacity-0 group-hover:opacity-100 flex ml-1">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setRenamingChatId(chat.id);
                                              setNewChatTitle(chat.title || "");
                                            }}
                                          >
                                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onDeleteChat(chat.id);
                                            }}
                                          >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </NavItem>
                              )}
                            </div>
                          ))}
                          
                          {folderChats.length === 0 && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                              No chats yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Chat groups */}
        {chatGroups.map((group) => (
          <div key={group.title} className="mb-2">
            <div className="px-4 py-1">
              <h3 className="text-xs font-medium text-muted-foreground">{group.title}</h3>
            </div>
            {group.chats.map((chat) => (
              <div key={chat.id} className="group">
                {renamingChatId === chat.id ? (
                  <div className="px-4 py-1">
                    <div className="flex gap-2 mb-1">
                      <Input
                        value={newChatTitle}
                        onChange={(e) => setNewChatTitle(e.target.value)}
                        placeholder="Chat name"
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSubmit(chat.id, "chat");
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 h-7 text-xs"
                        onClick={() => setRenamingChatId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRenameSubmit(chat.id, "chat")}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <NavItem 
                    icon={<MessageSquarePlus className="h-4 w-4" />}
                    isActive={currentChatId === chat.id}
                    className="group"
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-center w-full">
                      <span className="flex-1 truncate">{chat.title || "Untitled chat"}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                        {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex ml-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setRenamingChatId(chat.id);
                                setNewChatTitle(chat.title || "");
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => onDeleteChat(chat.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </NavItem>
                )}
              </div>
            ))}
          </div>
        ))}
      </ScrollArea>
      
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
          {user ? (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <AuthModal 
              triggerButton={
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              }
            />
          )}
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;

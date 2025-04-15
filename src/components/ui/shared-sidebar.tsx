import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, BarChart3, Calendar, Settings, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
}

interface SidebarProps {
  children?: React.ReactNode;
  items?: SidebarItem[];
  className?: string;
}

export const SharedSidebar: React.FC<SidebarProps> = ({ children, items, className = "" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getDefaultSidebarItems = () => {
    return [
      { icon: <Home className="h-5 w-5" />, label: 'Dashboard', path: '/metrics' },
      { icon: <BarChart3 className="h-5 w-5" />, label: 'History', path: '/metrics?view=history' },
      { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', path: '/calendar' },
      { icon: <Bot className="h-5 w-5" />, label: 'Health AI', path: '/ai-health' },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', path: '/settings' },
    ];
  };

  const sidebarItems = items || getDefaultSidebarItems();

  // Check if the current path matches the sidebar item path
  const isActive = (path?: string) => {
    if (!path) return false;
    
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      const params = path.split('?')[1];
      return location.pathname === basePath && location.search.includes(params);
    }
    return location.pathname === path;
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={`hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen fixed top-0 left-0 pt-16 ${className}`}>
      <div className="px-6 mb-6">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sidebar-foreground">{user?.email?.split('@')[0] || 'User'}</h3>
            <p className="text-xs text-muted-foreground">Health Dashboard</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 px-2">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors
              ${isActive(item.path) 
                ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium dark:bg-sidebar-primary/20 dark:text-sidebar-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted dark:hover:bg-sidebar-accent/10'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto px-4 pb-4">
        <div className="flex justify-between items-center border-t border-sidebar-border pt-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}; 
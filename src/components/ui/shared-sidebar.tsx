import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, BarChart3, Calendar, Settings, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  children?: React.ReactNode;
}

export const SharedSidebar: React.FC<SidebarProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getSidebarItems = () => {
    return [
      { icon: <Home className="h-5 w-5" />, label: 'Dashboard', path: '/metrics' },
      { icon: <BarChart3 className="h-5 w-5" />, label: 'History', path: '/metrics?view=history' },
      { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', path: '/calendar' },
      { icon: <Bot className="h-5 w-5" />, label: 'Health AI', path: '/ai-health' },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', path: '/settings' },
    ];
  };

  // Check if the current path matches the sidebar item path
  const isActive = (path: string) => {
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      const params = path.split('?')[1];
      return location.pathname === basePath && location.search.includes(params);
    }
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-healthBlue-900 border-r border-gray-200 dark:border-healthBlue-950/50 h-[calc(100vh-4rem)] fixed pt-6">
      <div className="px-6 mb-6">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-healthBlue-700/10 text-healthBlue-700 dark:bg-healthBlue-500/20 dark:text-healthBlue-200">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-healthBlue-950 dark:text-healthBlue-200">{user?.email?.split('@')[0] || 'User'}</h3>
            <p className="text-xs text-muted-foreground">Health Dashboard</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 px-2">
        {getSidebarItems().map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors
              ${isActive(item.path) 
                ? 'bg-healthBlue-700/10 text-healthBlue-700 font-medium dark:bg-healthBlue-500/20 dark:text-healthBlue-200' 
                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-healthBlue-950/30'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto px-4 pb-4">
        <div className="flex justify-between items-center border-t border-gray-200 dark:border-healthBlue-950/50 pt-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}; 
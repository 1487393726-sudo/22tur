"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X, 
  Loader2,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  helpLink?: {
    label: string;
    url: string;
  };
}

interface UserFeedbackContextType {
  messages: FeedbackMessage[];
  showMessage: (message: Omit<FeedbackMessage, 'id'>) => string;
  hideMessage: (id: string) => void;
  clearAll: () => void;
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, persistent?: boolean) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
  showLoading: (title: string, message: string) => string;
}

const UserFeedbackContext = createContext<UserFeedbackContextType | undefined>(undefined);

export function UserFeedbackProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showMessage = (message: Omit<FeedbackMessage, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: FeedbackMessage = {
      ...message,
      id,
      duration: message.duration ?? (message.type === 'error' ? 0 : 5000)
    };

    setMessages(prev => [...prev, newMessage]);

    // Auto-hide non-persistent messages
    if (!message.persistent && newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => {
        hideMessage(id);
      }, newMessage.duration);
    }

    return id;
  };

  const hideMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  const showSuccess = (title: string, message: string, duration = 5000): string => {
    return showMessage({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, persistent = true): string => {
    return showMessage({ type: 'error', title, message, persistent, duration: persistent ? 0 : 8000 });
  };

  const showWarning = (title: string, message: string, duration = 6000): string => {
    return showMessage({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 5000): string => {
    return showMessage({ type: 'info', title, message, duration });
  };

  const showLoading = (title: string, message: string): string => {
    return showMessage({ type: 'loading', title, message, persistent: true });
  };

  const value: UserFeedbackContextType = {
    messages,
    showMessage,
    hideMessage,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };

  return (
    <UserFeedbackContext.Provider value={value}>
      {children}
      <FeedbackContainer />
    </UserFeedbackContext.Provider>
  );
}

export function useUserFeedback() {
  const context = useContext(UserFeedbackContext);
  if (!context) {
    throw new Error('useUserFeedback must be used within a UserFeedbackProvider');
  }
  return context;
}

function FeedbackContainer() {
  const { messages, hideMessage } = useUserFeedback();

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {messages.map((message) => (
        <FeedbackMessage
          key={message.id}
          message={message}
          onClose={() => hideMessage(message.id)}
        />
      ))}
    </div>
  );
}

interface FeedbackMessageProps {
  message: FeedbackMessage;
  onClose: () => void;
}

function FeedbackMessage({ message, onClose }: FeedbackMessageProps) {
  const { locale } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-white500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'loading':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 backdrop-blur-sm
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {message.title}
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {message.message}
          </p>
          
          {/* Action buttons */}
          {(message.action || message.helpLink) && (
            <div className="flex items-center gap-3 mt-3">
              {message.action && (
                <button
                  onClick={message.action.onClick}
                  className="text-sm font-medium text-white600 hover:text-white700 dark:text-white400 dark:hover:text-white300"
                >
                  {message.action.label}
                </button>
              )}
              {message.helpLink && (
                <a
                  href={message.helpLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <HelpCircle className="w-3 h-3" />
                  {message.helpLink.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Progress indicator component for long-running operations
interface ProgressIndicatorProps {
  progress: number; // 0-100
  title: string;
  description?: string;
  onCancel?: () => void;
}

export function ProgressIndicator({ progress, title, description, onCancel }: ProgressIndicatorProps) {
  const { locale } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-4">
          <Loader2 className="w-8 h-8 text-white500 animate-spin mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{locale === 'en' ? 'Progress' : '进度'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {locale === 'en' ? 'Cancel' : '取消'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Help tooltip component
interface HelpTooltipProps {
  content: string;
  children: ReactNode;
}

export function HelpTooltip({ content, children }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs whitespace-normal shadow-lg">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}
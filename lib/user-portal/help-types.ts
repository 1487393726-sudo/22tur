// Help Center Types

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  views: number;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  steps?: GuideStep[];
  images?: string[];
  videoUrl?: string;
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  tips?: string[];
}

export interface ContactInfo {
  id: string;
  type: 'email' | 'phone' | 'wechat' | 'qq' | 'address';
  label: string;
  value: string;
  available: boolean;
  availableHours?: string;
}

export interface LiveChat {
  id: string;
  userId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'closed';
  messages: ChatMessage[];
  startedAt: Date;
  endedAt?: Date;
  rating?: number;
  feedback?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  faqCount: number;
  guideCount: number;
}

export interface SearchResult {
  id: string;
  type: 'faq' | 'guide' | 'contact';
  title: string;
  description: string;
  relevance: number;
  url?: string;
}

export interface HelpSearchFilter {
  category?: string;
  type?: 'faq' | 'guide' | 'contact';
  difficulty?: 'easy' | 'medium' | 'hard';
  sortBy?: 'relevance' | 'views' | 'newest';
}

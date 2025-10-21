export type Post = {
  id: string;
  title: string;
  subject: string;        // 'toan' | 'ngu-van' | ...
  authorId: string;
  authorName?: string;
  createdAt: number;      
  lastActivityAt?: number; 
  replies: number;        
  likes: number;          
  pinned?: boolean;
  hidden?: boolean;
};

export type Comment = {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: number;
};

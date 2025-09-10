
export interface User {
  name: string;
  username: string;
  avatarUrl: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  replies: number;
  isLiked: boolean;
  isRetweeted: boolean;
}

export interface Trend {
    category: string;
    topic: string;
    posts: string;
}

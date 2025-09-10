
import React from 'react';
import { Post as PostType } from '../types';
import { ReplyIcon, RetweetIcon, LikeIcon, ShareIcon, LikedIcon } from './icons/PostIcons';

interface PostProps {
  post: PostType;
  onToggleLike: () => void;
  onToggleRetweet: () => void;
}

const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
};

const Post: React.FC<PostProps> = ({ post, onToggleLike, onToggleRetweet }) => {
  return (
    <div className="flex space-x-4 p-4 border-b border-x-border hover:bg-gray-900/30 transition-colors duration-200 cursor-pointer">
      <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center space-x-1">
          <span className="font-bold hover:underline">{post.author.name}</span>
          <span className="text-gray-500">@{post.author.username}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500 hover:underline">{formatTime(post.timestamp)}</span>
        </div>
        <p className="whitespace-pre-wrap my-1">{post.content}</p>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post content" className="mt-2 rounded-2xl border border-x-border" />
        )}
        <div className="flex justify-between items-center mt-3 max-w-sm text-gray-500">
            <div className="flex items-center space-x-1 group">
                <div className="p-2 group-hover:bg-x-blue/20 rounded-full transition-colors duration-200">
                    <ReplyIcon className="w-5 h-5 group-hover:text-x-blue" />
                </div>
                <span>{formatCount(post.replies)}</span>
            </div>

            <div 
                onClick={(e) => { e.stopPropagation(); onToggleRetweet(); }} 
                className={`flex items-center space-x-1 group ${post.isRetweeted ? 'text-green-500' : ''}`}
            >
                <div className="p-2 group-hover:bg-green-500/20 rounded-full transition-colors duration-200">
                    <RetweetIcon className="w-5 h-5 group-hover:text-green-500" />
                </div>
                <span>{formatCount(post.retweets)}</span>
            </div>
            
            <div 
                onClick={(e) => { e.stopPropagation(); onToggleLike(); }} 
                className={`flex items-center space-x-1 group ${post.isLiked ? 'text-pink-500' : ''}`}
            >
                <div className="p-2 group-hover:bg-pink-500/20 rounded-full transition-colors duration-200">
                    {post.isLiked ? <LikedIcon className="w-5 h-5" /> : <LikeIcon className="w-5 h-5 group-hover:text-pink-500" />}
                </div>
                <span>{formatCount(post.likes)}</span>
            </div>

            <div className="flex items-center space-x-1 group">
                <div className="p-2 group-hover:bg-x-blue/20 rounded-full transition-colors duration-200">
                    <ShareIcon className="w-5 h-5 group-hover:text-x-blue" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Post;

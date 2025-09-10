
import React from 'react';
import { Post as PostType } from '../types';
import CreatePost from './CreatePost';
import Post from './Post';
import { SparklesIcon } from './icons/SidebarIcons';

interface MainContentProps {
    posts: PostType[];
    onAddPost: (content: string) => void;
    onToggleLike: (postId: string) => void;
    onToggleRetweet: (postId: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ posts, onAddPost, onToggleLike, onToggleRetweet }) => {
    return (
        <div className="w-full">
            <div className="sticky top-0 bg-black bg-opacity-70 backdrop-blur-md z-10 px-4 py-3 flex justify-between items-center border-b border-x-border">
                <h1 className="text-xl font-bold">Home</h1>
                <SparklesIcon />
            </div>
            <CreatePost onAddPost={onAddPost} />
            <div className="border-t border-x-border">
                {posts.map(post => (
                    <Post 
                        key={post.id} 
                        post={post}
                        onToggleLike={() => onToggleLike(post.id)}
                        onToggleRetweet={() => onToggleRetweet(post.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default MainContent;

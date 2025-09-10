
import React, { useState } from 'react';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import { Post as PostType } from './types';

const App: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([
    {
      id: '1',
      author: {
        name: 'React',
        username: 'reactjs',
        avatarUrl: 'https://picsum.photos/seed/react/200/200',
      },
      content: 'Just released React 19! 🎉 So many new features to explore. Check out the official docs to learn more. #React19',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      likes: 19000,
      retweets: 4500,
      replies: 789,
      isLiked: false,
      isRetweeted: false,
    },
    {
      id: '2',
      author: {
        name: 'Tailwind CSS',
        username: 'tailwindcss',
        avatarUrl: 'https://picsum.photos/seed/tailwind/200/200',
      },
      content: 'Did you know you can create beautiful, custom designs without ever leaving your HTML? That\'s the power of utility-first CSS. #CSS #WebDev',
      imageUrl: 'https://picsum.photos/seed/tailwindpost/600/330',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 12300,
      retweets: 2200,
      replies: 456,
      isLiked: true,
      isRetweeted: false,
    },
    {
        id: '3',
        author: {
          name: 'Gemini',
          username: 'geminidev',
          avatarUrl: 'https://picsum.photos/seed/gemini/200/200',
        },
        content: 'Excited to see developers building amazing applications with the new Gemini 2.5 Flash model. The speed and quality are game-changers for AI-powered features.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        likes: 9800,
        retweets: 1800,
        replies: 321,
        isLiked: false,
        isRetweeted: true,
      },
  ]);

  const handleAddPost = (content: string) => {
    const newPost: PostType = {
      id: new Date().toISOString(),
      author: {
        name: 'You',
        username: 'you',
        avatarUrl: 'https://picsum.photos/seed/you/200/200',
      },
      content,
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      replies: 0,
      isLiked: false,
      isRetweeted: false,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleToggleRetweet = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isRetweeted: !p.isRetweeted, retweets: p.isRetweeted ? p.retweets - 1 : p.retweets + 1 } : p
    ));
  };


  return (
    <div className="min-h-screen container mx-auto flex">
      <div className="w-1/5 xl:w-1/4">
        <LeftSidebar />
      </div>
      <div className="w-full max-w-[600px] border-x border-x-gray-700">
        <MainContent 
          posts={posts} 
          onAddPost={handleAddPost}
          onToggleLike={handleToggleLike}
          onToggleRetweet={handleToggleRetweet}
        />
      </div>
      <div className="hidden lg:block w-2/5 xl:w-1/3">
        <RightSidebar />
      </div>
    </div>
  );
};

export default App;

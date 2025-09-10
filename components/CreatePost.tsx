
import React, { useState } from 'react';
import { generatePostSuggestion } from '../services/geminiService';
// FIX: Import SparklesIcon from SidebarIcons as it's not in PostIcons.
import { ImageIcon, GifIcon, PollIcon, EmojiIcon, ScheduleIcon, LocationIcon } from './icons/PostIcons';
import { SparklesIcon } from './icons/SidebarIcons';

interface CreatePostProps {
  onAddPost: (content: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onAddPost }) => {
  const [postContent, setPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      onAddPost(postContent.trim());
      setPostContent('');
    }
  };

  const handleSuggest = async () => {
    setIsLoading(true);
    try {
      const suggestion = await generatePostSuggestion();
      setPostContent(suggestion);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setPostContent("AI suggestion failed. Why not post about your favorite hobby?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex space-x-4 border-b border-x-border">
      <img src="https://picsum.photos/seed/you/200/200" alt="Your Avatar" className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <form onSubmit={handleSubmit}>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What is happening?!"
            className="w-full bg-transparent text-xl outline-none resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2 text-x-blue">
                <ImageIcon />
                <GifIcon />
                <PollIcon />
                <EmojiIcon />
                <ScheduleIcon />
                <LocationIcon />
            </div>
            <div className="flex items-center space-x-4">
               <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Suggest post with AI"
                >
                  {isLoading ? (
                     <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    <SparklesIcon className="text-x-blue"/>
                  )}
               </button>
              <button
                type="submit"
                disabled={!postContent.trim()}
                className="bg-x-blue text-white rounded-full px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

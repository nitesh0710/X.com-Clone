
import React from 'react';
import { Trend } from '../types';

const trends: Trend[] = [
    { category: 'Technology · Trending', topic: '#React19', posts: '27.4K posts' },
    { category: 'Web Development · Trending', topic: 'TailwindCSS', posts: '125K posts' },
    { category: 'Artificial Intelligence', topic: 'Gemini API', posts: '15K posts' },
    { category: 'Gaming · Trending', topic: '#Starfield', posts: '88K posts' },
];

const suggestions = [
    { name: 'TypeScript', username: 'typescript', avatarUrl: 'https://picsum.photos/seed/ts/200/200' },
    { name: 'Vercel', username: 'vercel', avatarUrl: 'https://picsum.photos/seed/vercel/200/200' },
];

const TrendItem: React.FC<{ trend: Trend }> = ({ trend }) => (
    <div className="p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-200">
        <div className="text-gray-500 text-sm">{trend.category}</div>
        <div className="font-bold">{trend.topic}</div>
        <div className="text-gray-500 text-sm">{trend.posts}</div>
    </div>
);

const FollowSuggestion: React.FC<{ user: { name: string, username: string, avatarUrl: string } }> = ({ user }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-200">
        <div className="flex items-center">
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
            <div className="ml-3">
                <div className="font-bold">{user.name}</div>
                <div className="text-gray-500">@{user.username}</div>
            </div>
        </div>
        <button className="bg-white text-black rounded-full px-4 py-1.5 font-bold hover:opacity-90">
            Follow
        </button>
    </div>
);


const RightSidebar: React.FC = () => {
    return (
        <div className="p-4 space-y-6 sticky top-0 h-screen overflow-y-auto">
            <div className="relative">
                <svg viewBox="0 0 24 24" className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 fill-current text-gray-500"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>
                <input type="text" placeholder="Search" className="w-full bg-gray-900 rounded-full pl-12 py-3 focus:outline-none focus:ring-2 focus:ring-x-blue" />
            </div>

            <div className="bg-gray-900 rounded-2xl">
                <h2 className="text-xl font-bold p-3">What's happening</h2>
                {trends.map(trend => <TrendItem key={trend.topic} trend={trend} />)}
                <div className="p-3 text-x-blue hover:bg-gray-800 cursor-pointer transition-colors duration-200 rounded-b-2xl">Show more</div>
            </div>

            <div className="bg-gray-900 rounded-2xl">
                <h2 className="text-xl font-bold p-3">Who to follow</h2>
                {suggestions.map(user => <FollowSuggestion key={user.username} user={user} />)}
                <div className="p-3 text-x-blue hover:bg-gray-800 cursor-pointer transition-colors duration-200 rounded-b-2xl">Show more</div>
            </div>
        </div>
    );
};

export default RightSidebar;

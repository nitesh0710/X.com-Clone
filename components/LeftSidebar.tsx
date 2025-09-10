
import React from 'react';
import { HomeIcon, HashtagIcon, BellIcon, MailIcon, BookmarkIcon, UserIcon, MoreIcon, XLogoIcon } from './icons/SidebarIcons';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isBold?: boolean }> = ({ icon, label, isBold }) => (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-full cursor-pointer transition-colors duration-200">
        {icon}
        <span className={`text-xl hidden xl:inline ${isBold ? 'font-bold' : ''}`}>{label}</span>
    </div>
);

const LeftSidebar: React.FC = () => {
    return (
        <div className="h-full flex flex-col justify-between p-2 fixed w-1/5 xl:w-1/4">
            <div>
                <div className="p-3">
                    <XLogoIcon className="w-8 h-8 text-white" />
                </div>
                <nav className="mt-4 flex flex-col space-y-2">
                    <NavItem icon={<HomeIcon />} label="Home" isBold />
                    <NavItem icon={<HashtagIcon />} label="Explore" />
                    <NavItem icon={<BellIcon />} label="Notifications" />
                    <NavItem icon={<MailIcon />} label="Messages" />
                    <NavItem icon={<BookmarkIcon />} label="Bookmarks" />
                    <NavItem icon={<UserIcon />} label="Profile" />
                    <NavItem icon={<MoreIcon />} label="More" />
                </nav>
                <button className="bg-x-blue text-white rounded-full py-3 px-8 mt-6 w-full xl:w-56 text-lg font-bold hover:bg-blue-500 transition-colors duration-200">
                    Post
                </button>
            </div>
            <div className="flex items-center p-3 hover:bg-gray-800 rounded-full cursor-pointer mb-4">
                <img src="https://picsum.photos/seed/you/200/200" alt="User Avatar" className="w-10 h-10 rounded-full" />
                <div className="ml-3 hidden xl:inline">
                    <p className="font-bold text-sm">You</p>
                    <p className="text-gray-500 text-sm">@you</p>
                </div>
                <div className="ml-auto hidden xl:inline">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;

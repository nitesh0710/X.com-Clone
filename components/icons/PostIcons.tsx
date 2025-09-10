
import React from 'react';

type IconProps = {
  className?: string;
};

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-2 hover:bg-x-blue/20 rounded-full cursor-pointer transition-colors duration-200">
        {children}
    </div>
);

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
    <IconWrapper>
        <svg viewBox="0 0 24 24" className={className || "w-5 h-5 fill-current"}><g><path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22s-.39.08-.53.22l-4.32 4.32-1.57-1.57c-.28-.28-.76-.28-1.04 0l-4.18 4.18V4.25c0-.413.337-.75.75-.75zm15.5 17h-12.6l3.35-3.35 1.57 1.57c.28.28.76.28 1.04 0l4.32-4.32 3.82 3.82v1.53c0 .413-.337.75-.75.75zM8.5 8.5c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"></path></g></svg>
    </IconWrapper>
);

export const GifIcon: React.FC<IconProps> = ({ className }) => (
    <IconWrapper>
        <svg viewBox="0 0 24 24" className={className || "w-5 h-5 fill-current"}><g><path d="M3 3h2v2H3V3zm0 4h2v2H3V7zm0 4h2v2H3v-2zm0 4h2v2H3v-2zm4-8h2v2H7V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2z"></path><path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM20.5 20.5h-17v-17h17v17z"></path></g></svg>
    </IconWrapper>
);

export const PollIcon: React.FC<IconProps> = ({ className }) => (
    <IconWrapper>
        <svg viewBox="0 0 24 24" className={className || "w-5 h-5 fill-current"}><g><path d="M6 5c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2H6zm0-2h12c2.209 0 4 1.791 4 4v10c0 2.209-1.791 4-4 4H6c-2.209 0-4-1.791-4-4V7c0-2.209 1.791-4 4-4z"></path><path d="M6 7h2v8H6V7zm4 0h2v5h-2V7zm4 0h2v2h-2V7z"></path></g></svg>
    </IconWrapper>
);

export const EmojiIcon: React.FC<IconProps> = ({ className }) => (
    <IconWrapper>
        <svg viewBox="0 0 24 24" className={className || "w-5 h-5 fill-current"}><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M8.5 11.5c.828 0 1.5-.672 1.5-1.5S9.328 8.5 8.5 8.5 7 9.172 7 10s.672 1.5 1.5 1.5zm7 0c.828 0 1.5-.672 1.5-1.5S16.328 8.5 15.5 8.5 14 9.172 14 10s.672 1.5 1.5 1.5z"></path><path d="M16.143 14.122c-1.238 1.116-2.913 1.637-4.632 1.637s-3.394-.521-4.633-1.638c-.29-.26-.74-.22-1 .08-.27.29-.22.74.08 1 .49.44 1.05.79 1.66.99 1.25.42 2.62.64 4.02.64s2.77-.22 4.02-.64c.61-.2 1.17-.55 1.66-.99.3-.26.35-.71.08-1-.26-.3-.71-.34-1-.08z"></path></g></svg>
    </IconWrapper>
);

export const ScheduleIcon: React.FC<IconProps> = ({ className }) => (
    <IconWrapper>
        <svg viewBox="0 0 24 24" className={className || "w-5 h-5 fill-current"}><g><path d="M18 5h-2V3c0-1.105-.895-2-2-2s-2 .895-2 2v2H8V3c0-1.105-.895-2-2-2s-2 .895-2 2v2H2c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2zm-1 14H3V8h14v11z"></path><path d="M8.21 13.11l-2.05 2.05c-.293.293-.293.768 0 1.06l.88.88c.146.146.338.22.53.22s.384-.073.53-.22l2.05-2.05c.293-.293.293-.768 0-1.06l-.88-.88c-.293-.293-.768-.293-1.06 0zM12.5 10c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5zm0 7c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path></g></svg>
    </IconWrapper>
);

export const LocationIcon: React.FC<IconProps> = ({ className }) => (
    <IconWrapper>
        <svg viewBox="0 0 24 24" className={className || "w-5 h-5 fill-current"}><g><path d="M12 2C8.134 2 5 5.134 5 9c0 4.17 4.418 9.923 6.243 12.11.233.27.565.433.916.433s.683-.162.916-.434C14.582 18.923 19 13.17 19 9c0-3.866-3.134-7-7-7zm0 16.92C9.445 15.932 7 11.662 7 9c0-2.757 2.243-5 5-5s5 2.243 5 5c0 2.662-2.445 6.932-5 9.92z"></path><path d="M12 9c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm0 2.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5z"></path></g></svg>
    </IconWrapper>
);

// Post action icons
export const ReplyIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}><g><path d="M1.751 10.249c0-4.142 3.358-7.5 7.5-7.5h6.5c1.381 0 2.5 1.119 2.5 2.5s-1.119 2.5-2.5 2.5h-6.5c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5h2.5v4.5l6-4.5h1c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-1c-2.071 0-3.75-1.679-3.75-3.75s1.679-3.75 3.75-3.75h1c2.071 0 3.75 1.679 3.75 3.75s-1.679 3.75-3.75 3.75h-2.5v-4.5l-6 4.5h-1c-4.142 0-7.5-3.358-7.5-7.5z"></path></g></svg>
);
export const RetweetIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}><g><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.293.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.293.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.145.147.337.22.53.22s.383-.072.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.293-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"></path></g></svg>
);
export const LikeIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.754 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.223c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 6.036 11.52 8.55 11.622 2.513-.102 8.548-5.882 8.548-11.622 0-2.267-1.823-4.255-3.902-4.255-2.528 0-3.94 2.936-3.952 2.96-.23.562-1.156.562-1.387 0-.012-.024-1.424-2.96-3.952-2.96z"></path></g></svg>
);
export const LikedIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.754 0 6.376-7.454 13.11-10.037 13.157H12z"></path></g></svg>
);
export const ShareIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L7.71 9.71 6.3 8.29l5.7-5.7zM20 15v4c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-4H2v4c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-4h-2z"></path></g></svg>
);


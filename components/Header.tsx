import React, { useState } from 'react';
import type { User } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  user: User | null;
  isLoading?: boolean;
  apiKey: string | null;
  onApiKeyClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const UserProfile: React.FC<{ user: User }> = ({ user }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center focus:outline-none">
                <span className="hidden sm:inline-block text-right mr-3">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Học sinh</span>
                </span>
                <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="User avatar" />
            </button>
            {dropdownOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5"
                    onMouseLeave={() => setDropdownOpen(false)}
                >
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                    {/* Sign Out Button Removed */}
                </div>
            )}
        </div>
    );
};


export const Header: React.FC<HeaderProps> = ({ user, isLoading, apiKey, onApiKeyClick, theme, toggleTheme }) => {
    const hasApiKey = !!apiKey;
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center">
        <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {isLoading ? (
                 <div className="animate-pulse h-6 w-64 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            ) : (
                <>
                Chào mừng trở lại, {user ? user.name : 'bạn'}!
                <span className="hidden sm:inline"> Cùng chinh phục mục tiêu hôm nay nhé!</span>
                </>
            )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isLoading ? (
            <>
                <div className="animate-pulse h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="animate-pulse h-9 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg hidden sm:block"></div>
                <div className="animate-pulse h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </>
        ) : (
            <>
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                <button className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                </button>
                <button
                    onClick={onApiKeyClick}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500
                        ${hasApiKey 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    aria-label={hasApiKey ? "Cập nhật API KEY" : "Nhập API KEY"}
                >
                    {hasApiKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-2-4h.01M13 12h.01M11 12h.01M9 12h.01M4 7h2a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" />
                        </svg>
                    )}
                    <span className="hidden sm:inline">{hasApiKey ? 'API KEY Đã Lưu' : 'Nhập API KEY'}</span>
                </button>
                {user && <UserProfile user={user} />}
            </>
        )}
      </div>
    </header>
  );
};
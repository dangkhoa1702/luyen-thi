import React from 'react';

export const HeaderSkeleton: React.FC = () => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      {/* Left side: Welcome message */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-64"></div>
      
      {/* Right side: Icons and User Profile */}
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div> {/* Notification Bell */}
        <div className="h-9 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg hidden sm:block"></div> {/* API Key Button */}
        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div> {/* User Avatar */}
      </div>
    </header>
  );
};
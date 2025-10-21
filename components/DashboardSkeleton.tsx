import React from 'react';

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-300 dark:bg-gray-700 rounded-2xl ${className}`}></div>
);

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse w-full">
            {/* Top Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard className="h-36" />
                <SkeletonCard className="h-36" />
                <SkeletonCard className="h-36" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart */}
                    <SkeletonCard className="h-[26rem]" />
                    {/* Suggestions */}
                    <SkeletonCard className="h-56" />
                </div>

                <div className="space-y-6">
                    {/* Forecast */}
                    <SkeletonCard className="h-60" />
                    {/* Stat Cards */}
                    <SkeletonCard className="h-24" />
                    <SkeletonCard className="h-24" />
                    <SkeletonCard className="h-24" />
                </div>
            </div>
        </div>
    );
};
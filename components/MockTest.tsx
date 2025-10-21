import React from 'react';

/**
 * @deprecated This component is deprecated and has been replaced by MockExam2Subjects.
 * It is no longer used in the application and is slated for removal.
 */
export const MockTest: React.FC = () => {
  return (
    <div className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
      <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Component Deprecated</h2>
      <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
        The 'Luyện đề thi thử' component is no longer in use. Please use the unified 'Luyện đề (2 Môn)' feature instead.
      </p>
    </div>
  );
};

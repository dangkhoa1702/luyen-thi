import React, { useState } from 'react';

interface ApiKeyModalProps {
  currentApiKey: string | null;
  onKeySubmit: (apiKey: string) => void;
  onDismiss: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ currentApiKey, onKeySubmit, onDismiss }) => {
  const [apiKey, setApiKey] = useState('');
  const hasCurrentKey = !!currentApiKey;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {hasCurrentKey ? 'Cập nhật API Key' : 'Cài đặt API Key'}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {hasCurrentKey 
                ? 'Bạn có thể cập nhật API Key mới tại đây. Khóa cũ sẽ bị ghi đè.' 
                : 'Để sử dụng các tính năng AI, vui lòng nhập API Key của Google Gemini.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="api-key" className="sr-only">
                API Key
              </label>
              <input
                type="password"
                name="api-key"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={hasCurrentKey ? 'Nhập API Key mới' : 'Nhập API Key của bạn tại đây'}
                autoComplete="off"
              />
            </div>
             <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Bạn có thể lấy API Key miễn phí tại{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Google AI Studio
              </a>.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-3">
               <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50"
                disabled={!apiKey.trim()}
              >
                {hasCurrentKey ? 'Cập nhật' : 'Lưu và Tiếp tục'}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
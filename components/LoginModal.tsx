import React from 'react';

interface LoginModalProps {
  onDismiss: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm transform transition-all p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Yêu cầu đăng nhập</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Vui lòng đăng nhập bằng tài khoản Google của bạn để tiếp tục sử dụng các tính năng AI.
        </p>
        <div id="google-signin-button-container" className="mt-6 mb-4 flex justify-center">
          {/* Google Sign-In button will be rendered here by the GSI library */}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
        >
          Để sau
        </button>
      </div>
    </div>
  );
};
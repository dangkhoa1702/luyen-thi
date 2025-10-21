
import React from 'react';
import { BookOpen, BrainCircuit, Calendar, FileText, GraduationCap, MessageSquare, PieChart, Users } from 'lucide-react';
import type { ViewType } from '../types';

interface MainDashboardProps {
  setView: (view: ViewType) => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  view: ViewType;
  onClick: (view: ViewType) => void;
  className?: string;
}> = ({ icon, title, description, view, onClick, className = '' }) => (
  <button
    onClick={() => onClick(view)}
    className={`group flex flex-col items-start text-left bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 ${className}`}
  >
    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
    <span className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
      Bắt đầu →
    </span>
  </button>
);

export const MainDashboard: React.FC<MainDashboardProps> = ({ setView }) => {
  const iconClasses = "h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors";

  const mainFeatures = [
    {
      view: 'mock-exam-2' as ViewType,
      title: 'Luyện đề (2 Môn)',
      description: 'Thử sức với các đề thi mô phỏng, được chấm điểm và giải thích chi tiết.',
      icon: <FileText className={iconClasses} />,
      className: 'md:col-span-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
    {
      view: 'ai-tutor' as ViewType,
      title: 'Gia sư AI',
      description: 'Nhận hướng dẫn từng bước, giải đáp thắc mắc chuyên sâu theo yêu cầu.',
      icon: <GraduationCap className={iconClasses} />,
    },
    {
      view: 'learning-profile' as ViewType,
      title: 'Hồ sơ học tập',
      description: 'Phân tích điểm mạnh, điểm yếu và theo dõi tiến độ học tập của bạn.',
      icon: <PieChart className={iconClasses} />,
    },
    {
      view: 'planner' as ViewType,
      title: 'Kế hoạch học tập',
      description: 'Tạo và quản lý lộ trình học tập cá nhân hóa do AI đề xuất.',
      icon: <Calendar className={iconClasses} />,
    },
    {
      view: 'knowledge-base' as ViewType,
      title: 'Cẩm nang kiến thức',
      description: 'Tra cứu kiến thức cốt lõi, công thức quan trọng cho các môn học.',
      icon: <BookOpen className={iconClasses} />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bảng điều khiển chính</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Chọn một tính năng để bắt đầu hành trình chinh phục kỳ thi vào 10.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainFeatures.map((feature) => (
          <FeatureCard
            key={feature.view}
            view={feature.view}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onClick={setView}
            className={feature.className}
          />
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Các tính năng khác</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SecondaryFeatureButton title="Hỏi đáp AI" view="chatbot" onClick={setView} icon={<MessageSquare className="h-5 w-5" />} />
            <SecondaryFeatureButton title="Kế hoạch hôm nay" view="today-plan" onClick={setView} icon={<Calendar className="h-5 w-5" />} />
            <SecondaryFeatureButton title="Cộng đồng" view="community" onClick={setView} icon={<Users className="h-5 w-5" />} />
            <SecondaryFeatureButton title="Tài liệu" view="study-materials" onClick={setView} icon={<BrainCircuit className="h-5 w-5" />} />
        </div>
      </div>
    </div>
  );
};

const SecondaryFeatureButton: React.FC<{
    title: string;
    view: ViewType;
    onClick: (view: ViewType) => void;
    icon: React.ReactNode;
}> = ({ title, view, onClick, icon }) => (
    <button
        onClick={() => onClick(view)}
        className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
        <div className="text-gray-600 dark:text-gray-400">
            {icon}
        </div>
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
    </button>
)


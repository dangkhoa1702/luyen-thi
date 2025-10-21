
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import MainDashboard2 from './components/MainDashboard_2Subjects';
import { AIChatbot } from './components/AIChatbot';
import { StudyPlanner } from './components/StudyPlanner';
import { Community } from './components/Community';
import { Header } from './components/Header';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { ApiKeyModal } from './components/ApiKeyModal';
import { initializeAi } from './services/geminiService';
import type { ViewType, User } from './types';
import { KnowledgeBase } from './components/KnowledgeBase';
import { LearningProfile } from './components/LearningProfile';
// FIX: Changed the import to use the named export `DemoParentDashboard` and aliased it as `ParentDashboard` to resolve the module resolution error.
import { DemoParentDashboard as ParentDashboard } from './components/ParentDashboard';
import { StudyMaterials } from './components/StudyMaterials';
// FIX: Changed the import to use the named export `DemoTeacherDashboard` and aliased it as `TeacherDashboard` to resolve the module resolution error.
import { DemoTeacherDashboard as TeacherDashboard } from './components/TeacherDashboard';
import { DemoTodaysPlan as TodayPlan } from './components/TodayPlan';
import DailyReminder from './components/DailyReminder';
import GiaSuAI from './components/GiaSuAI';
import MockExam2Subjects from './components/MockExam2Subjects';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Set a default mock user to bypass login for non-profile features
  const mockUser: User = {
      id: 'default-user-01',
      name: 'Học sinh',
      email: 'hocsinh@aistudio.dev',
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Học+sinh`,
      role: 'student' // Added role for community features
  };
  const [user, setUser] = useState<User | null>(mockUser);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme as 'light' | 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Effect to load API key from localStorage on initial load
  useEffect(() => {
    try {
        const savedApiKey = localStorage.getItem('gemini-api-key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
            initializeAi(savedApiKey);
        }
    } catch (error) {
        console.error("Failed to parse API key from localStorage.", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
    initializeAi(newApiKey);
    localStorage.setItem('gemini-api-key', newApiKey);
    setShowApiKeyModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const requireAuthAndApi = useCallback((action: () => void) => {
    // User login is not required for most features, only check for API key
    // The new Learning Profile component handles its own auth state.
    if (!apiKey) {
        setPendingAction(() => action);
        setShowApiKeyModal(true);
        return;
    }
    action();
  }, [apiKey]);

  const handleSetView = (view: ViewType) => {
    if (view !== 'knowledge-base') {
        setSelectedSubject(null); // Clear subject when navigating away
        setSelectedTopic(null);
    }
    const protectedViews: ViewType[] = ['ai-tutor', 'chatbot', 'planner', 'knowledge-base', 'learning-profile', 'parent-dashboard', 'study-materials', 'teacher-dashboard', 'today-plan', 'daily-reminder', 'mock-exam-2'];
    if (protectedViews.includes(view)) {
      requireAuthAndApi(() => setCurrentView(view));
    } else {
      setCurrentView(view);
    }
  };
  
  const handleStartPractice = (subject: string, topic: string) => {
    requireAuthAndApi(() => {
        setSelectedSubject(subject);
        setSelectedTopic(topic);
        setCurrentView('mock-exam-2');
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <MainDashboard2 />;
      case 'mock-exam-2':
        return <MockExam2Subjects />;
      case 'ai-tutor':
        return <GiaSuAI />;
      case 'knowledge-base':
        return <KnowledgeBase subject={selectedSubject} onStartPractice={handleStartPractice} />;
      case 'chatbot':
        return <AIChatbot />;
      case 'planner':
        return <StudyPlanner />;
      case 'community':
        return <Community user={user} />;
      case 'learning-profile':
        // The LearningProfile component shows detailed stats and allows starting practice sessions.
        return <LearningProfile onStartPractice={handleStartPractice} />;
      case 'parent-dashboard':
        return <ParentDashboard />;
      case 'study-materials':
        return <StudyMaterials />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'today-plan':
        return <TodayPlan />;
      case 'daily-reminder':
        return <DailyReminder />;
      default:
        return <MainDashboard2 />;
    }
  };

  const cancelAndGoHome = () => {
    setShowApiKeyModal(false);
    setPendingAction(null);
    setCurrentView('dashboard');
  }

  return (
    <>
      {showApiKeyModal && (
        <ApiKeyModal
          currentApiKey={apiKey}
          onKeySubmit={handleApiKeySubmit}
          onDismiss={cancelAndGoHome}
        />
      )}
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
        <Sidebar currentView={currentView} setView={handleSetView} />
        <div className="flex-1 flex flex-col overflow-hidden">
           <Header 
              user={user} 
              isLoading={isLoading}
              apiKey={apiKey}
              onApiKeyClick={() => setShowApiKeyModal(true)} 
              theme={theme}
              toggleTheme={toggleTheme}
            />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
            {isLoading ? <DashboardSkeleton /> : renderContent()}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;
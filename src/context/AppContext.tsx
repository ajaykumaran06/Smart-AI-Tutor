import React, { createContext, useContext, useState, useEffect } from 'react';
import { TOPICS_DATA, TopicLesson } from '../data/topicsData';

export type ViewType =
  | 'dashboard'
  | 'learn'
  | 'tutor'
  | 'workbench'
  | 'visualizer'
  | 'simulator'
  | 'pipeline'
  | 'quizzes'
  | 'progress';

export interface QuizAttemptRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mode: 'practice' | 'assessment';
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: number;
  responses: {
    questionId: string;
    questionText: string;
    chosenIndex: number;
    correctIndex: number;
    isCorrect: boolean;
  }[];
}

export interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedTopicId: string;
  setSelectedTopicId: (id: string) => void;
  completedTopics: string[];
  toggleTopicCompletion: (id: string) => void;
  bookmarkedTopics: string[];
  toggleBookmark: (id: string) => void;
  quizAttempts: QuizAttemptRecord[];
  recordQuizAttempt: (attempt: Omit<QuizAttemptRecord, 'id' | 'timestamp'>) => void;
  tutorMode: 'beginner' | 'detailed' | 'exam';
  setTutorMode: (mode: 'beginner' | 'detailed' | 'exam') => void;
  tutorInitialPrompt: string;
  setTutorInitialPrompt: (prompt: string) => void;
  tutorAlgorithmContext: any;
  setTutorAlgorithmContext: (ctx: any) => void;
  getTopicMastery: (topicId: string) => number;
  getOverallMastery: () => number;
  getWeakTopics: () => TopicLesson[];
  getRecommendedTopic: () => TopicLesson;
  resetAllProgress: () => void;
  navigateToTopicInTool: (tool: ViewType, topicId?: string, prompt?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('intro-compilers');
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asct_completed_topics');
      return saved ? JSON.parse(saved) : ['intro-compilers'];
    } catch {
      return ['intro-compilers'];
    }
  });

  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asct_bookmarks');
      return saved ? JSON.parse(saved) : ['first-follow', 'll1-parsing'];
    } catch {
      return ['first-follow', 'll1-parsing'];
    }
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('asct_quiz_attempts');
      if (saved) return JSON.parse(saved);
      // Realistic initial baseline attempt so dashboard is warm & readable on initial launch
      return [
        {
          id: 'attempt-init-1',
          topicId: 'intro-compilers',
          topicTitle: 'Introduction to Compilers & Interpreters',
          difficulty: 'Easy',
          mode: 'practice',
          score: 1,
          totalQuestions: 1,
          percentage: 100,
          timestamp: Date.now() - 3600000 * 4,
          responses: [
            {
              questionId: 'q1',
              questionText: 'Which of the following is the primary advantage of a compiler over an interpreter?',
              chosenIndex: 1,
              correctIndex: 1,
              isCorrect: true,
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  });

  const [tutorMode, setTutorMode] = useState<'beginner' | 'detailed' | 'exam'>('beginner');
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string>('');
  const [tutorAlgorithmContext, setTutorAlgorithmContext] = useState<any>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('asct_completed_topics', JSON.stringify(completedTopics));
    } catch (e) {
      console.error(e);
    }
  }, [completedTopics]);

  useEffect(() => {
    try {
      localStorage.setItem('asct_bookmarks', JSON.stringify(bookmarkedTopics));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedTopics]);

  useEffect(() => {
    try {
      localStorage.setItem('asct_quiz_attempts', JSON.stringify(quizAttempts));
    } catch (e) {
      console.error(e);
    }
  }, [quizAttempts]);

  const toggleTopicCompletion = (id: string) => {
    setCompletedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const recordQuizAttempt = (attemptData: Omit<QuizAttemptRecord, 'id' | 'timestamp'>) => {
    const newAttempt: QuizAttemptRecord = {
      ...attemptData,
      id: `attempt-${Date.now()}`,
      timestamp: Date.now(),
    };
    setQuizAttempts(prev => [newAttempt, ...prev]);

    // If score >= 70%, mark topic as completed if not already
    if (newAttempt.percentage >= 70 && !completedTopics.includes(attemptData.topicId)) {
      setCompletedTopics(prev => [...prev, attemptData.topicId]);
    }
  };

  // Transparent topic mastery formula:
  // Quiz accuracy (70%) + Completion bonus (30%)
  const getTopicMastery = (topicId: string): number => {
    const attempts = quizAttempts.filter(a => a.topicId === topicId);
    const isCompleted = completedTopics.includes(topicId);

    let quizScorePart = 0;
    if (attempts.length > 0) {
      const avgPercentage =
        attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length;
      quizScorePart = avgPercentage * 0.7;
    } else {
      quizScorePart = isCompleted ? 40 : 0;
    }

    const completionPart = isCompleted ? 30 : 0;
    return Math.min(100, Math.round(quizScorePart + completionPart));
  };

  const getOverallMastery = (): number => {
    const totalTopics = TOPICS_DATA.length;
    if (totalTopics === 0) return 0;
    const sum = TOPICS_DATA.reduce((acc, t) => acc + getTopicMastery(t.id), 0);
    return Math.round(sum / totalTopics);
  };

  const getWeakTopics = (): TopicLesson[] => {
    // Topics with quiz attempts where accuracy is < 65%, or topics attempted multiple times with errors
    const topicScores: Record<string, { total: number; correct: number }> = {};
    for (const a of quizAttempts) {
      if (!topicScores[a.topicId]) topicScores[a.topicId] = { total: 0, correct: 0 };
      topicScores[a.topicId].total += a.totalQuestions;
      topicScores[a.topicId].correct += a.score;
    }

    const weakIds = Object.keys(topicScores).filter(tid => {
      const { total, correct } = topicScores[tid];
      return total > 0 && correct / total < 0.65;
    });

    if (weakIds.length > 0) {
      return TOPICS_DATA.filter(t => weakIds.includes(t.id));
    }

    // Fallback: topics not completed yet
    return TOPICS_DATA.filter(t => !completedTopics.includes(t.id)).slice(0, 3);
  };

  const getRecommendedTopic = (): TopicLesson => {
    const weak = getWeakTopics();
    if (weak.length > 0) return weak[0];

    // Next uncompleted topic
    const uncompleted = TOPICS_DATA.find(t => !completedTopics.includes(t.id));
    return uncompleted || TOPICS_DATA[0];
  };

  const resetAllProgress = () => {
    setCompletedTopics([]);
    setBookmarkedTopics([]);
    setQuizAttempts([]);
    localStorage.removeItem('asct_completed_topics');
    localStorage.removeItem('asct_bookmarks');
    localStorage.removeItem('asct_quiz_attempts');
  };

  const navigateToTopicInTool = (tool: ViewType, topicId?: string, prompt?: string) => {
    if (topicId) setSelectedTopicId(topicId);
    if (prompt) setTutorInitialPrompt(prompt);
    setCurrentView(tool);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedTopicId,
        setSelectedTopicId,
        completedTopics,
        toggleTopicCompletion,
        bookmarkedTopics,
        toggleBookmark,
        quizAttempts,
        recordQuizAttempt,
        tutorMode,
        setTutorMode,
        tutorInitialPrompt,
        setTutorInitialPrompt,
        tutorAlgorithmContext,
        setTutorAlgorithmContext,
        getTopicMastery,
        getOverallMastery,
        getWeakTopics,
        getRecommendedTopic,
        resetAllProgress,
        navigateToTopicInTool,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

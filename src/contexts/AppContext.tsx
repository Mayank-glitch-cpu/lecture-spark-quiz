
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockActiveQuestion, mockDashboard, mockSession, mockUpcomingQuestions } from '../data/mockData';
import { Dashboard, QuizQuestion, QuizResponse, Role, Session } from '../types';

type AppContextType = {
  role: Role;
  setRole: (role: Role) => void;
  session: Session | null;
  dashboard: Dashboard | null;
  activeQuestion: QuizQuestion | null;
  upcomingQuestions: QuizQuestion[];
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;
  submitQuizResponse: (response: Omit<QuizResponse, 'id' | 'timestamp'>) => void;
  responseSubmitted: boolean;
  generateNewQuestion: () => void;
  nextQuestionTime: number | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("student");
  const [session, setSession] = useState<Session | null>(mockSession);
  const [dashboard, setDashboard] = useState<Dashboard | null>(mockDashboard);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(mockActiveQuestion);
  const [upcomingQuestions, setUpcomingQuestions] = useState<QuizQuestion[]>(mockUpcomingQuestions);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [nextQuestionTime, setNextQuestionTime] = useState<number | null>(
    mockSession ? Date.now() + mockSession.quizFrequencyMinutes * 60 * 1000 : null
  );
  
  const submitQuizResponse = (response: Omit<QuizResponse, 'id' | 'timestamp'>) => {
    const newResponse = {
      ...response,
      id: `r${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, this would be sent to Supabase
    console.log("Quiz response submitted:", newResponse);
    setResponseSubmitted(true);
    
    // Update local state to reflect the new response
    if (dashboard) {
      setDashboard({
        ...dashboard,
        studentResponses: [...dashboard.studentResponses, newResponse],
        participationRate: Math.min(100, dashboard.participationRate + 5),
        correctAnswerRate: newResponse.isCorrect 
          ? Math.min(100, dashboard.correctAnswerRate + 3) 
          : Math.max(0, dashboard.correctAnswerRate - 2)
      });
    }

    // After 3 seconds, reset the quiz state
    setTimeout(() => {
      setIsQuizActive(false);
      setResponseSubmitted(false);
    }, 3000);
  };

  const generateNewQuestion = () => {
    if (upcomingQuestions.length > 0) {
      // In a real app, this would trigger an API call to generate a new question
      const nextQuestion = upcomingQuestions[0];
      setActiveQuestion(nextQuestion);
      setUpcomingQuestions(upcomingQuestions.slice(1));
      setIsQuizActive(true);
      
      // Update next question time
      if (session) {
        setNextQuestionTime(Date.now() + session.quizFrequencyMinutes * 60 * 1000);
      }
      
      // Simulate updating dashboard
      if (dashboard) {
        setDashboard({
          ...dashboard,
          activeQuestion: nextQuestion,
        });
      }

      console.log("New question generated:", nextQuestion);
    } else {
      console.log("No more questions in queue");
    }
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      session,
      dashboard,
      activeQuestion,
      upcomingQuestions,
      isQuizActive,
      setIsQuizActive,
      submitQuizResponse,
      responseSubmitted,
      generateNewQuestion,
      nextQuestionTime,
    }}>
      {children}
    </AppContext.Provider>
  );
};

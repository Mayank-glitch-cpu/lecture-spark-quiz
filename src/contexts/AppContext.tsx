import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockActiveQuestion, mockDashboard, mockSession, mockUpcomingQuestions } from '../data/mockData';
import { Dashboard, QuizQuestion, QuizResponse, Role, Session } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { fetchLatestMCQ, mapMCQToQuizQuestion } from '@/services/mcqService';

type AppContextType = {
  session: Session | null;
  dashboard: Dashboard | null;
  activeQuestion: QuizQuestion | null;
  upcomingQuestions: QuizQuestion[];
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;
  submitQuizResponse: (response: Omit<QuizResponse, 'id' | 'timestamp'>) => void;
  responseSubmitted: boolean;
  generateNewQuestion: () => void;
  fetchGeminiQuestion: () => Promise<void>;
  nextQuestionTime: number | null;
  role: Role;
  setRole: (role: Role) => void;
  loading: boolean;
  // Auto quiz settings
  autoQuizEnabled: boolean;
  setAutoQuizEnabled: (enabled: boolean) => void;
  quizIntervalMinutes: number;
  setQuizIntervalMinutes: (minutes: number) => Promise<void>;
  timeUntilNextQuiz: number | null;
  generateQuizFromTranscript: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Auto quiz settings
  const [autoQuizEnabled, setAutoQuizEnabled] = useState(false);
  const [quizIntervalMinutes, setQuizIntervalMinutesState] = useState(10);
  const [timeUntilNextQuiz, setTimeUntilNextQuiz] = useState<number | null>(
    mockSession ? Date.now() + mockSession.quizFrequencyMinutes * 60 * 1000 : null
  );
  
  // Update quiz interval
  const setQuizIntervalMinutes = async (minutes: number) => {
    setQuizIntervalMinutesState(minutes);
    // Recalculate next question time
    setTimeUntilNextQuiz(Date.now() + minutes * 60 * 1000);
    
    // In a full implementation, this would update the session in the database
    if (session) {
      setSession({
        ...session,
        quizFrequencyMinutes: minutes
      });
    }
    
    toast({
      title: "Quiz interval updated",
      description: `Questions will now be generated every ${minutes} minutes`,
    });
    
    return Promise.resolve();
  };
  
  // Submit quiz response function
  const submitQuizResponse = (response: Omit<QuizResponse, 'id' | 'timestamp'>) => {
    const newResponse = {
      ...response,
      id: `r${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    // In a full implementation, this would be sent to Supabase
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

  // Generate new question function
  const generateNewQuestion = () => {
    if (upcomingQuestions.length > 0) {
      // In a full implementation, this would trigger an API call
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

  // Fetch Gemini-generated question from API
  const fetchGeminiQuestion = async () => {
    try {
      setLoading(true);
      const mcqQuestion = await fetchLatestMCQ();
      const quizQuestion = mapMCQToQuizQuestion(mcqQuestion);
      
      // Set as active question and show it
      setActiveQuestion(quizQuestion);
      setIsQuizActive(true);
      
      // Update dashboard
      if (dashboard) {
        setDashboard({
          ...dashboard,
          activeQuestion: quizQuestion,
        });
      }
      
      // Update next question time
      if (session) {
        setNextQuestionTime(Date.now() + session.quizFrequencyMinutes * 60 * 1000);
      }
      
      setLoading(false);
      
      toast({
        title: "New question available",
        description: "A new quiz question has been generated from the lecture content.",
      });
      
      return quizQuestion;
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch Gemini question:", error);
      toast({
        title: "Error fetching question",
        description: "Failed to load the generated question. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate quiz from transcript (alias for fetchGeminiQuestion)
  const generateQuizFromTranscript = fetchGeminiQuestion;

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
      fetchGeminiQuestion,
      nextQuestionTime,
      loading,
      // Auto quiz settings
      autoQuizEnabled,
      setAutoQuizEnabled,
      quizIntervalMinutes,
      setQuizIntervalMinutes,
      timeUntilNextQuiz,
      generateQuizFromTranscript
    }}>
      {children}
    </AppContext.Provider>
  );
};

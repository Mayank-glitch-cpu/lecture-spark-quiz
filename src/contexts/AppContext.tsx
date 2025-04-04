
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { mockActiveQuestion, mockDashboard, mockSession, mockUpcomingQuestions } from '../data/mockData';
import { Dashboard, QuizQuestion, QuizResponse, Role, Session, User } from '../types';
import { useToast } from '@/components/ui/use-toast';

type AppContextType = {
  user: User | null;
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
  role: Role;
  setRole: (role: Role) => void;
  loading: boolean;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Authentication effect
  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      
      // Get initial session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          name: currentSession.user.user_metadata.display_name || currentSession.user.email,
        });

        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (profile) {
          setRole(profile.role as Role);
        }
      }
      
      setLoading(false);
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, authSession) => {
          if (event === 'SIGNED_IN' && authSession?.user) {
            setUser({
              id: authSession.user.id,
              email: authSession.user.email,
              name: authSession.user.user_metadata.display_name || authSession.user.email,
            });

            // Get user profile to determine role
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authSession.user.id)
              .single();

            if (profile) {
              setRole(profile.role as Role);
            }
            
            toast({
              title: "Welcome back!",
              description: "You are now signed in.",
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      
      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
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

  return (
    <AppContext.Provider value={{
      user,
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
      loading,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

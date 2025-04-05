
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Dashboard, QuizQuestion, QuizResponse, Role, Session, User } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError, User as SupabaseUser } from '@supabase/supabase-js';
import { fetchLatestMCQ, mapMCQToQuizQuestion } from '@/services/mcqService';

// Define a type for profile data from Supabase
type Profile = {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  role: Role;
  created_at?: string | null;
  updated_at?: string | null;
};

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
  fetchGeminiQuestion: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);
  const [upcomingQuestions, setUpcomingQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [nextQuestionTime, setNextQuestionTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Authentication effect
  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, authSession) => {
          if (event === 'SIGNED_IN' && authSession?.user) {
            setUser({
              id: authSession.user.id,
              email: authSession.user.email,
              name: authSession.user.user_metadata.display_name || authSession.user.email,
            });
            
            // Fetch profile after state update with setTimeout to avoid authentication deadlock
            setTimeout(async () => {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authSession.user.id)
                .single();

              if (profile && !error) {
                setRole(profile.role as Role);
              }
              
              toast({
                title: "Welcome back!",
                description: "You are now signed in.",
              });
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      
      // THEN check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          name: currentSession.user.user_metadata.display_name || currentSession.user.email,
        });

        // Get user profile to determine role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profile && !error) {
          setRole(profile.role as Role);
        }
      }
      
      setLoading(false);
      
      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  // Fetch session data from Supabase
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch latest active session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          return;
        }
        
        if (sessionData) {
          // Transform the Supabase session format to our application format
          const currentSession: Session = {
            id: sessionData.id,
            title: sessionData.title,
            professorId: sessionData.professor_id,
            startTime: sessionData.start_time,
            endTime: sessionData.end_time || undefined,
            quizFrequencyMinutes: sessionData.quiz_frequency_minutes,
            topicTags: sessionData.topic_tags || [],
            questions: [],
            activeStudents: 0 // Will be updated below
          };
          
          // Count active students
          const { count, error: countError } = await supabase
            .from('session_students')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionData.id);
            
          if (!countError && count !== null) {
            currentSession.activeStudents = count;
          }
          
          // Fetch questions for this session
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('session_id', sessionData.id)
            .order('created_at', { ascending: false });
            
          if (!questionsError && questions) {
            // Transform questions to our format
            currentSession.questions = questions.map(q => ({
              id: q.id,
              question: q.question,
              options: Array.isArray(q.options) ? q.options : [],
              correctOptionIndex: q.correct_option_index,
              topicTag: q.topic_tag || undefined,
              timestamp: q.created_at,
              transcriptSegment: q.transcript_segment || undefined
            }));
            
            // Set active question if there's at least one
            if (currentSession.questions.length > 0) {
              setActiveQuestion(currentSession.questions[0]);
            }
            
            // Set upcoming questions (all except the first one)
            if (currentSession.questions.length > 1) {
              setUpcomingQuestions(currentSession.questions.slice(1));
            }
          }
          
          setSession(currentSession);
          
          // Set next quiz time based on frequency
          if (currentSession.quizFrequencyMinutes > 0) {
            setNextQuestionTime(Date.now() + currentSession.quizFrequencyMinutes * 60 * 1000);
          }
          
          // Fetch responses for the active question
          if (currentSession.questions.length > 0) {
            const activeQuestionId = currentSession.questions[0].id;
            const { data: responses, error: responsesError } = await supabase
              .from('responses')
              .select('*')
              .eq('question_id', activeQuestionId);
              
            if (!responsesError && responses) {
              // Transform responses to our format
              const formattedResponses: QuizResponse[] = responses.map(r => ({
                id: r.id,
                questionId: r.question_id,
                studentId: r.student_id,
                selectedOptionIndex: r.selected_option_index,
                isCorrect: r.is_correct,
                responseTime: r.response_time,
                timestamp: r.created_at
              }));
              
              // Fetch student data
              const { data: studentProfiles, error: studentsError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', responses.map(r => r.student_id));
                
              if (!studentsError && studentProfiles) {
                // Build dashboard data
                const dashboardData: Dashboard = {
                  session: currentSession,
                  activeQuestion: currentSession.questions[0],
                  studentResponses: formattedResponses,
                  students: studentProfiles.map(s => {
                    const studentResponses = formattedResponses.filter(r => r.studentId === s.id);
                    return {
                      id: s.id,
                      name: s.display_name || 'Anonymous',
                      responses: studentResponses,
                      attentionScore: 85 // Default value, would be calculated from engagement data
                    };
                  }),
                  participationRate: Math.round((formattedResponses.length / currentSession.activeStudents) * 100) || 0,
                  correctAnswerRate: Math.round((formattedResponses.filter(r => r.isCorrect).length / formattedResponses.length) * 100) || 0,
                  attentionOverTime: [] // Would be populated from engagement data
                };
                
                // Fetch attention data points
                const { data: engagementData, error: engagementError } = await supabase
                  .from('engagement')
                  .select('*')
                  .eq('session_id', sessionData.id)
                  .order('timestamp', { ascending: true });
                  
                if (!engagementError && engagementData) {
                  // Group by 5-minute intervals and average the scores
                  const timePoints: {[key: string]: number[]} = {};
                  
                  engagementData.forEach(point => {
                    const date = new Date(point.timestamp);
                    const timeKey = `${String(date.getHours()).padStart(2, '0')}:${String(Math.floor(date.getMinutes() / 5) * 5).padStart(2, '0')}`;
                    
                    if (!timePoints[timeKey]) {
                      timePoints[timeKey] = [];
                    }
                    
                    timePoints[timeKey].push(point.attention_score);
                  });
                  
                  dashboardData.attentionOverTime = Object.keys(timePoints).map(time => ({
                    time,
                    score: Math.round(timePoints[time].reduce((sum, score) => sum + score, 0) / timePoints[time].length)
                  })).sort((a, b) => a.time.localeCompare(b.time));
                }
                
                setDashboard(dashboardData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error setting up session data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load session data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [user]);

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
  const submitQuizResponse = async (response: Omit<QuizResponse, 'id' | 'timestamp'>) => {
    try {
      // Add response to Supabase
      const { data: newResponse, error } = await supabase
        .from('responses')
        .insert({
          question_id: response.questionId,
          student_id: user?.id || response.studentId, // Use logged in user if available
          selected_option_index: response.selectedOptionIndex,
          is_correct: response.isCorrect,
          response_time: response.responseTime
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      const formattedResponse: QuizResponse = {
        id: newResponse.id,
        questionId: newResponse.question_id,
        studentId: newResponse.student_id,
        selectedOptionIndex: newResponse.selected_option_index,
        isCorrect: newResponse.is_correct,
        responseTime: newResponse.response_time,
        timestamp: newResponse.created_at
      };
      
      console.log("Quiz response submitted:", formattedResponse);
      setResponseSubmitted(true);
      
      // Update local state to reflect the new response
      if (dashboard) {
        const updatedResponses = [...dashboard.studentResponses, formattedResponse];
        const correctResponses = updatedResponses.filter(r => r.isCorrect).length;
        
        setDashboard({
          ...dashboard,
          studentResponses: updatedResponses,
          participationRate: Math.min(100, Math.round((updatedResponses.length / (dashboard.session.activeStudents || 1)) * 100)),
          correctAnswerRate: Math.min(100, Math.round((correctResponses / updatedResponses.length) * 100))
        });
      }
  
      // After 3 seconds, reset the quiz state
      setTimeout(() => {
        setIsQuizActive(false);
        setResponseSubmitted(false);
      }, 3000);
      
      toast({
        title: "Response submitted",
        description: response.isCorrect ? "Your answer is correct!" : "Your answer is incorrect.",
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error submitting response",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate new question function
  const generateNewQuestion = async () => {
    if (!session) {
      toast({
        title: "No active session",
        description: "There is no active session to generate questions for.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (upcomingQuestions.length > 0) {
        // Use existing upcoming question
        const nextQuestion = upcomingQuestions[0];
        setActiveQuestion(nextQuestion);
        setUpcomingQuestions(upcomingQuestions.slice(1));
        setIsQuizActive(true);
        
        // Update next question time
        if (session) {
          setNextQuestionTime(Date.now() + session.quizFrequencyMinutes * 60 * 1000);
        }
        
        // Update dashboard
        if (dashboard) {
          setDashboard({
            ...dashboard,
            activeQuestion: nextQuestion,
          });
        }
  
        console.log("New question generated:", nextQuestion);
      } else {
        // No more questions, try to fetch from API
        await fetchGeminiQuestion();
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        title: "Error generating question",
        description: "Failed to generate a new question. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch Gemini-generated question from API
  const fetchGeminiQuestion = async () => {
    if (!session) {
      toast({
        title: "No active session",
        description: "There is no active session to generate questions for.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const mcqQuestion = await fetchLatestMCQ();
      const quizQuestion = mapMCQToQuizQuestion(mcqQuestion);
      
      // Add question to database
      const { data: newQuestion, error } = await supabase
        .from('questions')
        .insert({
          session_id: session.id,
          question: quizQuestion.question,
          options: quizQuestion.options,
          correct_option_index: quizQuestion.correctOptionIndex,
          topic_tag: quizQuestion.topicTag || null,
          transcript_segment: quizQuestion.transcriptSegment || null
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Format new question
      const formattedQuestion: QuizQuestion = {
        id: newQuestion.id,
        question: newQuestion.question,
        options: Array.isArray(newQuestion.options) ? newQuestion.options : [],
        correctOptionIndex: newQuestion.correct_option_index,
        timestamp: newQuestion.created_at,
        topicTag: newQuestion.topic_tag || undefined,
        transcriptSegment: newQuestion.transcript_segment || undefined
      };
      
      // Set as active question and show it
      setActiveQuestion(formattedQuestion);
      setIsQuizActive(true);
      
      // Update dashboard
      if (dashboard) {
        setDashboard({
          ...dashboard,
          activeQuestion: formattedQuestion,
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
      
      return formattedQuestion;
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
      fetchGeminiQuestion,
      nextQuestionTime,
      loading,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

import { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import ZoomIntegration from "../ZoomIntegration";
import QuizPopup from "./QuizPopup";
import { Bell } from "lucide-react";

const StudentView = () => {
  const { 
    isQuizActive, 
    setIsQuizActive, 
    activeQuestion, 
    responseSubmitted, 
    nextQuestionTime,
    generateNewQuestion 
  } = useApp();
  
  const [timeToNext, setTimeToNext] = useState<number | null>(null);
  const [initialQuizShown, setInitialQuizShown] = useState<boolean>(false);
  
  // Initial quiz popup after 10 seconds
  useEffect(() => {
    if (!initialQuizShown && activeQuestion) {
      const timer = setTimeout(() => {
        setIsQuizActive(true);
        setInitialQuizShown(true);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [initialQuizShown, activeQuestion, setIsQuizActive]);
  
  // Display a countdown for the initial quiz
  const [initialCountdown, setInitialCountdown] = useState<number>(10);
  
  useEffect(() => {
    if (!initialQuizShown && activeQuestion && initialCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setInitialCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [initialQuizShown, activeQuestion, initialCountdown]);
  
  useEffect(() => {
    if (!nextQuestionTime) return;
    
    const updateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, nextQuestionTime - now);
      setTimeToNext(Math.floor(remaining / 1000));
      
      // Auto-trigger quiz when timer hits zero
      if (remaining <= 0 && !isQuizActive && !responseSubmitted) {
        setIsQuizActive(true);
      }
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [nextQuestionTime, isQuizActive, responseSubmitted, setIsQuizActive]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Current Lecture</h2>
          {!initialQuizShown && !isQuizActive && activeQuestion && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
              <Bell className="h-3 w-3 mr-1 animate-pulse" />
              Quiz starting in {initialCountdown} seconds
            </div>
          )}
          {timeToNext && timeToNext > 0 && !isQuizActive && initialQuizShown && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              timeToNext < 60 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Bell className="h-3 w-3 mr-1" />
              Next quiz in {formatTime(timeToNext)}
            </div>
          )}
        </div>
        
        <ZoomIntegration />
        
        {isQuizActive && activeQuestion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
            <QuizPopup question={activeQuestion} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentView;


import { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import QuizPopup from "./QuizPopup";
import { Bell, BookOpen, Watch } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

const StudentView = () => {
  const { 
    isQuizActive, 
    setIsQuizActive, 
    activeQuestion, 
    responseSubmitted, 
    nextQuestionTime 
  } = useApp();
  
  const [timeToNext, setTimeToNext] = useState<number | null>(null);
  
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Current Lecture</h2>
          <div className="flex items-center gap-2">
            {timeToNext && timeToNext > 0 && !isQuizActive && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                timeToNext < 60 ? 'bg-orange-100 text-orange-800 animate-pulse' : 'bg-gray-100 text-gray-600'
              }`}>
                <Bell className="h-3.5 w-3.5 mr-1" />
                Next quiz in {formatTime(timeToNext)}
              </div>
            )}
            <Badge variant="default" className="bg-quiz-mint text-white flex items-center gap-1.5">
              <Watch className="h-3.5 w-3.5" />
              <span>Zoom Recording Active</span>
            </Badge>
          </div>
        </div>
        
        <Card className="border-quiz-lavender/30 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-quiz-lavender/20">
                <BookOpen className="h-6 w-6 text-quiz-purple" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Advanced Programming Concepts</h3>
                <p className="text-gray-500 text-sm">Object-Oriented Programming, Data Structures</p>
              </div>
            </div>
            
            <p className="text-gray-600 border-l-4 border-quiz-lavender/60 pl-4 py-2 bg-quiz-lavender/5 rounded-r-md italic mb-4">
              "Today we're discussing key principles of object-oriented programming. Encapsulation is one of the fundamental concepts where we hide the internal state and implementation details of an object and only expose what's necessary through well-defined interfaces."
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>7 students attending</div>
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Live session
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isQuizActive && activeQuestion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <QuizPopup question={activeQuestion} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentView;


import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { QuizQuestion } from "../../types";
import Confetti from "./Confetti";

interface QuizPopupProps {
  question: QuizQuestion;
}

const QuizPopup = ({ question }: QuizPopupProps) => {
  const { submitQuizResponse, responseSubmitted, user } = useApp();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || showFeedback) return;

    const isCorrect = selectedOption === question.correctOptionIndex;
    const responseTime = (Date.now() - startTime) / 1000; // in seconds

    submitQuizResponse({
      questionId: question.id,
      studentId: user?.id || "anonymous", // Use the current user ID if available
      selectedOptionIndex: selectedOption,
      isCorrect,
      responseTime,
    });

    setShowFeedback(true);
    
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => {
      clearInterval(timer);
      setShowFeedback(false);
      setSelectedOption(null);
    };
  }, [question.id, startTime]);

  return (
    <Card className="quiz-shadow w-full max-w-lg p-6 bg-white rounded-xl animate-fade-in">
      {showConfetti && <Confetti />}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-quiz-lavender text-quiz-purple rounded-full">
            {question.topicTag || "Pop Quiz"}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {timeElapsed}s
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">{question.question}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => (
          <div
            key={i}
            className={`quiz-option group transition-all duration-200 ${
              selectedOption === i ? "selected" : ""
            } ${
              showFeedback && i === question.correctOptionIndex
                ? "correct"
                : ""
            } ${
              showFeedback && selectedOption === i && i !== question.correctOptionIndex
                ? "incorrect"
                : ""
            } flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
              selectedOption === i ? "border-quiz-purple bg-quiz-lavender/10" : "border-gray-200"
            } ${
              showFeedback && i === question.correctOptionIndex ? "border-quiz-mint bg-green-50" : ""
            } ${
              showFeedback && selectedOption === i && i !== question.correctOptionIndex ? "border-red-300 bg-red-50" : ""
            }`}
            onClick={() => handleOptionSelect(i)}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 transition-all">
              {showFeedback && i === question.correctOptionIndex && (
                <CheckCircle className="h-5 w-5 text-quiz-mint" />
              )}
              {showFeedback && selectedOption === i && i !== question.correctOptionIndex && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {!showFeedback && selectedOption === i && (
                <div className="w-3 h-3 rounded-full bg-quiz-purple" />
              )}
            </div>
            <span className="flex-1">{option}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        {!showFeedback ? (
          <Button 
            disabled={selectedOption === null}
            onClick={handleSubmit}
            className="bg-quiz-purple hover:bg-purple-800 transition-all"
          >
            Submit Answer
          </Button>
        ) : (
          <div className="text-sm font-medium text-gray-500">
            {selectedOption === question.correctOptionIndex ? (
              <span className="flex items-center text-quiz-mint">
                <CheckCircle className="h-4 w-4 mr-1" /> Correct Answer!
              </span>
            ) : (
              <span className="flex items-center text-red-500">
                <XCircle className="h-4 w-4 mr-1" /> Try Again Next Time
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuizPopup;

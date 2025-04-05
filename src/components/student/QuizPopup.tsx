
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, XCircle } from "lucide-react";
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
    return () => {
      setShowFeedback(false);
      setSelectedOption(null);
    };
  }, [question.id]);

  return (
    <Card className="quiz-shadow w-full max-w-lg p-6 bg-white rounded-xl animate-fade-in">
      {showConfetti && <Confetti />}
      
      <div className="mb-6">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-quiz-lavender text-quiz-purple rounded-full mb-3">
          {question.topicTag || "Pop Quiz"}
        </span>
        <h3 className="text-lg font-medium mb-2">{question.question}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => (
          <div
            key={i}
            className={`quiz-option ${
              selectedOption === i ? "selected" : ""
            } ${
              showFeedback && i === question.correctOptionIndex
                ? "correct"
                : ""
            } ${
              showFeedback && selectedOption === i && i !== question.correctOptionIndex
                ? "incorrect"
                : ""
            }`}
            onClick={() => handleOptionSelect(i)}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2">
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
            <span>{option}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        {!showFeedback ? (
          <Button 
            disabled={selectedOption === null}
            onClick={handleSubmit}
            className="bg-quiz-purple hover:bg-purple-800"
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

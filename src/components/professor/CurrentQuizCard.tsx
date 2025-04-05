
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { QuizQuestion, QuizResponse } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle, Clock, HelpCircle, Sparkles, XCircle } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

interface CurrentQuizCardProps {
  activeQuestion: QuizQuestion | undefined;
  responses: QuizResponse[];
}

const CurrentQuizCard = ({ activeQuestion, responses }: CurrentQuizCardProps) => {
  const { generateNewQuestion, fetchGeminiQuestion, loading } = useApp();

  if (!activeQuestion) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Current Quiz</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
          <HelpCircle className="h-10 w-10 mb-2 text-gray-300" />
          <p>No active quiz question</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={generateNewQuestion}
            className="w-full"
          >
            Generate Quiz Question
          </Button>
          <Button 
            onClick={fetchGeminiQuestion} 
            variant="outline" 
            className="w-full flex items-center gap-2"
            disabled={loading}
          >
            <Sparkles className="h-4 w-4" />
            Generate from Lecture Transcript
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const correctResponses = responses.filter(r => r.isCorrect).length;
  const incorrectResponses = responses.length - correctResponses;
  const averageResponseTime = responses.length > 0
    ? responses.reduce((acc, r) => acc + r.responseTime, 0) / responses.length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">Current Quiz</CardTitle>
          {activeQuestion.topicTag && (
            <Badge variant="outline" className="bg-quiz-lavender/20 text-quiz-purple">
              {activeQuestion.topicTag}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-medium mb-3">{activeQuestion.question}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {activeQuestion.options.map((option, i) => (
            <div 
              key={i}
              className={`p-2 text-sm border rounded-md ${
                i === activeQuestion.correctOptionIndex 
                  ? "border-quiz-mint bg-green-50" 
                  : "border-gray-200"
              }`}
            >
              {i === activeQuestion.correctOptionIndex && (
                <CheckCircle className="h-3.5 w-3.5 inline-block mr-1 text-quiz-mint" />
              )}
              {option}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold">{responses.length}</div>
            <div className="text-xs text-gray-500">Responses</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-quiz-mint" />
              {correctResponses}/{responses.length}
            </div>
            <div className="text-xs text-gray-500">Correct</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              {averageResponseTime.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-500">Avg. Time</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          onClick={fetchGeminiQuestion} 
          variant="outline" 
          className="w-full flex items-center gap-2"
          disabled={loading}
        >
          <Sparkles className="h-4 w-4" />
          Generate New Question from Lecture
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CurrentQuizCard;

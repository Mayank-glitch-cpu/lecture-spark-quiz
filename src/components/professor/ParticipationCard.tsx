
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { CheckCircle, Users } from "lucide-react";

interface ParticipationCardProps {
  participationRate: number;
  correctAnswerRate: number;
}

const ParticipationCard = ({ participationRate, correctAnswerRate }: ParticipationCardProps) => {
  return (
    <Card className="border-quiz-lavender/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Quiz Participation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1.5 text-quiz-purple" />
                Participation Rate
              </span>
              <span className="font-medium">{participationRate}%</span>
            </div>
            <Progress value={participationRate} className="h-2">
              <div
                className="h-full bg-quiz-purple rounded-full transition-all duration-500"
                style={{ width: `${participationRate}%` }}
              ></div>
            </Progress>
            <div className="mt-1 text-xs text-gray-500">
              {Math.round(participationRate * 0.01 * 7)} of 7 students participated
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="flex items-center">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-quiz-mint" />
                Correct Answer Rate
              </span>
              <span className="font-medium">{correctAnswerRate}%</span>
            </div>
            <Progress value={correctAnswerRate} className="h-2 bg-gray-100">
              <div
                className="h-full bg-quiz-mint rounded-full transition-all duration-500"
                style={{ width: `${correctAnswerRate}%` }}
              ></div>
            </Progress>
            <div className="mt-1 text-xs text-gray-500">
              {Math.round(correctAnswerRate * 0.01 * 5)} of 5 responses correct
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipationCard;

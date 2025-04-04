
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface ParticipationCardProps {
  participationRate: number;
  correctAnswerRate: number;
}

const ParticipationCard = ({ participationRate, correctAnswerRate }: ParticipationCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Quiz Participation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Participation Rate</span>
              <span className="font-medium">{participationRate}%</span>
            </div>
            <Progress value={participationRate} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Correct Answer Rate</span>
              <span className="font-medium">{correctAnswerRate}%</span>
            </div>
            <Progress value={correctAnswerRate} className="h-2 bg-gray-100">
              <div
                className="h-full bg-quiz-mint rounded-full transition-all duration-500"
                style={{ width: `${correctAnswerRate}%` }}
              ></div>
            </Progress>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipationCard;

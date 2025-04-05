
import { useApp } from "../../contexts/AppContext";
import DashboardHeader from "./DashboardHeader";
import { Activity, BarChart3, Clock, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import AttentionChart from "./AttentionChart";
import ParticipationCard from "./ParticipationCard";
import StudentList from "./StudentList";
import CurrentQuizCard from "./CurrentQuizCard";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import AutoQuizSettings from "./AutoQuizSettings";

const ProfessorView = () => {
  const { dashboard, session } = useApp();
  
  if (!dashboard || !session) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No active session</h2>
          <p className="text-gray-500">Create a new session to start monitoring student engagement.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Active Students"
          value={session.activeStudents}
          icon={<Users className="h-5 w-5 text-quiz-purple" />}
          trend="up"
          trendValue="2"
        />
        <MetricCard
          title="Participation Rate"
          value={`${dashboard.participationRate}%`}
          icon={<Activity className="h-5 w-5 text-quiz-purple" />}
          trend={dashboard.participationRate > 70 ? "up" : "down"}
          trendValue="5%"
        />
        <MetricCard
          title="Next Quiz"
          value={session.quizFrequencyMinutes > 0 ? `${session.quizFrequencyMinutes}m` : "Manual"}
          icon={<Clock className="h-5 w-5 text-quiz-purple" />}
          description="Quiz frequency (automatic)"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <Card className="h-full border-quiz-mint/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="default" className="bg-quiz-mint text-white">
                  Zoom Recording Active
                </Badge>
                <Badge variant="outline" className="border-quiz-lavender/30 text-quiz-purple bg-quiz-lavender/10">
                  Object-Oriented Programming
                </Badge>
              </div>
              
              <p className="text-gray-600 border-l-4 border-quiz-lavender/60 pl-4 py-2 bg-quiz-lavender/5 rounded-r-md italic mb-4">
                "Today we're discussing key principles of object-oriented programming. Encapsulation is one of the fundamental concepts where we hide the internal state and implementation details of an object and only expose what's necessary through well-defined interfaces."
              </p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                <div className="flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Live session in progress
                </div>
                <div>Started 1 hour ago</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <CurrentQuizCard 
          activeQuestion={dashboard.activeQuestion} 
          responses={dashboard.studentResponses} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AttentionChart data={dashboard.attentionOverTime} />
        <ParticipationCard 
          participationRate={dashboard.participationRate} 
          correctAnswerRate={dashboard.correctAnswerRate}
        />
        <AutoQuizSettings />
      </div>
      
      <div className="grid grid-cols-1 mb-6">
        <StudentList students={dashboard.students} />
      </div>
    </div>
  );
};

export default ProfessorView;

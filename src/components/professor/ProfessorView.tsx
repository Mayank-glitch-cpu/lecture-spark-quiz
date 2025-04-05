
import { useApp } from "../../contexts/AppContext";
import DashboardHeader from "./DashboardHeader";
import { Activity, BarChart3, Clock, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import AttentionChart from "./AttentionChart";
import ParticipationCard from "./ParticipationCard";
import StudentList from "./StudentList";
import CurrentQuizCard from "./CurrentQuizCard";
import { Badge } from "../ui/badge";

const ProfessorView = () => {
  const { dashboard, session } = useApp();
  
  if (!dashboard || !session) {
    return (
      <div className="p-4 md:p-6 text-center">
        <h2 className="text-xl font-semibold">No active session</h2>
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
        <div className="md:col-span-2 flex justify-center items-center bg-gray-50 border rounded-lg p-4">
          <Badge variant="default" className="bg-quiz-mint text-white">
            Zoom Recording Active
          </Badge>
        </div>
        <CurrentQuizCard 
          activeQuestion={dashboard.activeQuestion} 
          responses={dashboard.studentResponses} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AttentionChart data={dashboard.attentionOverTime} />
        <ParticipationCard 
          participationRate={dashboard.participationRate} 
          correctAnswerRate={dashboard.correctAnswerRate}
        />
        <StudentList students={dashboard.students} />
      </div>
    </div>
  );
};

export default ProfessorView;

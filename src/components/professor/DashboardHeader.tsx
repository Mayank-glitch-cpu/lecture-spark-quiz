
import { Clock, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useApp } from "../../contexts/AppContext";

const DashboardHeader = () => {
  const { session, dashboard, generateNewQuestion } = useApp();
  
  if (!session || !dashboard) return null;
  
  const startTime = new Date(session.startTime);
  const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Started at {formattedStartTime}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {session.activeStudents} students online
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={generateNewQuestion}
          className="bg-quiz-purple hover:bg-purple-800"
        >
          Generate New Quiz
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;

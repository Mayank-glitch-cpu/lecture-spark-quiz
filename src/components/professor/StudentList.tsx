
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Student } from "../../types";
import { Brain, CheckCircle, User } from "lucide-react";
import { Badge } from "../ui/badge";

interface StudentListProps {
  students: Student[];
}

const StudentList = ({ students }: StudentListProps) => {
  const sortedStudents = [...students].sort((a, b) => b.attentionScore - a.attentionScore);

  return (
    <Card className="border-quiz-lavender/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Student Engagement</CardTitle>
        <Badge variant="outline" className="bg-gray-50">
          {students.length} Students
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[350px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium text-center">Attention</th>
                <th className="pb-3 font-medium text-right">Responses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-quiz-lavender/20 text-quiz-purple flex items-center justify-center mr-3">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{student.name}</div>
                        <div className="text-xs text-gray-500">
                          {student.responses.length > 0 ? "Active now" : "Idle"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <AttentionBadge score={student.attentionScore} />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end items-center gap-1">
                      <div className="bg-gray-100 text-gray-700 w-7 h-7 rounded-full flex items-center justify-center">
                        {student.responses.length}
                      </div>
                      <span className="text-gray-500">/{students[0].responses.length + 1}</span>
                      {student.responses.filter(r => r.isCorrect).length > 0 && (
                        <CheckCircle className="h-4 w-4 text-quiz-mint ml-1" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

interface AttentionBadgeProps {
  score: number;
}

const AttentionBadge = ({ score }: AttentionBadgeProps) => {
  let bgColor = "bg-red-100 text-red-700";
  let icon = <Brain className="h-3.5 w-3.5 mr-1" />;
  
  if (score >= 80) {
    bgColor = "bg-green-100 text-green-700";
  } else if (score >= 60) {
    bgColor = "bg-yellow-100 text-yellow-700";
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {icon}
      {score}%
    </div>
  );
};

export default StudentList;

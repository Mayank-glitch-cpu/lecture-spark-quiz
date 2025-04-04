
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Student } from "../../types";

interface StudentListProps {
  students: Student[];
}

const StudentList = ({ students }: StudentListProps) => {
  const sortedStudents = [...students].sort((a, b) => b.attentionScore - a.attentionScore);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Student Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium text-center">Attention</th>
                <th className="pb-2 font-medium text-right">Responses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedStudents.map((student) => (
                <tr key={student.id}>
                  <td className="py-2">
                    <div className="font-medium">{student.name}</div>
                  </td>
                  <td className="py-2">
                    <div className="flex justify-center">
                      <AttentionBadge score={student.attentionScore} />
                    </div>
                  </td>
                  <td className="py-2 text-right text-gray-500">
                    {student.responses.length}/{students[0].responses.length + 1}
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
  if (score >= 80) {
    bgColor = "bg-green-100 text-green-700";
  } else if (score >= 60) {
    bgColor = "bg-yellow-100 text-yellow-700";
  }

  return (
    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {score}%
    </div>
  );
};

export default StudentList;

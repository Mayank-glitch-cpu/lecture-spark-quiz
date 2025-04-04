
import { Book, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "../contexts/AppContext";

const Header = () => {
  const { role, setRole } = useApp();

  const toggleRole = () => {
    setRole(role === "student" ? "professor" : "student");
  };

  return (
    <header className="bg-white border-b px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Book className="h-5 w-5 text-quiz-purple" />
        <h1 className="font-semibold text-lg">LectureSparkQuiz</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600"
          onClick={toggleRole}
        >
          <User className="h-4 w-4 mr-1" />
          {role === "student" ? "Student" : "Professor"}
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;

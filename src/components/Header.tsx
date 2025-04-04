
import { Book, LogOut, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "../contexts/AppContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { role, setRole, user, signOut } = useApp();

  const toggleRole = () => {
    setRole(role === "student" ? "professor" : "student");
  };

  return (
    <header className="bg-white border-b px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Book className="h-5 w-5 text-quiz-purple" />
        <Link to="/" className="font-semibold text-lg">LectureSparkQuiz</Link>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600"
              onClick={toggleRole}
            >
              <User className="h-4 w-4 mr-1" />
              {role === "student" ? "Student" : "Professor"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;

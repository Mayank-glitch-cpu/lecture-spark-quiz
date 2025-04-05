import Header from "./Header";
import { useApp } from "../contexts/AppContext";
import ProfessorView from "./professor/ProfessorView";
import StudentView from "./student/StudentView";
import { Loader2 } from "lucide-react";

const Layout = () => {
  const { role, loading } = useApp();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-quiz-purple" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {role === "student" ? <StudentView /> : <ProfessorView />}
      </main>
    </div>
  );
};

export default Layout;

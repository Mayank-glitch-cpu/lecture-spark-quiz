
import Header from "./Header";
import { useApp } from "../contexts/AppContext";
import ProfessorView from "./professor/ProfessorView";
import StudentView from "./student/StudentView";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Layout = () => {
  const { role, user, loading } = useApp();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-quiz-purple" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
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

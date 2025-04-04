
import Header from "./Header";
import { useApp } from "../contexts/AppContext";
import ProfessorView from "./professor/ProfessorView";
import StudentView from "./student/StudentView";

const Layout = () => {
  const { role } = useApp();
  
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

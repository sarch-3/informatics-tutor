import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom"
import "./styles/global.css"
import "./styles/classrooms.css";
import "./styles/home.css";
import "./styles/auth.css";
import "./styles/create-homework.css";
import { getRefreshToken } from "./utils/jwt";
import Auth from "./pages/Auth";
import SideBar from "./components/SideBar";
import NotFound from "./pages/NotFound";
import Logout from "./pages/Logout";
import Home from "./pages/Home";
import Classrooms from "./pages/Classrooms";
import ClassroomDetail from "./pages/ClassroomDetail";
import CreateHomework from "./pages/CreateHomework";
import HomeworkDetail from "./pages/HomeworkDetail";
import HomeworkStats from "./pages/HomeworkStats";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getRefreshToken()) {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <>
      {getRefreshToken() && <SideBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/classrooms" element={<Classrooms />} />
        <Route path="/classroom/:id" element={<ClassroomDetail />} />
        <Route path="/create-homework" element={<CreateHomework />} />
        <Route path="/homework/:id" element={<HomeworkDetail />} />
        <Route path="/homework/:id/stats" element={<HomeworkStats />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App

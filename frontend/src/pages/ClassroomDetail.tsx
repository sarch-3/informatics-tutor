import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserFromStorage } from "../utils/user";
import HomeworkList from "../components/HomeworkList";
import api from "../utils/api";
import { ConfirmModal } from "../components/ConfirmModal";

interface Task {
  id: string;
  title: string;
  text: string;
  status: string;
}

interface Homework {
  id: string;
  title: string;
  active_from?: string;
  active_until?: string | null;
  tasks: Task[];
}

const ClassroomDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [classTitle, setClassTitle] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteHomeworkId, setDeleteHomeworkId] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserFromStorage();
    setIsTeacher(!!user?.is_teacher);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/classrooms/${id}/homeworks/`)
      .then(res => setHomeworks(res.data))
      .catch(() => setError("Не удалось загрузить домашние задания класса"))
      .finally(() => setLoading(false));
    api.get(`/classrooms/${id}/`)
      .then(res => setClassTitle(res.data.title))
      .catch(() => setClassTitle("Класс"));
  }, [id]);

  const handleDeleteHomework = (homeworkId: string) => {
    setDeleteHomeworkId(homeworkId);
    setShowDeleteModal(true);
  };

  const confirmDeleteHomework = () => {
    if (!deleteHomeworkId) return;
    setLoading(true);
    setShowDeleteModal(false);
    api.delete(`/homeworks/${deleteHomeworkId}/edit/`)
      .then(() => setHomeworks(hws => hws.filter(hw => hw.id !== deleteHomeworkId)))
      .catch(() => setError("Не удалось удалить домашнюю работу"))
      .finally(() => setLoading(false));
    setDeleteHomeworkId(null);
  };

  return (
    <div className="wrapper">
      <div className="wrapper-content">
        <div className="competition_present">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#222', margin: '0 0 18px 0' }}>{classTitle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 24px 0' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#4651e5', margin: 0 }}>Домашние задания</h2>
            {isTeacher && (
              <button
                className="create-class-btn"
                style={{ minWidth: 180 }}
                onClick={() => navigate(`/create-homework?class_id=${id}`)}
              >
                <i className='bx bx-plus'></i> Создать домашнюю работу
              </button>
            )}
          </div>
          {loading && <div>Загрузка...</div>}
          {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
          {homeworks.length === 0 && !loading && (
            <div style={{ color: '#888', fontSize: 18 }}>В этом классе пока нет домашних заданий.</div>
          )}
          {!loading && homeworks.length > 0 && (
            <HomeworkList homeworks={homeworks} isTeacher={isTeacher} onDelete={handleDeleteHomework} />
          )}
          {showDeleteModal && (
            <ConfirmModal
              open={showDeleteModal}
              loading={loading}
              title="Удалить домашнюю работу?"
              description="Это действие нельзя отменить."
              confirmText="Удалить"
              cancelText="Отмена"
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={confirmDeleteHomework}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;

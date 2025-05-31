import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import type { Homework } from "../types/homework";
import "../styles/homework-detail.css";
import TaskSidebarList from "../components/TaskSidebarList";
import TaskStatusIndicator from "../components/TaskStatusIndicator";
import TaskHeader from "../components/TaskHeader";
import TaskMainBlock from "../components/TaskMainBlock";

const HomeworkDetail: React.FC = () => {
    const { id } = useParams(); // id домашки
    const navigate = useNavigate();
    const [homework, setHomework] = useState<Homework | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTaskIdx, setSelectedTaskIdx] = useState(0);
    const [solutions, setSolutions] = useState<any[]>([]);
    const [solutionsHasMore, setSolutionsHasMore] = useState(true);

    // drag and drop + file state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [polling, setPolling] = useState(false);
    const [uploadError, setUploadError] = useState("");

    // Периодический опрос статуса задачи
    useEffect(() => {
        // Если хотя бы одна задача в pending — включаем polling
        if (homework?.tasks?.some(t => t.status === 'pending') && !polling) {
            setPolling(true);
        }
    }, [homework?.tasks]);

    useEffect(() => {
        if (!polling) return;
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/homeworks/${id}/`);
                if (res.data && res.data.tasks) {
                    setHomework((prev) => prev ? { ...prev, tasks: res.data.tasks } : prev);
                    // Если больше нет pending — выключаем polling
                    if (!res.data.tasks.some((t: any) => t.status === 'pending')) {
                        setPolling(false);
                    }
                }
            } catch { }
        }, 2000);
        return () => clearInterval(interval);
    }, [polling, id]); // removed homework?.tasks and selectedTaskIdx

    useEffect(() => {
        setLoading(true);
        setError("");
        api.get(`/homeworks/${id}/`)
            .then(res => setHomework(res.data))
            .catch(() => setError("Не удалось загрузить домашнюю работу"))
            .finally(() => setLoading(false));
    }, [id]);

    const tasks = homework && homework.tasks ? homework.tasks : [];
    const selectedTask = tasks[selectedTaskIdx];

    // Сброс решений только при смене задания (selectedTaskIdx)
    useEffect(() => {
        if (!selectedTask) return;
        setSolutions([]);
        setSolutionsHasMore(true);
        loadSolutions(0, true);
    }, [selectedTask]);

    const loadSolutions = (offset: number, replace = false) => {
        if (!selectedTask || !selectedTask.id) return;
        api.get(`/tasks/${selectedTask.id}/?offset=${offset}&limit=5`)
            .then(res => {
                if (res.data && res.data.solutions) {
                    const newSolutions = Array.isArray(res.data.solutions) ? res.data.solutions : [res.data.solutions];
                    setSolutions(prev => replace ? newSolutions : [...prev, ...newSolutions]);
                    setSolutionsHasMore(newSolutions.length === 5);
                } else {
                    setSolutionsHasMore(false);
                }
            })
            .catch(() => setSolutionsHasMore(false));
    };

    const handleLoadMoreSolutions = () => {
        const newOffset = solutions.length;
        if (tasks[selectedTaskIdx]) {
            loadSolutions(newOffset);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
        }
    };
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    useEffect(() => {
        setUploadedFile(null);
        setDragActive(false);
        setUploadError("");
    }, [selectedTaskIdx]);

    if (loading) return <div className="wrapper"><div className="wrapper-content">Загрузка...</div></div>;
    if (error) return <div className="wrapper"><div className="wrapper-content" style={{ color: 'red' }}>{error}</div></div>;
    if (!homework) return null;

    return (
        <div className="wrapper">
            {/* Переносим кнопку возврата в правый блок */}
            {uploadSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 32,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    color: '#22c55e',
                    borderRadius: 6,
                    padding: '10px 28px',
                    fontSize: 16,
                    fontWeight: 500,
                    boxShadow: '0 2px 12px rgba(34,197,94,0.10)',
                    zIndex: 1000,
                    border: '1px solid #e0e0e0',
                    minWidth: 220,
                    textAlign: 'center',
                    letterSpacing: 0.1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'opacity 0.3s',
                }}>
                    <i className="bx bx-check-circle" style={{ fontSize: 20, color: '#22c55e' }}></i>
                    Файл успешно отправлен!
                </div>
            )}
            <div className="homework-detail-flex homework-detail-container" style={{ background: 'none', boxShadow: 'none' }}>
                {/* Основной блок с текущим заданием */}
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <div className="homework-detail-main">
                        <TaskHeader title={homework.title} status={selectedTask.status}>
                            <div className="task-status-indicator" style={{ minWidth: 120, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600 }}>
                                <TaskStatusIndicator status={selectedTask.status} />
                            </div>
                        </TaskHeader>
                        <TaskMainBlock
                            title={selectedTask.title}
                            idx={selectedTaskIdx}
                            task={selectedTask}
                            uploadedFile={uploadedFile}
                            dragActive={dragActive}
                            uploadError={uploadError}
                            uploadSuccess={uploadSuccess}
                            onFileChange={handleFileChange}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setUploadError("");
                                if (!uploadedFile) return;
                                const formData = new FormData();
                                formData.append("file", uploadedFile);
                                try {
                                    const res = await api.post(`/tasks/${selectedTask.id}/`, formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    if (res.status === 200) {
                                        setUploadSuccess(true);
                                        setUploadedFile(null);
                                        setTimeout(() => setUploadSuccess(false), 2000);
                                        setPolling(true);
                                    }
                                } catch (err) {
                                    setUploadError("Не удалось отправить файл. Попробуйте еще раз.");
                                }
                            }}
                            solutions={solutions}
                            solutionsHasMore={solutionsHasMore}
                            onLoadMoreSolutions={handleLoadMoreSolutions}
                        />
                    </div>
                </div>

                {/* Список заданий справа */}
                <TaskSidebarList tasks={tasks} selectedTaskIdx={selectedTaskIdx} setSelectedTaskIdx={setSelectedTaskIdx} onBack={() => navigate(-1)} />
            </div>
        </div>
    );
};

export default HomeworkDetail;
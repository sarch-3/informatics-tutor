import React from "react";
import { useNavigate } from "react-router-dom";
import type { Homework } from "../types/homework";
import TaskList from "./TaskList";

interface HomeworkItemProps {
    homework: Homework;
    isTeacher?: boolean;
    onDelete?: (homeworkId: string) => void;
}

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
};

const HomeworkItem: React.FC<HomeworkItemProps> = ({ homework, isTeacher, onDelete }) => {
    const navigate = useNavigate();
    const deleteBtnRef = React.useRef<HTMLButtonElement>(null);

    const handleItemClick = (e: React.MouseEvent) => {
        if (deleteBtnRef.current && deleteBtnRef.current.contains(e.target as Node)) return;
        navigate(`/homework/${homework.id}`);
    };

    return (
        <li
            style={{
                background: '#f7f8fa',
                borderRadius: 8,
                marginBottom: 24,
                padding: '18px 22px',
                boxShadow: '0 2px 8px rgba(70,81,229,0.07)',
                cursor: 'pointer', // Добавлен pointer для курсора
            }}
            onClick={handleItemClick}
            tabIndex={0}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{homework.title}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {isTeacher && (
                        <button
                            className="homework-stats-btn"
                            onClick={e => {
                                e.stopPropagation();
                                navigate(`/homework/${homework.id}/stats`);
                            }}
                        >
                            <i className="bx bx-bar-chart-alt-2" style={{ fontSize: 18 }}></i>
                            Статистика
                        </button>
                    )}
                    {isTeacher && onDelete && (
                        <button
                            className="homework-delete-btn"
                            ref={deleteBtnRef}
                            onClick={e => {
                                e.stopPropagation();
                                onDelete(homework.id);
                            }}
                        >
                            Удалить
                        </button>
                    )}
                </div>
            </div>
            <div style={{ color: '#4651e5', fontSize: 15, marginBottom: 8 }}>
                {homework.active_from && <>Открыто с: {formatDate(homework.active_from)}<br /></>}
                {homework.active_until && <>Дедлайн: {formatDate(homework.active_until)}</>}
            </div>
            <div style={{ marginTop: 10 }}>
                <b>Задания:</b>
                <TaskList tasks={homework.tasks} />
            </div>
        </li>
    );
};

export default HomeworkItem;

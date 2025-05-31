import React from "react";
import type { Task } from "../types/homework";

interface TaskSidebarListProps {
    tasks: Task[];
    selectedTaskIdx: number;
    setSelectedTaskIdx: (idx: number) => void;
    onBack?: () => void;
}

const TaskSidebarList: React.FC<TaskSidebarListProps> = ({ tasks, selectedTaskIdx, setSelectedTaskIdx, onBack }) => (
    <div className="homework-detail-tasks">
        <button
            onClick={onBack || (() => window.history.back())}
            className="homework-back-btn-modern"
            type="button"
        >
            К домашним заданиям
        </button>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, marginTop: 8 }}>Задания</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map((task, idx) => {
                let statusIcon = null;
                if (task.status === 'solved') {
                    statusIcon = <i className="bx bx-check-circle task-status-icon" style={{ color: '#22c55e' }} title="Решено"></i>;
                } else if (task.status === 'pending') {
                    statusIcon = <i className="bx bx-time-five task-status-icon" style={{ color: '#f59e42' }} title="Проверяется"></i>;
                } else if (task.status === 'wrong') {
                    statusIcon = <i className="bx bx-x-circle task-status-icon" style={{ color: '#e53935' }} title="Ошибка"></i>;
                } else {
                    statusIcon = <i className="bx bx-circle task-status-icon" style={{ color: '#bbb', fontSize: 14 }} title="Не решено"></i>;
                }
                return (
                    <li key={task.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={() => setSelectedTaskIdx(idx)}
                            className={`homework-task-btn${idx === selectedTaskIdx ? ' selected' : ''}`}
                            type="button"
                        >
                            <span className="task-num">{idx + 1}.</span>
                            <span className="task-title">{task.title.length > 38 ? task.title.slice(0, 35) + '...' : task.title}</span>
                            {statusIcon}
                        </button>
                    </li>
                );
            })}
        </ul>
    </div>
);

export default TaskSidebarList;

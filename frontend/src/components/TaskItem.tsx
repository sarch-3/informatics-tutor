import React from "react";
import type { Task } from "../types/homework";

interface TaskItemProps {
    task: Task;
}

const getStatusText = (status: string) => {
    switch (status) {
        case 'solved': return 'Решено';
        case 'wrong': return 'Ошибка';
        case 'pending': return 'Проверяется';
        default: return 'Не решено';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'solved': return '#22c55e';
        case 'wrong': return '#e53935';
        case 'pending': return '#f59e42';
        default: return '#888';
    }
};

const TaskItem: React.FC<TaskItemProps> = ({ task }) => (
    <li style={{
        background: '#fff',
        borderRadius: 6,
        marginBottom: 10,
        padding: '12px 16px',
        boxShadow: '0 1px 4px rgba(70,81,229,0.05)'
    }}>
        <div style={{ fontWeight: 500, fontSize: 17 }}>{task.title}</div>
        <div style={{ color: '#555', fontSize: 15, margin: '6px 0 4px 0' }}>
            {task.text.length > 100 ? task.text.slice(0, 100) + '...' : task.text}
        </div>
        <div style={{ fontSize: 14, color: getStatusColor(task.status) }}>
            Статус: {getStatusText(task.status)}
        </div>
    </li>
);

export default TaskItem;

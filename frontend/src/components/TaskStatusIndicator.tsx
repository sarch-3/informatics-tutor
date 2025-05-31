import React from "react";

const TaskStatusIndicator: React.FC<{ status: string }> = ({ status }) => {
    if (status === 'solved') {
        return <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" style={{ fontSize: 20 }}></i> Решено</span>;
    } else if (status === 'pending') {
        return <span style={{ color: '#f59e42', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-time-five" style={{ fontSize: 20 }}></i> Проверяется</span>;
    } else if (status === 'wrong') {
        return <span style={{ color: '#e53935', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-x-circle" style={{ fontSize: 20 }}></i> Ошибка</span>;
    } else {
        return <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}><i className="bx bx-circle" style={{ fontSize: 16 }}></i> Не решено</span>;
    }
};

export default TaskStatusIndicator;

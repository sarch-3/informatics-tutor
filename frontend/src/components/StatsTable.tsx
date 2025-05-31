import React from "react";
import { getPublicMinioUrl } from "../utils/minio";

function formatDate(dateStr?: string | null) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
}

const StatsTable: React.FC<{
    data: any[];
    onFileClick: (task: any) => void;
}> = ({ data, onFileClick }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(70,81,229,0.07)' }}>
            <thead>
                <tr style={{ background: '#f7f8fa' }}>
                    <th style={{ padding: 10, fontWeight: 600, fontSize: 16, color: '#4651e5', borderBottom: '1.5px solid #e0e0e0' }}>Ученик</th>
                    {data[0].tasks.map((task: any) => (
                        <th key={task.id} style={{ padding: 10, fontWeight: 600, fontSize: 16, color: '#4651e5', borderBottom: '1.5px solid #e0e0e0' }}>{task.title}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((student: any) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 10, fontWeight: 500, fontSize: 16, textAlign: "center" }}>{student.last_name} {student.first_name}</td>
                        {student.tasks.map((task: any) => (
                            <td key={task.id} style={{ padding: 10, textAlign: 'center', fontSize: 15 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <span style={{ fontWeight: 600, color: task.status === 'solved' ? '#22c55e' : task.status === 'wrong' ? '#e53935' : '#888' }}>
                                        {task.status === 'solved' ? 'Решено' : task.status === 'wrong' ? 'Ошибка' : 'Не решено'}
                                    </span>
                                    <span style={{ color: '#888', fontSize: 13 }}>Попыток: {task.count}</span>
                                    {task.last_solution && task.last_solution.file && (
                                        <>
                                            <span style={{ color: '#4651e5', fontSize: 13 }}>{formatDate(task.last_solution.date)}</span>
                                            <a
                                                href={getPublicMinioUrl(task.last_solution.file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#4651e5', fontSize: 14, textDecoration: 'underline', marginTop: 2, cursor: 'pointer' }}
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    onFileClick(task);
                                                }}
                                            >
                                                Файл
                                            </a>
                                            <span style={{ color: task.last_solution.successful ? '#22c55e' : '#e53935', fontSize: 13 }}>{task.last_solution.message}</span>
                                        </>
                                    )}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default StatsTable;

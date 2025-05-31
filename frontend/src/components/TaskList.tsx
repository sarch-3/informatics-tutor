import React from "react";
import type { Task } from "../types/homework";
import TaskItem from "./TaskItem";

interface TaskListProps {
    tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => (
    <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
        {tasks.slice(0, 2).map(task => (
            <TaskItem key={task.id} task={task} />
        ))}
        {tasks.length > 2 && (
            <li style={{
                background: '#f0f4ff',
                borderRadius: 6,
                padding: '10px 16px',
                color: '#4651e5',
                fontWeight: 500,
                textAlign: 'center',
                fontSize: 15,
                border: '1px dashed #b3c6ff',
                marginTop: 4
            }}>
                + ещё {tasks.length - 2} {tasks.length - 2 === 1 ? 'задание' : (tasks.length - 2 < 5 ? 'задания' : 'заданий')}
            </li>
        )}
    </ul>
);

export default TaskList;

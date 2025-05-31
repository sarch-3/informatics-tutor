import React from "react";
import type { Homework } from "../types/homework";
import HomeworkItem from "./HomeworkItem";

interface HomeworkListProps {
    homeworks: Homework[];
    isTeacher?: boolean;
    onDelete?: (homeworkId: string) => void;
}

const HomeworkList: React.FC<HomeworkListProps> = ({ homeworks, isTeacher, onDelete }) => {

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {homeworks.map(hw => (
                <HomeworkItem homework={hw} isTeacher={isTeacher} onDelete={onDelete} />
            ))}
        </ul>
    );
};

export default HomeworkList;

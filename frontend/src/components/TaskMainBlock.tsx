import React from "react";
import HomeworkUploadForm from "./HomeworkUploadForm";
import SolutionsBlock from "./SolutionsBlock";

interface TaskMainBlockProps {
    title: string;
    idx: number;
    task: any;
    uploadedFile: File | null;
    dragActive: boolean;
    uploadError: string;
    uploadSuccess: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    solutions: any[];
    solutionsHasMore: boolean;
    onLoadMoreSolutions: () => void;
}

const TaskMainBlock: React.FC<TaskMainBlockProps> = ({
    title,
    idx,
    task,
    uploadedFile,
    dragActive,
    uploadError,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    onSubmit,
    solutions,
    solutionsHasMore,
    onLoadMoreSolutions,
}) => (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div className="homework-detail-main">
            <div style={{ fontSize: 22, fontWeight: 700, color: '#4651e5', marginBottom: 10, lineHeight: 1.2 }}>
                Задание {idx + 1}: {title}
            </div>
            <div style={{ fontSize: 18, whiteSpace: 'pre-line', marginBottom: 32 }}>{task.text}</div>
            <HomeworkUploadForm
                uploadedFile={uploadedFile}
                dragActive={dragActive}
                uploadError={uploadError}
                onFileChange={onFileChange}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onSubmit={onSubmit}
            />
        </div>
        <SolutionsBlock
            solutions={solutions}
            solutionsHasMore={solutionsHasMore}
            onLoadMore={onLoadMoreSolutions}
        />
    </div>
);

export default TaskMainBlock;

import React from "react";

const TaskHeader: React.FC<{ title: string; status: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h1 className="homework-detail-title" style={{ fontSize: 20, fontWeight: 600, marginBottom: 0 }}>
            {title}
        </h1>
        {children}
    </div>
);

export default TaskHeader;

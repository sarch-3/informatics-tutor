import React from "react";

const HomeworkTitle: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ fontSize: 22, fontWeight: 700, color: '#4651e5', marginBottom: 10, lineHeight: 1.2 }}>{title}</div>
);

export default HomeworkTitle;

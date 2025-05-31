import React from "react";
import SolutionItem from "./SolutionItem";

interface SolutionsBlockProps {
    solutions: any[];
    solutionsHasMore: boolean;
    onLoadMore: () => void;
}

const SolutionsBlock: React.FC<SolutionsBlockProps> = ({ solutions, solutionsHasMore, onLoadMore }) => (
    <div className="homework-solutions-block" style={{ background: '#f7f8fa', borderRadius: 10, padding: 18, marginTop: 8, marginBottom: 0, minHeight: 60 }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: '#4651e5', marginBottom: 8 }}>Ваши решения</div>
        {solutions.length === 0 ? (
            <div style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>
                Здесь будут отображаться ваши решения
            </div>
        ) : (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {solutions.map((sol, idx) => (
                        <SolutionItem sol={sol} key={idx} />
                    ))}
                </div>
                {solutionsHasMore && (
                    <button
                        className="solution-load-more-btn"
                        style={{
                            margin: '18px auto 0 auto',
                            display: 'block',
                            padding: '8px 24px',
                            background: '#fff',
                            color: '#4651e5',
                            border: '1.5px solid #e0e0e0',
                            borderRadius: 7,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(70,81,229,0.04)',
                            transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                        }}
                        onClick={onLoadMore}
                    >
                        Загрузить ещё
                    </button>
                )}
            </>
        )}
    </div>
);

export default SolutionsBlock;

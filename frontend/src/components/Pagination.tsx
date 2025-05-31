import React from "react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="pagination">
            <button
                className="pagination-button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
            >
                <i className='bx bx-chevron-left'></i>
            </button>
            <span className="pagination-info">Страница {page} из {totalPages}</span>
            <button
                className="pagination-button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
            >
                <i className='bx bx-chevron-right'></i>
            </button>
        </div>
    );
};

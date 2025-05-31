import React from "react";

interface HomeworkUploadFormProps {
    uploadedFile: File | null;
    dragActive: boolean;
    uploadError: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const HomeworkUploadForm: React.FC<HomeworkUploadFormProps> = ({
    uploadedFile,
    dragActive,
    uploadError,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    onSubmit
}) => (
    <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <label
            className={`homework-upload-label${dragActive ? ' drag-active' : ''}`}
            htmlFor="homework-upload-input"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{ cursor: 'pointer', width: '100%' }}
        >
            <i className={`bx ${uploadedFile ? 'bx-check-circle' : 'bxl-dropbox'} homework-upload-icon`}></i>
            <span style={{ color: uploadedFile ? '#22c55e' : '#4651e5' }}>
                {uploadedFile ? `Файл загружен: ${uploadedFile.name}` : 'Перетащите файл сюда или кликните для выбора'}
            </span>
            <input
                type="file"
                className="homework-upload-input"
                id="homework-upload-input"
                accept=".py,.txt,.cpp,.java,.js,.ts,.c,.cs,.go,.rb,.php,.swift,.kt,.rs,.scala,.sh,.ipynb"
                style={{ display: 'none' }}
                onChange={onFileChange}
            />
        </label>
        {uploadError && (
            <div style={{ color: '#e53935', marginTop: 10, fontWeight: 500, textAlign: 'center' }}>{uploadError}</div>
        )}
        <button
            type="submit"
            className="homework-upload-btn"
            disabled={!uploadedFile}
            style={{
                margin: '18px auto 0 auto',
                display: 'block',
                padding: '12px 32px',
                background: '#4651e5',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 17,
                fontWeight: 600,
                cursor: uploadedFile ? 'pointer' : 'not-allowed',
                opacity: uploadedFile ? 1 : 0.6,
                transition: 'background 0.18s, opacity 0.18s, box-shadow 0.18s, transform 0.12s',
                boxShadow: '0 2px 8px rgba(70,81,229,0.07)',
                outline: 'none',
            }}
            onMouseDown={e => {
                if (uploadedFile) {
                    e.currentTarget.style.transform = 'scale(0.97)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(70,81,229,0.04)';
                }
            }}
            onMouseUp={e => {
                if (uploadedFile) {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(70,81,229,0.07)';
                }
            }}
            onMouseLeave={e => {
                if (uploadedFile) {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(70,81,229,0.07)';
                }
            }}
        >
            Отправить
        </button>
    </form>
);

export default HomeworkUploadForm;

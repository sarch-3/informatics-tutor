import React from "react";

interface InviteLinkModalProps {
    open: boolean;
    loading: boolean;
    error: string;
    link: string | null;
    recipientType: 'student' | 'teacher' | '';
    onRecipientChange: (v: 'student' | 'teacher') => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onCopy: (link: string) => void;
    copySuccess: string | null;
}

export const InviteLinkModal: React.FC<InviteLinkModalProps> = ({
    open, loading, error, link, recipientType, onRecipientChange, onClose, onSubmit, onCopy, copySuccess
}) => {
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal invite-modal">
                <h2>Создать пригласительную ссылку</h2>
                <form onSubmit={onSubmit}>
                    <div className="invite-options">
                        <label className={`invite-option ${recipientType === 'student' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="recipient"
                                value="student"
                                checked={recipientType === 'student'}
                                onChange={() => onRecipientChange('student')}
                            />
                            <i className='bx bx-user-plus'></i>
                            <span>Для студента</span>
                        </label>
                        <label className={`invite-option ${recipientType === 'teacher' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="recipient"
                                value="teacher"
                                checked={recipientType === 'teacher'}
                                onChange={() => onRecipientChange('teacher')}
                            />
                            <i className='bx bx-user-voice'></i>
                            <span>Для учителя</span>
                        </label>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {link && (
                        <div className="invite-link-container">
                            <div className="invite-link">
                                <span className="invite-code">{link}</span>
                                <button
                                    type="button"
                                    className="copy-button"
                                    onClick={() => onCopy(link)}
                                    title="Копировать ссылку"
                                >
                                    <i className='bx bx-copy'></i>
                                    {copySuccess && <span className="copy-tooltip">{copySuccess}</span>}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="modal-buttons">
                        <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
                            Закрыть
                        </button>
                        <button type="submit" className="submit-button" disabled={loading || !recipientType}>
                            {loading ? 'Создание...' : 'Создать ссылку'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

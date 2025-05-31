import React from "react";

interface ConfirmModalProps {
    open: boolean;
    loading?: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    loading = false,
    title = "Подтвердите действие",
    description = "Вы уверены, что хотите продолжить?",
    confirmText = "Подтвердить",
    cancelText = "Отмена",
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal join-modal" style={{ minWidth: 320, maxWidth: 380, padding: '28px 24px 20px 24px' }}>
                <div className="modal-header" style={{ marginBottom: 18, justifyContent: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 20, color: '#222', fontWeight: 600 }}>{title}</h3>
                </div>
                <div className="modal-body" style={{ marginBottom: 18, textAlign: 'center', fontSize: 16 }}>
                    {description}
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
                    <button type="button" className="modal-button cancel" onClick={onCancel} disabled={loading}>{cancelText}</button>
                    <button type="button" className="modal-button submit" onClick={onConfirm} disabled={loading}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

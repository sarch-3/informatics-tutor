import React from "react";

interface CreateClassModalProps {
    open: boolean;
    creating: boolean;
    error: string;
    value: string;
    onChange: (v: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ open, creating, error, value, onChange, onClose, onSubmit }) => {
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Создать класс</h2>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Название класса"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 12, padding: 8 }}
                    />
                    {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        <button type="button" onClick={onClose} disabled={creating}>
                            Отмена
                        </button>
                        <button type="submit" disabled={creating || !value.trim()}>
                            {creating ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

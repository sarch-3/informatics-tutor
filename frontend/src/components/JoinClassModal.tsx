import React from "react";

interface JoinClassModalProps {
  open: boolean;
  loading: boolean;
  code: string;
  error: string;
  success: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({
  open,
  loading,
  code,
  error,
  success,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal join-modal">
        <div className="modal-header" style={{ marginBottom: 18, justifyContent: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 20, color: '#222', fontWeight: 600 }}>Присоединиться к классу</h3>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ marginBottom: 18 }}>
            <input
              type="text"
              className="modal-input join-code-input"
              placeholder="Введите код приглашения"
              value={code}
              onChange={e => onChange(e.target.value)}
              disabled={loading}
              required
              style={{ marginBottom: 10, width: '100%' }}
            />
            {error && <div className="error-message" style={{marginBottom: 6, textAlign: 'center'}}>{error}</div>}
            {success && <div className="success-message" style={{marginBottom: 6, textAlign: 'center'}}>{success}</div>}
          </div>
          <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
            <button type="button" className="modal-button cancel" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="modal-button submit" disabled={loading || !code}>Присоединиться</button>
          </div>
        </form>
      </div>
    </div>
  );
};

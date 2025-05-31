import React from "react";

const CodeModal: React.FC<{
    open: boolean;
    code: string | null;
    title: string;
    loading: boolean;
    error: string;
    copied: boolean;
    onClose: () => void;
    onCopy: () => void;
}> = ({ open, code, title, loading, error, copied, onClose, onCopy }) => {
    if (!open) return null;
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
            onClick={onClose}
        >
            <div style={{
                background: '#fff',
                borderRadius: 10,
                minWidth: 320,
                maxWidth: '90vw',
                maxHeight: '80vh',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
            }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', padding: '14px 22px', borderBottom: '1.5px solid #e0e0e0' }}>
                    <span style={{ fontWeight: 600, fontSize: 17, color: '#4651e5' }}>{title || 'Файл'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {code && (
                            <button
                                onClick={onCopy}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#4651e5',
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    padding: '2px 8px',
                                    borderRadius: 5,
                                    transition: 'background 0.15s',
                                    position: 'relative',
                                }}
                                title="Скопировать код"
                            >
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: 2 }}><rect x="5" y="5" width="10" height="12" rx="2" stroke="#4651e5" strokeWidth="1.5" fill="none" /><rect x="8" y="3" width="7" height="12" rx="2" stroke="#4651e5" strokeWidth="1.5" fill="none" /></svg>
                                <span style={{ fontSize: 13 }}>{copied ? 'Скопировано!' : 'Скопировать'}</span>
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', marginLeft: 8 }}>&times;</button>
                    </div>
                </div>
                <div style={{ padding: 18, maxHeight: '60vh', overflow: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, background: '#f9fafb' }}>
                    {loading ? 'Загрузка...' : error ? (
                        <span style={{ color: '#e53935' }}>{error}</span>
                    ) : (
                        <pre className="code-pre" style={{ counterReset: 'line', padding: '5px', border: '1px solid #bbb', background: '#f7f8fa', overflowX: 'auto', fontSize: '14px', lineHeight: '1.5em', margin: 0, borderRadius: 7, fontFamily: 'JetBrains Mono, monospace', color: '#222' }}>
                            <code style={{ display: 'grid', color: '#222' }}>
                                {code && code.split('\n').map((line, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            display: 'block',
                                            paddingLeft: '3em',
                                            position: 'relative',
                                            whiteSpace: 'pre',
                                            backgroundColor: idx % 2 === 0 ? '#fff' : '#f0f1f4',
                                            fontFamily: "JetBrains Mono"
                                        }}
                                    >
                                        <span
                                            style={{
                                                counterIncrement: 'line',
                                                content: 'counter(line)',
                                                position: 'absolute',
                                                left: 0,
                                                width: '2.5em',
                                                textAlign: 'right',
                                                color: '#888',
                                                borderRight: '1px solid #e0e0e0',
                                                paddingRight: '0.5em',
                                                userSelect: 'none',
                                                fontSize: '13px',
                                                background: 'inherit',
                                            }}
                                        >{idx + 1}</span>
                                        {line === '' ? ' ' : line}
                                    </span>
                                ))}
                            </code>
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeModal;

/*
Пример использования:
<img src={getPublicMinioUrl(fileUrl)} alt="file" />
*/

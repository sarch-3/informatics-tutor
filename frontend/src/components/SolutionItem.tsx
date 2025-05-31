import React, { useState, useRef, useEffect } from "react";
import { getPublicMinioUrl } from "../utils/minio";

interface SolutionItemProps {
    sol: any;
}

function getLineCount(text: string) {
    return text.split(/\r?\n/).length;
}

const SolutionItem: React.FC<SolutionItemProps> = ({ sol }) => {
    const [showCode, setShowCode] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [errorContent, setErrorContent] = useState("");
    const codeRef = useRef<HTMLPreElement>(null);
    const isFileLink = typeof sol.file === 'string' && sol.file.startsWith('http');
    const isTextFile = isFileLink && (sol.file.endsWith('.py') || sol.file.endsWith('.txt') || sol.file.endsWith('.js') || sol.file.endsWith('.ts') || sol.file.endsWith('.cpp') || sol.file.endsWith('.java') || sol.file.endsWith('.c') || sol.file.endsWith('.cs') || sol.file.endsWith('.go') || sol.file.endsWith('.rb') || sol.file.endsWith('.php') || sol.file.endsWith('.swift') || sol.file.endsWith('.kt') || sol.file.endsWith('.rs') || sol.file.endsWith('.scala') || sol.file.endsWith('.sh'));

    useEffect(() => {
        if ((showCode || !showCode) && isTextFile && !fileContent && !loadingContent) {
            setLoadingContent(true);
            setErrorContent("");
            fetch(getPublicMinioUrl(sol.file))
                .then(res => {
                    if (!res.ok) throw new Error('Ошибка загрузки файла');
                    return res.text();
                })
                .then(text => setFileContent(text))
                .catch(() => setErrorContent("Не удалось загрузить файл"))
                .finally(() => setLoadingContent(false));
        }
    }, [isTextFile, sol.file]);

    const getPreviewLines = (text: string) => {
        const lines = text.split(/\r?\n/);
        return lines.slice(0, 2).join('\n') + (lines.length > 2 ? ' ...' : '');
    };

    return (
        <div className="solution-item">
            <div className="solution-item-header">
                <i className="bx bx-file solution-item-icon"></i>
                Решение
                <span className="solution-item-date">
                    {sol.date ? (() => {
                        const d = new Date(sol.date);
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        const hours = pad(d.getHours());
                        const minutes = pad(d.getMinutes());
                        const day = pad(d.getDate());
                        const month = pad(d.getMonth() + 1);
                        const year = d.getFullYear().toString().slice(-2);
                        return `${hours}:${minutes} ${day}/${month}/${year}`;
                    })() : ''}
                </span>
            </div>
            <div className="solution-item-code-block">
                {isTextFile ? (
                    <>
                        {fileContent && getLineCount(fileContent) > 2 && (
                            <button
                                type="button"
                                className="solution-item-toggle-btn"
                                onClick={() => setShowCode(v => !v)}
                            >
                                {showCode ? 'Скрыть код' : 'Показать полностью'}
                            </button>
                        )}
                        <div
                            className={`solution-item-code-outer${showCode ? ' expanded' : ''}`}
                            style={showCode ? { maxHeight: '1000px', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' } : { maxHeight: 56, transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}
                        >
                            {loadingContent ? (
                                <div className="solution-item-loading">Загрузка...</div>
                            ) : errorContent ? (
                                <div className="solution-item-error">{errorContent}</div>
                            ) : fileContent ? (
                                <pre
                                    ref={codeRef}
                                    className="solution-item-code"
                                    style={{
                                        counterReset: 'line',
                                        padding: '5px',
                                        border: '1px solid #bbb',
                                        background: '#f7f8fa',
                                        overflowX: 'auto',
                                        fontSize: '14px',
                                        lineHeight: '1.5em',
                                        margin: 0,
                                        borderRadius: 7,
                                        fontFamily: 'JetBrains Mono, monospace',
                                        color: '#222',
                                    }}
                                >
                                    <code style={{ display: 'grid', color: '#222' }}>
                                        {(showCode ? fileContent : getPreviewLines(fileContent)).split('\n').map((line, idx) => (
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
                            ) : null}
                        </div>
                    </>
                ) : isFileLink ? (
                    <a href={sol.file} target="_blank" rel="noopener noreferrer" className="solution-item-link">
                        {sol.file.split('/').pop() || 'Скачать файл'}
                    </a>
                ) : (
                    <pre className="solution-item-code">
                        {sol.file ? (typeof sol.file === 'string' ? getPreviewLines(sol.file) : JSON.stringify(sol.file, null, 2)) : 'Нет данных'}
                    </pre>
                )}
            </div>
            {sol.tested === false ? (
                <div className="solution-item-status solution-item-status-pending">
                    <i className="bx bx-time-five"></i> Не проверено
                </div>
            ) : sol.successful === true ? (
                <div className="solution-item-status solution-item-status-solved">
                    <i className="bx bx-check-circle"></i> Решено
                </div>
            ) : (
                <div className="solution-item-status solution-item-status-wrong">
                    <i className="bx bx-x-circle"></i> Ошибка
                </div>
            )}
            {sol.message && (
                <>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 2, fontStyle: 'italic', textAlign: 'left' }}>
                        Комментарий системы
                    </div>
                    <div className="solution-item-message" style={{ color: sol.successful ? '#22c55e' : '#e53935', marginTop: 4, fontSize: 15, fontWeight: 500 }}>
                        {sol.message}
                    </div>
                </>
            )}
        </div>
    );
};

export default SolutionItem;

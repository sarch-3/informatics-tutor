import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatsTable from "../components/StatsTable";
import CodeModal from "../components/CodeModal";
import { getPublicMinioUrl } from "../utils/minio";

// --- Main Page ---

const HomeworkStats: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalCode, setModalCode] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string>("");
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");
        api.get(`/homeworks/${id}/advancement/`)
            .then(res => setData(res.data))
            .catch(() => setError("Не удалось загрузить статистику"))
            .finally(() => setLoading(false));
    }, [id]);

    // Обработчик открытия модального окна с кодом
    const handleFileClick = async (task: any) => {
        setModalTitle(task.title);
        setModalLoading(true);
        setModalError("");
        setModalCode(null);
        try {
            const res = await fetch(getPublicMinioUrl(task.last_solution.file));
            if (!res.ok) throw new Error("Ошибка загрузки файла");
            const text = await res.text();
            setModalCode(text);
        } catch {
            setModalError("Не удалось загрузить файл");
        } finally {
            setModalLoading(false);
        }
    };

    // Обработчик копирования кода
    const handleCopy = async () => {
        if (!modalCode) return;
        try {
            await navigator.clipboard.writeText(modalCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    return (
        <div className="wrapper">
            <div className="wrapper-content">
                <div style={{ position: 'relative', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#4651e5', margin: 0, textAlign: 'left' }}>Статистика по домашней работе</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="homework-back-btn-modern"
                        style={{ width: 100 }}
                    >Назад
                    </button>
                </div>
                {loading ? (
                    <div>Загрузка...</div>
                ) : error ? (
                    <div style={{ color: 'red' }}>{error}</div>
                ) : !data || data.length === 0 ? (
                    <div style={{ color: '#888' }}>Нет данных</div>
                ) : (
                    <StatsTable data={data} onFileClick={handleFileClick} />
                )}
            </div>
            <CodeModal
                open={modalCode !== null}
                code={modalCode}
                title={modalTitle}
                loading={modalLoading}
                error={modalError}
                copied={copied}
                onClose={() => setModalCode(null)}
                onCopy={handleCopy}
            />
        </div>
    );
};

export default HomeworkStats;

import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { getUserFromStorage } from '../utils/user';
import { CreateClassModal } from '../components/CreateClassModal';
import { InviteLinkModal } from '../components/InviteLinkModal';
import { ClassroomCard } from '../components/ClassroomCard';
import { Pagination } from '../components/Pagination';
import { JoinClassModal } from '../components/JoinClassModal';

interface Teacher {
    first_name: string;
    last_name: string;
}

interface Student {
    first_name: string;
    last_name: string;
}

interface Classroom {
    id: string;
    title: string;
    teachers: Teacher[];
    students: Student[];
}

export default function Classrooms() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isTeacher, setIsTeacher] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [newClassTitle, setNewClassTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [inviteModal, setInviteModal] = useState<{ open: boolean, classroomId: string | null }>({ open: false, classroomId: null });
    const [recipientType, setRecipientType] = useState<'student' | 'teacher' | ''>('');
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState("");
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState("");
    const limit = 10;

    useEffect(() => {
        const user = getUserFromStorage();
        setIsTeacher(!!user?.is_teacher);
    }, []);

    useEffect(() => {
        setLoading(true);
        setError("");
        api.get("/classrooms/", { params: { offset: (page - 1) * limit, limit } })
            .then(res => {
                setClassrooms(res.data);
                const totalCount = res.headers['x-total-count'];
                setTotal(totalCount ? parseInt(totalCount) : 0);
            })
            .catch(() => setError("Не удалось загрузить список классов"))
            .finally(() => setLoading(false));
    }, [page]);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError("");
        setCreating(true);
        try {
            await api.post("/classrooms/create/", { title: newClassTitle });
            setNewClassTitle("");
            setShowModal(false);
            // Перезагружаем список классов
            const res = await api.get("/classrooms/", { params: { offset: (page - 1) * limit, limit } });
            setClassrooms(res.data);
            const totalCount = res.headers['x-total-count'];
            setTotal(totalCount ? parseInt(totalCount) : 0);
        } catch (err) {
            setCreateError("Не удалось создать класс");
        } finally {
            setCreating(false);
        }
    };

    const openInviteModal = (classroomId: string) => {
        setInviteModal({ open: true, classroomId });
        setRecipientType('');
        setInviteLink(null);
        setInviteError("");
    };
    const closeInviteModal = () => {
        setInviteModal({ open: false, classroomId: null });
        setRecipientType('');
        setInviteLink(null);
        setInviteError("");
    };
    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteModal.classroomId || !recipientType) return;
        setInviteLoading(true);
        setInviteError("");
        setInviteLink(null);
        try {
            const res = await api.post(`/classrooms/${inviteModal.classroomId}/invite-link/`, { recipient: recipientType });
            setInviteLink(res.data.code || 'Ссылка создана');
        } catch (err) {
            setInviteError("Ошибка при создании ссылки");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCopyLink = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            setCopySuccess("Скопировано!");
            setTimeout(() => setCopySuccess(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError("");
        setJoinSuccess("");
        setJoinLoading(true);
        try {
            await api.post("/classrooms/join/", { code: joinCode });
            setJoinSuccess("Вы успешно присоединились к классу!");
            setJoinCode("");
            setTimeout(() => setJoinModalOpen(false), 1200);
            // Перезагрузить список классов
            const res = await api.get("/classrooms/", { params: { offset: (page - 1) * limit, limit } });
            setClassrooms(res.data);
            const totalCount = res.headers['x-total-count'];
            setTotal(totalCount ? parseInt(totalCount) : 0);
        } catch (err: any) {
            if (err?.response?.status === 403) {
                setJoinError("Нет прав для присоединения.");
            } else if (err?.response?.status === 404) {
                setJoinError("Код приглашения не найден.");
            } else {
                setJoinError("Ошибка при присоединении к классу.");
            }
        } finally {
            setJoinLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="content">
            <CreateClassModal
                open={showModal}
                creating={creating}
                error={createError}
                value={newClassTitle}
                onChange={setNewClassTitle}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateClass}
            />
            <InviteLinkModal
                open={inviteModal.open}
                loading={inviteLoading}
                error={inviteError}
                link={inviteLink}
                recipientType={recipientType}
                onRecipientChange={setRecipientType}
                onClose={closeInviteModal}
                onSubmit={handleCreateInvite}
                onCopy={handleCopyLink}
                copySuccess={copySuccess}
            />
            {/* Кнопка Присоединиться справа сверху */}
            <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
                <button className="join-class-btn" onClick={() => setJoinModalOpen(true)}>
                    <i className='bx bx-log-in'></i> Присоединиться
                </button>
            </div>
            <JoinClassModal
                open={joinModalOpen}
                loading={joinLoading}
                code={joinCode}
                error={joinError}
                success={joinSuccess}
                onChange={setJoinCode}
                onClose={() => setJoinModalOpen(false)}
                onSubmit={handleJoinClass}
            />
            <div className="wrapper">
                <div className="wrapper-content">
                    <div className="competition_present">
                        <div className="competition_span">Мои классы</div>
                        {loading && <div>Загрузка...</div>}
                        {error && <div style={{ color: 'red' }}>{error}</div>}
                        {classrooms.length === 0 && !loading && !error && (
                            <div style={{ margin: '60px 0 20px 0', textAlign: 'center', color: '#888', fontSize: 20 }}>
                                Вы пока не состоите ни в одном классе.
                            </div>
                        )}
                        {classrooms.map(cls => (
                            <ClassroomCard
                                key={cls.id}
                                classroom={cls}
                                isTeacher={isTeacher}
                                onInviteClick={openInviteModal}
                            />
                        ))}
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        {isTeacher && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                <button className="create-class-btn" onClick={() => setShowModal(true)}>
                                    <i className='bx bx-plus'></i> Создать класс
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
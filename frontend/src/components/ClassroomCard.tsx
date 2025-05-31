import React from "react";
import api from '../utils/api';
import { ConfirmModal } from './ConfirmModal';

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

interface ClassroomCardProps {
    classroom: Classroom;
    isTeacher: boolean;
    onInviteClick: (id: string) => void;
}

export const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, isTeacher, onInviteClick }) => {
    const [exitModalOpen, setExitModalOpen] = React.useState(false);
    const [exitLoading, setExitLoading] = React.useState(false);

    const handleExit = async () => {
        setExitLoading(true);
        try {
            await api.post(`/classrooms/${classroom.id}/exit/`);
            window.location.reload();
        } catch (err) {
            alert('Ошибка при выходе из класса');
        } finally {
            setExitLoading(false);
        }
    };
    const classroomTitle = classroom.title;
    return (
        <div style={{ position: 'relative' }}>
            <a className="nav-link-fetch" href={`/classroom/${classroom.id}`}>
                <div className="competition_block">
                    <div className="competition_block_info">
                        <div className="competition-text">
                            <div className="block-icon">
                                <i className='bx bx-group'></i>
                                <div className="text-info">
                                    <span className="name">{classroom.title}</span>
                                    <span className="info">
                                        Учителя: {classroom.teachers && classroom.teachers.length > 0
                                            ? classroom.teachers.map(t => `${t.first_name[0]}. ${t.last_name}`).join(', ')
                                            : '—'}
                                    </span>
                                    <span className="info">
                                        Ученики: {classroom.students ? classroom.students.length : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
            {isTeacher && (
                <button
                    className="plus-invite-btn"
                    title="Создать пригласительную ссылку"
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 18,
                    }}
                    onClick={() => onInviteClick(classroom.id)}
                >
                    <i className='bx bx-plus'></i>
                </button>
            )}
            {/* Кнопка выхода из класса */}
            <button
                className="exit-class-btn"
                title="Выйти из класса"
                style={{
                    position: 'absolute',
                    top: 12,
                    right: isTeacher ? 58 : 18,
                }}
                onClick={e => { e.preventDefault(); setExitModalOpen(true); }}
            >
                <i className='bx bx-exit'></i>
            </button>
            <ConfirmModal
                open={exitModalOpen}
                loading={exitLoading}
                title="Выйти из класса"
                description={classroomTitle ? `Вы действительно хотите выйти из класса «${classroomTitle}»?` : "Вы действительно хотите выйти из класса?"}
                confirmText="Выйти"
                cancelText="Отмена"
                onCancel={() => setExitModalOpen(false)}
                onConfirm={handleExit}
            />
        </div>
    );
};

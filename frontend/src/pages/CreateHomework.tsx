import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

interface TaskBlock {
  title: string;
  text: string;
  tests: string;
  answers: string;
}

const CreateHomework: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class_id");
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeUntil, setActiveUntil] = useState("");
  const [tasks, setTasks] = useState<TaskBlock[]>([
    { title: "", text: "", tests: "", answers: "" }
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [classTitle, setClassTitle] = useState<string>("");

  useEffect(() => {
    if (classId) {
      api.get(`/classrooms/${classId}/`)
        .then(res => setClassTitle(res.data.title))
        .catch(() => setClassTitle(""));
    }
  }, [classId]);

  const handleTaskChange = (idx: number, field: keyof TaskBlock, value: string) => {
    setTasks(tasks => tasks.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const addTask = () => setTasks([...tasks, { title: "", text: "", tests: "", answers: "" }]);
  const removeTask = (idx: number) => setTasks(tasks => tasks.length > 1 ? tasks.filter((_, i) => i !== idx) : tasks);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    setLoading(true);
    // Валидация
    if (!title.trim()) {
      setError("Укажите название домашней работы");
      setLoading(false);
      return;
    }
    for (const [i, t] of tasks.entries()) {
      if (!t.title.trim() || !t.text.trim()) {
        setError(`Заполните все поля задания №${i + 1}`);
        setLoading(false);
        return;
      }
      try {
        if (t.answers) JSON.parse(t.answers);
        if (t.tests) JSON.parse(t.tests);
      } catch {
        setError(`Некорректный JSON в ответах или тестах задания №${i + 1}`);
        setLoading(false);
        return;
      }
    }
    try {
      // Формируем payload согласно требованиям
      const toUTC = (local: string) => {
        if (!local) return undefined;
        // local: '2025-05-30T23:59' -> Date -> toISOString() -> '2025-05-30T20:59:00.000Z'
        const d = new Date(local);
        // Формат: 'YYYY-MM-DD HH:mm:ss.SSSSSS+00:00'
        const pad = (n: number, l = 2) => n.toString().padStart(l, '0');
        const year = d.getUTCFullYear();
        const month = pad(d.getUTCMonth() + 1);
        const day = pad(d.getUTCDate());
        const hour = pad(d.getUTCHours());
        const min = pad(d.getUTCMinutes());
        const sec = pad(d.getUTCSeconds());
        const ms = pad(d.getUTCMilliseconds(), 6); // pad to 6 for microseconds
        return `${year}-${month}-${day} ${hour}:${min}:${sec}.${ms}+00:00`;
      };
      const payload: any = {
        classroom: classId,
        title,
        tasks: tasks.map(t => ({
          title: t.title,
          text: t.text,
          tests: t.tests ? JSON.parse(t.tests) : null,
          answers: t.answers ? JSON.parse(t.answers) : null
        }))
      };
      if (activeFrom) payload.active_from = toUTC(activeFrom);
      if (activeUntil) payload.active_until = toUTC(activeUntil);
      await api.post(`/homeworks/create/`, payload);
      setSuccess("Домашняя работа успешно создана!");
      setTimeout(() => navigate(-1), 1200);
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.messages) {
        setFieldErrors(err.response.data.messages);
        setError("Исправьте ошибки в форме");
      } else {
        setError(err?.response?.data?.detail || "Ошибка при создании домашней работы");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-homework-container" onSubmit={handleSubmit}>
      <h2 className="create-homework-title">Создание домашней работы</h2>
      {classId && (
        <div className="create-homework-block" style={{ marginBottom: 18 }}>
          <div className="create-homework-label">Для класса:</div>
          <div style={{ fontSize: 17, color: '#4651e5', fontWeight: 600 }}>{classTitle || classId}</div>
        </div>
      )}
      <div className="create-homework-block">
        <label className="create-homework-label">Название домашней работы</label>
        <input className="create-homework-input" value={title} onChange={e => setTitle(e.target.value)} required />
        {fieldErrors.title && fieldErrors.title.map((msg: string, i: number) => (
          <div key={i} className="create-homework-error">{msg}</div>
        ))}
        <label className="create-homework-label">Доступна с <span style={{ color: '#888', fontWeight: 400 }}>(необязательно)</span></label>
        <input className="create-homework-input" type="datetime-local" value={activeFrom} onChange={e => setActiveFrom(e.target.value)} />
        {fieldErrors.active_from && fieldErrors.active_from.map((msg: string, i: number) => (
          <div key={i} className="create-homework-error">{msg}</div>
        ))}
        <label className="create-homework-label">Доступна до <span style={{ color: '#888', fontWeight: 400 }}>(необязательно)</span></label>
        <input className="create-homework-input" type="datetime-local" value={activeUntil} onChange={e => setActiveUntil(e.target.value)} />
        {fieldErrors.active_until && fieldErrors.active_until.map((msg: string, i: number) => (
          <div key={i} className="create-homework-error">{msg}</div>
        ))}
      </div>
      <div className="create-homework-block" style={{ background: '#f9fafb', border: '1.5px dashed #b3c6ff', marginBottom: 28 }}>
        <div style={{ color: '#4651e5', fontWeight: 600, marginBottom: 6 }}>Памятка по формированию JSON для ответов и тестов:</div>
        <ul style={{ color: '#555', fontSize: 15, marginBottom: 6, paddingLeft: 18 }}>
          <li>Это должен быть массив массивов (двумерный массив).</li>
          <li>Количество вложенных массивов — это количество тестов.</li>
          <li>Внутри вложенных массивов должны быть строки.</li>
          <li>Количество строк — это количество вводимых данных с новой строки для тестов и количество выводимых данных для ответов.</li>
          <li>Количество вложенных массивов должно быть одинаковым в tests и answers.</li>
          <li><b>Вложенные массивы не могут быть пустыми.</b></li>
        </ul>
        <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          Пример:<br />
          <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>
            Тесты: [["sadad"], ["asdadasd"]]<br />
            Ответы: [["12314 123144", "12314 123144"], [""]]
          </span>
        </div>
      </div>
      {tasks.map((task, idx) => (
        <div className="create-homework-block" key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="create-homework-label">Задание #{idx + 1}</span>
            {tasks.length > 1 && (
              <button type="button" className="create-homework-btn-remove" onClick={() => removeTask(idx)} disabled={loading}>Удалить</button>
            )}
          </div>
          <input className="create-homework-input" placeholder="Название задания" value={task.title} onChange={e => handleTaskChange(idx, 'title', e.target.value)} required />
          {fieldErrors.tasks && fieldErrors.tasks[idx] && fieldErrors.tasks[idx].title && fieldErrors.tasks[idx].title.map((msg: string, i: number) => (
            <div key={i} className="create-homework-error">{msg}</div>
          ))}
          <textarea className="create-homework-textarea" placeholder="Текст задания" value={task.text} onChange={e => handleTaskChange(idx, 'text', e.target.value)} required />
          {fieldErrors.tasks && fieldErrors.tasks[idx] && fieldErrors.tasks[idx].text && fieldErrors.tasks[idx].text.map((msg: string, i: number) => (
            <div key={i} className="create-homework-error">{msg}</div>
          ))}
          <textarea className="create-homework-textarea" placeholder="Тесты (JSON)" value={task.tests} onChange={e => handleTaskChange(idx, 'tests', e.target.value)} />
          {fieldErrors.tasks && fieldErrors.tasks[idx] && fieldErrors.tasks[idx].tests && fieldErrors.tasks[idx].tests.map((msg: string, i: number) => (
            <div key={i} className="create-homework-error">{msg}</div>
          ))}
          <textarea className="create-homework-textarea" placeholder="Ответы (JSON)" value={task.answers} onChange={e => handleTaskChange(idx, 'answers', e.target.value)} />
          {fieldErrors.tasks && fieldErrors.tasks[idx] && fieldErrors.tasks[idx].answers && fieldErrors.tasks[idx].answers.map((msg: string, i: number) => (
            <div key={i} className="create-homework-error">{msg}</div>
          ))}
        </div>
      ))}
      <div className="create-homework-btn-row">
        <button type="button" className="create-homework-btn-add" onClick={addTask} disabled={loading}>
          + Добавить задание
        </button>
      </div>
      {error && <div className="create-homework-error">{error}</div>}
      {success && <div className="create-homework-success">{success}</div>}
      <button type="submit" className="create-homework-btn-submit" disabled={loading}>Создать</button>
      <button type="button" className="create-homework-btn-remove" style={{ marginLeft: 16 }} onClick={() => navigate(-1)} disabled={loading}>Назад</button>
    </form>
  );
};

export default CreateHomework;

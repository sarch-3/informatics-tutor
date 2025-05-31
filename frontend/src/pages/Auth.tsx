import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { setTokens, getRefreshToken } from "../utils/jwt";

export default function Auth() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        if (getRefreshToken()) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="auth-page">
            {isSignUp
                ? <AuthSignUp onSwitch={() => setIsSignUp(false)} />
                : <AuthSignIn onSwitch={() => setIsSignUp(true)} />}
        </div>
    );
}

function AuthSignIn({ onSwitch }: { onSwitch: () => void }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validate = () => {
        let valid = true;
        if (!email) {
            setEmailError("Введите email");
            valid = false;
        } else {
            setEmailError("");
        }
        if (!password) {
            setPasswordError("Введите пароль");
            valid = false;
        } else {
            setPasswordError("");
        }
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!validate()) return;
        try {
            const response = await api.post("/user/sign-in/", { email, password });
            setTokens({ access: response.data.access, refresh: response.data.refresh });
            navigate("/");
        } catch (err: any) {
            setError("Неверный логин или пароль");
        }
    };

    return (
        <>
            <div className="registration slaider_content">
                <div className="stage_settings">
                <span className="header_span">Вход в аккаунт</span>
                <form onSubmit={handleSubmit}>
                    <div className="container_input_form field users-field">
                        <span className="container_input_form_text">Введите вашу почту</span>
                        <input
                            type="email"
                            className="input_regestration email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {emailError && (
                            <span className="error err3 email-error">
                                <i className="bx bx-error-circle error-icon"></i>
                                <p className="error-text">{emailError}</p>
                            </span>
                        )}
                    </div>
                    <div className="container_input_form field create-password papawe">
                        <span className="container_input_form_text">Ваш пароль</span>
                        {/* <i className='bx bx-hide show-hide'></i> */}
                        <input
                            type="password"
                            className="input_regestration password"
                            name="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {passwordError && (
                            <span className="error err3 password-error">
                                <i className="bx bx-error-circle error-icon"></i>
                                <p className="error-text">{passwordError}</p>
                            </span>
                        )}
                    </div>
                    <div className="submit_input">
                        {error && <span className="error_input error_input_active"><i className="bx bx-error-circle error-icon"></i><p className="error-text">{error}</p></span>}
                        <button
                            type="submit"
                            className="button_submit_input"
                            id="button_form"
                            disabled={!email || !password}
                        >
                            Войти
                        </button>
                    </div>
                </form>
                <span className="exit">Нет аккаунта? <a style={{cursor: "pointer"}} onClick={onSwitch}>Зарегистрироваться!</a></span>
            </div>
            </div>
        </>
    );
}

function AuthSignUp({ onSwitch }: { onSwitch: () => void }) {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [isTeacher, setIsTeacher] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string[]}>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({});
        if (password !== password2) {
            setError("Пароли не совпадают");
            return;
        }
        try {
            const response = await api.post("/user/sign-up/", {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                is_teacher: isTeacher
            });
            setTokens({ access: response.data.access, refresh: response.data.refresh });
            navigate("/");
        } catch (err: any) {
            if (err?.response?.data?.messages) {
                setFieldErrors(err.response.data.messages);
            } else {
                setError(err?.response?.data?.detail || "Ошибка регистрации");
            }
        }
    };

    // Кнопка неактивна, если не заполнены все поля (кроме чекбокса)
    const isDisabled = !firstName || !lastName || !email || !password || !password2;

    return (
        <>
            <div className="registration slaider_content">
                <div className="stage-1 stage_settings">
                    <span className="header_span">Регистрация</span>
                    <form onSubmit={handleSubmit} id="reg_form" name="start_registration">
                        <div className="container_input_form field users-field">
                            <span className="container_input_form_text">Имя</span>
                            <input type="text" className="input_regestration users" name="first_name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                            {fieldErrors.first_name && fieldErrors.first_name.map((msg, i) => (
                                <span key={i} className="error field-error">
                                    <i className="bx bx-error-circle error-icon"></i>
                                    <p className="error-text">{msg}</p>
                                </span>
                            ))}
                        </div>
                        <div className="container_input_form field users-field">
                            <span className="container_input_form_text">Фамилия</span>
                            <input type="text" className="input_regestration users" name="last_name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                            {fieldErrors.last_name && fieldErrors.last_name.map((msg, i) => (
                                <span key={i} className="error field-error">
                                    <i className="bx bx-error-circle error-icon"></i>
                                    <p className="error-text">{msg}</p>
                                </span>
                            ))}
                        </div>
                        <div className="container_input_form field email-field">
                            <span className="container_input_form_text">Почта</span>
                            <input type="email" className="input_regestration email" name="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            {fieldErrors.email && fieldErrors.email.map((msg, i) => (
                                <span key={i} className="error field-error">
                                    <i className="bx bx-error-circle error-icon"></i>
                                    <p className="error-text">{msg}</p>
                                </span>
                            ))}
                        </div>
                        <div className="container_input_form field create-password">
                            <span className="container_input_form_text">Пароль</span>
                            <input type="password" className="input_regestration password" name="password1" value={password} onChange={e => setPassword(e.target.value)} required />
                            {fieldErrors.password && fieldErrors.password.map((msg, i) => (
                                <span key={i} className="error field-error">
                                    <i className="bx bx-error-circle error-icon"></i>
                                    <p className="error-text">{msg}</p>
                                </span>
                            ))}
                        </div>
                        <div className="container_input_form field confirm-password">
                            <span className="container_input_form_text">Повторите пароль</span>
                            <input type="password" className="input_regestration cPassword" name="password2" value={password2} onChange={e => setPassword2(e.target.value)} required />
                        </div>
                        <div className="container_input_form field teacher-checkbox">
                            <label>
                                <input type="checkbox" checked={isTeacher} onChange={e => setIsTeacher(e.target.checked)} /> Я учитель
                            </label>
                            {fieldErrors.is_teacher && fieldErrors.is_teacher.map((msg, i) => (
                                <span key={i} className="error field-error">
                                    <i className="bx bx-error-circle error-icon"></i>
                                    <p className="error-text">{msg}</p>
                                </span>
                            ))}
                        </div>
                        <div className="submit_input">
                            {error && <span className="error_input error_input_active"><i className="bx bx-error-circle error-icon"></i><p className="error-text">{error}</p></span>}
                            {success && <span className="success_input"><p className="success-text">{success}</p></span>}
                            <button className="button_submit" name="start_registration" id="button_form" disabled={isDisabled}>Зарегистрироваться</button>
                        </div>
                    </form>
                    <span className="exit">Есть аккаунт? <a style={{cursor: "pointer"}} onClick={onSwitch}>Войти!</a></span>
                </div>                
            </div>
        </>
    );
}
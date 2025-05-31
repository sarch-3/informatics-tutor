import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearTokens } from "../utils/jwt";

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        clearTokens(); // Очистка токенов
        navigate("/auth", { replace: true }); // Редирект на /auth
    }, [navigate]);

    return null;
}
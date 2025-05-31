import { useEffect, useState } from "react";
import api from "../utils/api";
import { type User, saveUserToStorage, getUserFromStorage, removeUserFromStorage } from "../utils/user";

export default function SideBar() {
    const [user, setUser] = useState<User | null>(getUserFromStorage());
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    useEffect(() => {
        if (!user) {
            api.get("/user/get/")
                .then(response => {
                    setUser(response.data);
                    saveUserToStorage(response.data);
                })
                .catch(() => setUser(null));
        }
    }, []);

    // Закрытие popup
    const closePopup = () => setShowLogoutPopup(false);

    // Для body overflow (опционально)
    useEffect(() => {
        if (showLogoutPopup) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [showLogoutPopup]);

    return (
        <>
            <nav className="sidebar">
                <header>
                    <a className="nav-link-fetch" href="">
                        <div className="image-text">
                            <span className="image">
                                <img src="/default.svg" alt="" />
                            </span>

                            <div className="text logo-text">
                                <span id="username_name" className="name">{user ? user.first_name : ""}</span>
                                <span className="profession">{user ? user.last_name : ""}</span>
                            </div>
                        </div>
                    </a>
                </header>

                <div className="menu-bar">
                    <div className="menu">
                        <ul className="menu-links">
                            <SideBarButton text="Главная" icon="bx bx-home-alt icon" url="/" />
                            <SideBarButton text="Классы" icon="bx bxs-school icon" url="/classrooms" />
                        </ul>
                    </div>
                    <div className="bottom-content var cursor-p">
                        <li className="nav-link">
                            <a
                                id="confirmation_logout"
                                className="confirmation_logout1"
                                type="button"
                                onClick={() => setShowLogoutPopup(true)}
                            >
                                <i className='bx bx-log-out icon'></i>
                                <span className="text nav-text">Выйти</span>
                            </a>
                        </li>
                    </div>
                </div>
                <button className="header_burger-btn">
                    <span></span><span></span><span></span>
                </button>
            </nav>
            {showLogoutPopup && (
                <div className="popup__bg active" onClick={e => { if (e.target === e.currentTarget) closePopup(); }}>
                    <form className="popup base-popup active" onClick={e => e.stopPropagation()}>
                        <i className='bx bx-x close-popup' onClick={closePopup} style={{ cursor: "pointer" }}></i>
                        <span>Вы точно хотите выйти?</span>
                        <a className="confirmation_logout" href="/logout" onClick={() => removeUserFromStorage()}>
                            <p className="text_logout nav-text">Выйти</p>
                        </a>
                    </form>
                </div>
            )}
        </>
    );
}

function SideBarButton({ text, icon, url }: { text: string, icon: string, url: string }) {
    return (
        <li className="nav-link">
            <a className="nav-link-fetch" href={url}>
                <i className={icon} ></i>
                <span className="text nav-text">{text}</span>
            </a>
        </li>
    );
}
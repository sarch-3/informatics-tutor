export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    is_teacher: boolean;
}

export function saveUserToStorage(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromStorage(): User | null {
    const data = localStorage.getItem("user");
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function removeUserFromStorage() {
    localStorage.removeItem("user");
}
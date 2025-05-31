export interface Task {
    id: string;
    title: string;
    text: string;
    status: string;
}

export interface Homework {
    id: string;
    title: string;
    active_from?: string;
    active_until?: string | null;
    tasks: Task[];
}

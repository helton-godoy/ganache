export interface ApiError {
    message: string;
    status: number;
}

const API_BASE = '/api/v1';

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!res.ok) {
        throw { message: res.statusText, status: res.status } as ApiError;
    }

    return res.json() as Promise<T>;
}

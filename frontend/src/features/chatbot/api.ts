import type { BotResponse, FileEntry } from "./schema";

const BASE_URL = "/api";

export async function chat(message: string): Promise<BotResponse> {
    const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
    return res.json();
}

export async function summary(topic?: string): Promise<BotResponse> {
    const res = await fetch(`${BASE_URL}/summary`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
    return res.json();
}

export async function quiz(topic?: string, num_questions?: number): Promise<BotResponse> {
    const res = await fetch(`${BASE_URL}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, num_questions }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
    return res.json();
}

export async function listFiles(): Promise<FileEntry[]> {
    const res =await fetch(`${BASE_URL}/files`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.files ?? []);
}

export async function uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
    const data = await res.json();
    if (data.status !== "success") {
        throw new Error(data.error || "File upload failed");
    }
}

export async function deleteFile(filename: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
}

export async function clearAll(): Promise<void> {
    const res = await fetch(`${BASE_URL}/clear`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Request failed with status ${res.status}`);
    }
}
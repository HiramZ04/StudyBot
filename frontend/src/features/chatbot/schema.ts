export interface FileEntry {
    fileName: string;
    type: string;
    source: string;
}

export interface Source {
    filename: string;
    type: string;
    score: number;
}

export interface Response {
    response: string;
    sources: Source[];
}

export type PageView = "chat" | "summary" | "quiz" | "files";
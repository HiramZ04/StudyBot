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

export interface BotResponse {
    response: string;
    sources: Source[];
}

export type CenterTab = "chat" | "summary"
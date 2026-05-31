import { useState } from "react";
import { chat } from "../features/chatbot/api";
import type { BotResponse } from "../features/chatbot/schema";

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState<BotResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!message.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const res = await chat(message);
            setResponse(res);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Chat</h1>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question about your study materials..."
            />
            <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Thinking..." : "Ask"}
            </button>
            {error && <p>{error}</p>}
            {response && (
                <div>
                <p>{response.response}</p>
                {response.sources.map((s) => (
                    <span key={s.filename}>{s.filename}</span>
                ))}
                </div>
            )}
        </div>
    );
}

import { useState } from "react";
import { summary } from "../features/chatbot/api";
import type { BotResponse } from "../features/chatbot/schema";

export default function SummaryPage() {
    const [topic, setTopic] = useState("");
    const [response, setResponse] = useState<BotResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        setError(null);
        try {
            const res = await summary(topic || undefined);
            setResponse(res);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Summary</h1>
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic to summarize..."
            />
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Summarizing..." : "Summarize"}
            </button>
            {error && <p className="error">{error}</p>}
            {response && (
                <div className="card">
                    <p className="response-text">{response.response}</p>
                </div>
            )}
        </div>
    );
}

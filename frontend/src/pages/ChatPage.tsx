import { useEffect, useRef, useState } from "react";
import { chat } from "../features/chatbot/api";
import type { BotResponse } from "../features/chatbot/schema";

interface Message {
    role: "user" | "bot";
    content: string;
    sources?: { filename: string }[];
}

export default function ChatPage() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // autoscroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function handleSubmit() {
        const trimmed = input.trim();

        if (!trimmed || loading ) return;
        setInput("");
        setError(null);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        setMessages(prev => [...prev, { role: "user", content: trimmed }]);
        setLoading(true);

        try {
            const res: BotResponse = await chat(trimmed);
            setMessages(prev => [...prev, { role: "bot", content: res.response, sources: res.sources ?? []}]);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(e.target.value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
        }
    }

    return (
        <div className="chat-container">
            <h1>Chat</h1>
            <div className="chat-messages">

                {messages.map((msg, i) => (
                    <div key={i} className={`message message-${msg.role}`}>
                        <div className="message-bubble">
                            {msg.content}
                        </div>
                        {msg.role === "bot" && msg.sources && msg.sources.length > 0 && (
                            <div className="message-sources">
                                {msg.sources.map((s) => (
                                    <span key={s.filename} className="source-chip">{s.filename}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="message message-bot">
                        <div className="message-bubble">
                            <div className="loading-dot">
                                <span/><span/><span/>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="error-msg">{error}</p>}
                <div ref={bottomRef} />
            </div>

            {/* Input pinned to bottom */}
            <div className="chat-input-area">
                <div className="chat-input-row">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKey}
                        placeholder="Ask a question..."
                        rows={1}
                    />
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !input.trim()}
                    > {loading ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}

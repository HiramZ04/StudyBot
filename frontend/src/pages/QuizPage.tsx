import { useState } from "react";
import { quiz } from "../features/chatbot/api";
import type { BotResponse } from "../features/chatbot/schema";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [response, setResponse] = useState<BotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await quiz(topic || undefined, numQuestions);
      setResponse(res);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Quiz</h1>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic (optional)"
      />
      <input
        type="number"
        value={numQuestions}
        min={1}
        max={20}
        onChange={(e) => setNumQuestions(Number(e.target.value))}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating..." : "Generate Quiz"}
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
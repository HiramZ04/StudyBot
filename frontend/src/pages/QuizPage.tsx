import { useState } from "react";
import { quiz } from "../features/chatbot/api";
import type { BotResponse } from "../features/chatbot/schema";

interface QuizQuestion {
  question: string;
  options: { letter: string; text: string }[];
  correctLetter: string;
  explanation: string;
}

function parseQuiz(raw: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // split by lines that start with number + ., * for correct answer
  const blocks = text.split(/\n(?=\*{0,2}\s*\d+\.\s)/);

  for (const block of blocks) {
    const lines = block.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;

    const questionText = lines[0]
      .replace(/^\*{0,2}\s*\d+\.\s*\*{0,2}/, "")
      .replace(/\*+$/, "")
      .trim();
    if (!questionText) continue;

    const options: { letter: string; text: string }[] = [];
    let correctLetter = "";
    const explanationParts: string[] = [];
    let inExplanation = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // explanation bit
      const expMatch = line.match(/^\*{0,2}Explanation\*{0,2}:?\s*\*{0,2}(.*)/i);
      if (expMatch) {
        inExplanation = true;
        if (expMatch[1].trim()) explanationParts.push(expMatch[1].trim());
        continue;
      }
      if (inExplanation) { explanationParts.push(line); continue; }

      // answers
      const answerMatch = line.match(/^\*{0,2}Answer\*{0,2}:?\s*\*{0,2}\s*([A-D])[).]/i);
      if (answerMatch) { correctLetter = answerMatch[1]; continue; }

      const optMatch = line.match(/^([A-D])[).]\s+(.+)$/);
      if (optMatch) {
        options.push({ letter: optMatch[1], text: optMatch[2].trim() });
        continue;
      }
      
      if (options.length === 0 && /^[A-D][).]/.test(line)) {
        for (const m of line.matchAll(/([A-D])[).]\s+(.+?)(?=\s+[A-D][).]|$)/g)) {
          options.push({ letter: m[1], text: m[2].trim() });
        }
      }

      }

      if (options.length > 0) {
        questions.push({
          question: questionText,
          options,
          correctLetter,
          explanation: explanationParts.join(" ").trim(),
      });
    }
  }
  return questions;
}

type Phase = "setup" | "playing" | "done";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setRawFallback(null);
    try {
      const res: BotResponse = await quiz(topic || undefined, numQuestions);
      const parsed = parseQuiz(res.response);
      if (parsed.length === 0) {
        setRawFallback(res.response);
        return;
      }
      setQuestions(parsed);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setPhase("playing");

    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(letter: string) {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(letter);
    if (letter === questions[currentIndex].correctLetter) {
      setScore(s => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setPhase("done");
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    }
  }

  function handleReset() {
    setPhase("setup");
    setQuestions([]);
    setRawFallback(null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setError(null);
  }

  if (phase === "setup") {
    return (
      <div className="quiz-setup">
        <h1>Quiz</h1>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Topic (optional)"
        />
        <div className="quiz-num-row">
          <span className="quiz-num-label">Questions</span>
          <input
            type="number"
            value={numQuestions}
            min={1}
            max={20}
            onChange={e => setNumQuestions(Number(e.target.value))}
            className="quiz-num-input"
          />
        </div>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating…" : "Generate Quiz"}
        </button>
        {error && <p className="error">{error}</p>}
        {rawFallback && (
          <div className="card">
            <p className="response-text">{rawFallback}</p>
          </div>
        )}
      </div>
    );
  }

    if (phase === "done") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-done">
        <h1>Results</h1>
        <div className="quiz-score-card card">
          <span className="quiz-score-fraction">{score} / {questions.length}</span>
          <span className="quiz-score-pct">{pct}%</span>
          <p className="quiz-score-msg">
            {pct === 100 ? "Perfect score!" : pct >= 70 ? "Great job!" : "Keep studying!"}
          </p>
          <button className="btn-primary quiz-new-btn" onClick={handleReset}>
            New Quiz
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const answered = selectedAnswer !== null;
  const isCorrect = answered && selectedAnswer === current.correctLetter;
  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="quiz-playing">
      <div className="quiz-header">
        <span className="quiz-counter">{currentIndex + 1} / {questions.length}</span>
        <span className="quiz-score-live">Score: {score}</span>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card quiz-card">
        <p className="quiz-question">{current.question}</p>

        <div className="quiz-options">
          {current.options.map(opt => {
            let cls = "quiz-option";
            if (answered) {
              if (opt.letter === current.correctLetter) cls += " quiz-option-correct";
              else if (opt.letter === selectedAnswer)   cls += " quiz-option-wrong";
              else                                      cls += " quiz-option-dim";
            }
            return (
              <button
                key={opt.letter}
                className={cls}
                onClick={() => handleSelect(opt.letter)}
                disabled={answered}
              >
                <span className="quiz-option-letter">{opt.letter}</span>
                <span className="quiz-option-text">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`quiz-feedback ${isCorrect ? "quiz-feedback-correct" : "quiz-feedback-wrong"}`}>
            <p className="quiz-feedback-verdict">
              {isCorrect ? "✓ Correct!" : `✗ Correct answer: ${current.correctLetter}`}
            </p>
            {current.explanation && (
              <p className="quiz-feedback-explanation">{current.explanation}</p>
            )}
            <button className="btn-primary quiz-next-btn" onClick={handleNext}>
              {currentIndex + 1 >= questions.length ? "See Results" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
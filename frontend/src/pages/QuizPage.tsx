import { useState } from "react";
import { quiz } from "../features/chatbot/api";
import type { BotResponse } from "../features/chatbot/schema";

interface QuizQuestion {
  question: string;
  options: { letter: string; text: string }[];
  correctLetter: string;
  explanation: string;
}

// used AI to improve parsing for quiz
function parseQuiz(raw: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const flat = normalized.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

  const blockRegex = /(\d+)\.\s*(.*?)(?=\s+\d+\.\s+|$)/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = blockRegex.exec(flat)) !== null) {
    const block = blockMatch[2].trim();
    if (!block) continue;

    const answerMatch = block.match(/(?:Correct\s*answer|Answer)\s*:?\s*([A-D])/i);
    const correctLetter = answerMatch ? answerMatch[1].toUpperCase() : "";

    let mainPart = block;
    let explanation = "";
    if (answerMatch && answerMatch.index !== undefined) {
      const answerIndex = answerMatch.index;
      mainPart = block.slice(0, answerIndex).trim();
      explanation = block.slice(answerIndex + answerMatch[0].length).trim();
      explanation = explanation.replace(/^[:\-–\s]+/, "");
    }

    const optionRegex = /([A-D])[).]\s*([^A-D]+?)(?=\s+[A-D][).]\s+|$)/g;
    const options: { letter: string; text: string }[] = [];
    let firstOptionIndex = -1;
    let optionMatch: RegExpExecArray | null;

    while ((optionMatch = optionRegex.exec(mainPart)) !== null) {
      if (firstOptionIndex < 0) firstOptionIndex = optionMatch.index;
      options.push({
        letter: optionMatch[1].toUpperCase(),
        text: optionMatch[2].trim(),
      });
    }

    if (options.length < 2 || firstOptionIndex < 0) continue;

    let questionText = mainPart.slice(0, firstOptionIndex).trim();
    questionText = questionText.replace(/^["'`]+|["'`]+$/g, "").replace(/[:\-–\s]+$/, "");
    if (!questionText) continue;

    questions.push({
      question: questionText,
      options,
      correctLetter,
      explanation,
    });
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
          className="quiz-topic-input"
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
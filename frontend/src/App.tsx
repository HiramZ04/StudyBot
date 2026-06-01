import { useState } from "react";
import ChatPage from "./pages/ChatPage";
import SummaryPage from "./pages/SummaryPage";
import QuizPage from "./pages/QuizPage";
import FilesPage from "./pages/FilesPage";
import type { CenterTab } from "./features/chatbot/schema";



export default function App() {
    const [sourcesOpen, setSourcesOpen] = useState(true);
    const [quizOpen, setQuizOpen] = useState(true);
    const [centerTab, setCenterTab] = useState<CenterTab>("chat");

    return (
        <>
            <div className="app-shell">
                <header className="topbar">
                    <h1>StudyBot</h1>
                </header>
            </div>

            <div className="panels">


                <div className={`panel-left ${!sourcesOpen ? "panel-collapsed" : ""}`}>
                    <div className="panel-header">
                        <div className="panel-header-left">
                            <span className="panel-title">Sources</span>
                        </div>
                        <button className="panel-toggle" onClick={() => setSourcesOpen(o => !o)}>
                            {/* AI used for arrows */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {sourcesOpen ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                            </svg>
                        </button>
                    </div>
                    <span className="panel-collapsed-label" onClick={() => setSourcesOpen(true)}>Sources</span>
                    <div className="panel-body">
                        <FilesPage />
                    </div>
                </div>


                <div className="panel panel-center">
                    <div className="panel-header">
                        <div className="center-tabs">
                            <button className={`center-tab ${centerTab === "chat" ? "active" : ""}`} onClick={() => setCenterTab("chat")}>Chat</button>
                            <button className={`center-tab ${centerTab === "summary" ? "active" : ""}`} onClick={() => setCenterTab("summary")}>Summary</button>
                        </div>
                    </div>
                    <div className="panel-body">
                        {centerTab === "chat" ? <ChatPage /> : <SummaryPage />}
                    </div>
                </div>


                <div className={`panel panel-right ${!quizOpen ? "panel-collapsed" : ""}`}>
                    <div className="panel-header">
                        <button className="panel-toggle" onClick={() => setQuizOpen(o => !o)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {quizOpen ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
                            </svg>
                        </button>
                        <div className="panel-header-left">
                            <span className="panel-title">Quiz</span>
                        </div>
                    </div>
                    <span className="panel-collapsed-label" onClick={() => setQuizOpen(true)}>Quiz</span>
                    <div className="panel-body">
                        <QuizPage />
                    </div>
                </div>
            </div>
        </>
    );
}
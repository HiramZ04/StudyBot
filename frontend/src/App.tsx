import { useState } from "react";
import NavBar from "./components/NavBar";
import ChatPage from "./pages/ChatPage";
import SummaryPage from "./pages/SummaryPage";
import QuizPage from "./pages/QuizPage";
import FilesPage from "./pages/FilesPage";
import type { PageView } from "./features/chatbot/schema";

export default function App() {
    const [page, setPage] = useState<PageView>("chat");

    return (
        <div>
            <NavBar page={page} setPage={setPage} />
            <main>
                {page === "chat" && <ChatPage/>}
                {page === "summary" && <SummaryPage/>}
                {page === "quiz" && <QuizPage/>}
                {page === "files" && <FilesPage/>}
            </main>
        </div>
    );
}
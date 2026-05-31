import type { PageView } from "../features/chatbot/schema";

interface NavBarProps {
    currentView: PageView;
    onChangeView: (view: PageView) => void;
}

const tabs: { label: string; view: PageView }[] = [
    { label: "Chat", view: "chat" },
    { label: "Summary", view: "summary" },
    { label: "Quiz", view: "quiz" },
    { label: "Files", view: "files" },
];

export default function NavBar({ currentView, onChangeView }: NavBarProps) {
    return (
        <nav className="navbar">
            {tabs.map((tab) => (
                <button
                    key={tab.view}
                    onClick={() => onChangeView(tab.view)}
                    className={currentView === tab.view ? "active" : ""}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
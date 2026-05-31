import type { PageView } from "../features/chatbot/schema";

interface NavBarProps {
    page: PageView;
    setPage: (view: PageView) => void;
}

const tabs: { label: string; view: PageView }[] = [
    { label: "Chat", view: "chat" },
    { label: "Summary", view: "summary" },
    { label: "Quiz", view: "quiz" },
    { label: "Files", view: "files" },
];

export default function NavBar({ page, setPage }: NavBarProps) {
    return (
        <nav className="navbar">
            {tabs.map((tab) => (
                <button
                    key={tab.view}
                    onClick={() => setPage(tab.view)}
                    aria-current={page === tab.view ? "page" : undefined}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
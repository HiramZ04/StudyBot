import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";
import App form "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
    <App />
    </StrictMode>
);
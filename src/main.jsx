import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Global reset + UI polish
const style = document.createElement("style");
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: #0b0e14; overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  ::selection { background: rgba(230,57,70,0.3); color: #fff; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0b0e14; }
  ::-webkit-scrollbar-thumb { background: #2a3145; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #3a4460; }
  input::placeholder { color: #7d879e; }
  textarea::placeholder { color: #7d879e; }
  button { font-family: inherit; cursor: pointer; }
  button:disabled { cursor: not-allowed; }
  code { font-family: 'Source Code Pro', monospace; }
  a { transition: color 0.2s ease, opacity 0.2s ease; }
  img { max-width: 100%; height: auto; }

  /* Focus states for accessibility */
  :focus-visible { outline: 2px solid #e63946; outline-offset: 2px; border-radius: 4px; }
  button:focus:not(:focus-visible) { outline: none; }
  input:focus-visible, textarea:focus-visible { outline: 2px solid #e63946; outline-offset: 0; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  }

  /* Mobile layout fixes */
  @media (max-width: 768px) {
    body { font-size: 16px; }
    h1 { font-size: clamp(28px, 7vw, 36px) !important; }
    h2 { font-size: clamp(22px, 5vw, 30px) !important; }
    section { padding-left: 16px !important; padding-right: 16px !important; }
    pre { font-size: 11px !important; overflow-x: auto; }
    nav > div { padding: 0 16px !important; }
  }

  @media (max-width: 480px) {
    h1 { font-size: clamp(24px, 6vw, 30px) !important; }
    nav > div { padding: 0 12px !important; }
  }

  /* Smooth page transitions */
  #root > div > div > div:nth-child(2) { animation: pageIn 0.3s ease-out; }
  @keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* Better grid responsiveness */
  @media (max-width: 640px) {
    div[style*="grid-template-columns: repeat(auto-fit"] { grid-template-columns: 1fr !important; }
    div[style*="gridTemplateColumns"][style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
  }

  /* Touch targets */
  @media (pointer: coarse) {
    button, a, [role="button"] { min-height: 44px; }
    input, textarea, select { min-height: 44px; font-size: 16px; }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

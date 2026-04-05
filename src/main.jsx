import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Global reset
const style = document.createElement("style");
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0b0e14; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  ::selection { background: rgba(230,57,70,0.3); color: #fff; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0b0e14; }
  ::-webkit-scrollbar-thumb { background: #2a3145; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #3a4460; }
  input::placeholder { color: #7d879e; }
  button { font-family: inherit; }
  code { font-family: 'Source Code Pro', monospace; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

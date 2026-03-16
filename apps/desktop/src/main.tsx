import React from "react";
import ReactDOM from "react-dom/client";
import { Popover } from "./Popover";
import { Settings } from "./Settings";

function App() {
  // Determine which window we're in based on the Tauri window label
  const label = (window as any).__TAURI_INTERNALS__?.metadata?.currentWindow?.label;

  if (label === "settings") {
    return <Settings />;
  }

  // Default: popover (the floating rewrite prompt)
  return <Popover />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

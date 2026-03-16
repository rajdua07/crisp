import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { fetch } from "@tauri-apps/plugin-http";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface PasteDetected {
  text: string;
  ai_confidence: number;
}

const API_BASE = "http://localhost:3000"; // Dev default, configurable in settings

/**
 * Floating popover that appears when AI-generated content is detected
 * in the clipboard. Shows a one-click "Rewrite in your voice" action.
 */
export function Popover() {
  const [paste, setPaste] = useState<PasteDetected | null>(null);
  const [status, setStatus] = useState<"idle" | "rewriting" | "done" | "error">("idle");
  const [rewritten, setRewritten] = useState("");

  useEffect(() => {
    const unlisten = listen<PasteDetected>("paste-detected", (event) => {
      setPaste(event.payload);
      setStatus("idle");
      setRewritten("");
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleRewrite = async () => {
    if (!paste) return;
    setStatus("rewriting");

    try {
      // Get auth token from localStorage (set during login flow)
      const authToken = localStorage.getItem("crisp_auth_token") || "";

      const response = await fetch(`${API_BASE}/api/crisp/quick-rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          input_text: paste.text,
          context: "clipboard_paste",
        }),
      });

      const data = await response.json() as { rewritten: string };
      setRewritten(data.rewritten);

      // Auto-copy the rewritten text to clipboard
      await writeText(data.rewritten);
      setStatus("done");

      // Auto-hide after 3 seconds
      setTimeout(() => {
        getCurrentWindow().hide();
      }, 3000);
    } catch {
      setStatus("error");
    }
  };

  const handleDismiss = () => {
    getCurrentWindow().hide();
  };

  if (!paste) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
              <path d="M8 14v1a4 4 0 0 0 8 0v-1" />
            </svg>
            <span style={styles.logoText}>Crisp</span>
          </div>
          <button onClick={handleDismiss} style={styles.dismiss}>×</button>
        </div>

        {/* Confidence indicator */}
        <div style={styles.confidence}>
          <div style={{
            ...styles.confidenceBar,
            width: `${Math.round(paste.ai_confidence * 100)}%`,
            backgroundColor: paste.ai_confidence > 0.6 ? "#f87171" : "#fbbf24",
          }} />
          <span style={styles.confidenceLabel}>
            {Math.round(paste.ai_confidence * 100)}% AI detected
          </span>
        </div>

        {/* Preview of pasted text */}
        <div style={styles.preview}>
          {paste.text.substring(0, 120)}
          {paste.text.length > 120 ? "..." : ""}
        </div>

        {/* Action area */}
        {status === "idle" && (
          <button onClick={handleRewrite} style={styles.rewriteBtn}>
            Rewrite in your voice
          </button>
        )}

        {status === "rewriting" && (
          <div style={styles.rewriting}>
            <div style={styles.spinner} />
            Rewriting in your voice...
          </div>
        )}

        {status === "done" && (
          <div style={styles.done}>
            Copied to clipboard — just paste again
          </div>
        )}

        {status === "error" && (
          <div style={styles.errorMsg}>
            Failed to rewrite. <button onClick={handleRewrite} style={styles.retry}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "8px",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    background: "rgba(15, 15, 20, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 16,
    boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
    color: "#e5e5e5",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  logoText: {
    fontSize: 13,
    fontWeight: 700,
    color: "#6ee7b7",
    letterSpacing: "-0.02em",
  },
  dismiss: {
    background: "none",
    border: "none",
    color: "#666",
    fontSize: 18,
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: 4,
    lineHeight: 1,
  },
  confidence: {
    position: "relative" as const,
    height: 20,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  confidenceBar: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: 6,
    opacity: 0.2,
    transition: "width 0.3s ease",
  },
  confidenceLabel: {
    position: "relative" as const,
    fontSize: 10,
    fontWeight: 500,
    lineHeight: "20px",
    paddingLeft: 8,
    color: "#999",
  },
  preview: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "#888",
    marginBottom: 14,
    padding: "8px 10px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.04)",
    maxHeight: 60,
    overflow: "hidden",
  },
  rewriteBtn: {
    width: "100%",
    padding: "10px 0",
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "-0.01em",
  },
  rewriting: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 12,
    color: "#6ee7b7",
    padding: "10px 0",
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid rgba(110,231,183,0.2)",
    borderTopColor: "#6ee7b7",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  done: {
    fontSize: 12,
    color: "#6ee7b7",
    textAlign: "center" as const,
    padding: "10px 0",
    fontWeight: 500,
  },
  errorMsg: {
    fontSize: 12,
    color: "#f87171",
    textAlign: "center" as const,
    padding: "10px 0",
  },
  retry: {
    background: "none",
    border: "none",
    color: "#6ee7b7",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 12,
  },
};

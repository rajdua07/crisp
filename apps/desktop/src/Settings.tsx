import React, { useState, useEffect } from "react";

/**
 * Settings window — shown when the user clicks the tray icon.
 * Lets them log in, configure voice profile, and set preferences.
 */
export function Settings() {
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem("crisp_api_url") || "https://crisp.app"
  );
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("crisp_auth_token") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sensitivity, setSensitivity] = useState(
    () => Number(localStorage.getItem("crisp_sensitivity") || "30")
  );
  const [autoRewrite, setAutoRewrite] = useState(
    () => localStorage.getItem("crisp_auto_rewrite") === "true"
  );

  useEffect(() => {
    setIsLoggedIn(!!authToken);
  }, [authToken]);

  const handleSave = () => {
    localStorage.setItem("crisp_api_url", apiUrl);
    localStorage.setItem("crisp_auth_token", authToken);
    localStorage.setItem("crisp_sensitivity", String(sensitivity));
    localStorage.setItem("crisp_auto_rewrite", String(autoRewrite));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Crisp</h1>
        <span style={styles.subtitle}>Make AI sound like you</span>
      </div>

      {/* Login status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Account</h2>
        {isLoggedIn ? (
          <div style={styles.loggedIn}>
            <div style={styles.statusDot} />
            Connected to Crisp
          </div>
        ) : (
          <div>
            <p style={styles.hint}>
              Paste your API token from crisp.app/settings to connect.
            </p>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Paste your auth token"
              style={styles.input}
            />
          </div>
        )}
      </div>

      {/* Detection sensitivity */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>AI Detection Sensitivity</h2>
        <p style={styles.hint}>
          How confident should Crisp be that the text is AI-generated before offering to rewrite?
        </p>
        <div style={styles.sliderRow}>
          <span style={styles.sliderLabel}>Aggressive</span>
          <input
            type="range"
            min="10"
            max="80"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.sliderLabel}>Conservative</span>
        </div>
        <div style={styles.sliderValue}>{sensitivity}% threshold</div>
      </div>

      {/* Auto-rewrite toggle */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Behavior</h2>
        <label style={styles.toggle}>
          <input
            type="checkbox"
            checked={autoRewrite}
            onChange={(e) => setAutoRewrite(e.target.checked)}
          />
          <span style={styles.toggleLabel}>
            Auto-rewrite without asking (replaces clipboard immediately)
          </span>
        </label>
      </div>

      {/* API URL (for dev/self-host) */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Advanced</h2>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="API URL"
          style={styles.input}
        />
      </div>

      <button onClick={handleSave} style={styles.saveBtn}>
        Save Settings
      </button>

      <p style={styles.footer}>
        Crisp runs in your menu bar and watches for AI-generated content on your
        clipboard. When detected, it offers to rewrite it in your voice.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 28,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#e5e5e5",
    background: "#0f0f14",
    minHeight: "100vh",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#6ee7b7",
    margin: 0,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#ccc",
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#e5e5e5",
    fontSize: 13,
    outline: "none",
  },
  loggedIn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#6ee7b7",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#6ee7b7",
  },
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  slider: {
    flex: 1,
    accentColor: "#6ee7b7",
  },
  sliderLabel: {
    fontSize: 11,
    color: "#666",
    minWidth: 70,
  },
  sliderValue: {
    fontSize: 11,
    color: "#999",
    textAlign: "center" as const,
    marginTop: 4,
  },
  toggle: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    cursor: "pointer",
  },
  toggleLabel: {
    fontSize: 13,
    color: "#aaa",
    lineHeight: 1.4,
  },
  saveBtn: {
    width: "100%",
    padding: "12px 0",
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 16,
  },
  footer: {
    fontSize: 11,
    color: "#444",
    textAlign: "center" as const,
    lineHeight: 1.5,
  },
};

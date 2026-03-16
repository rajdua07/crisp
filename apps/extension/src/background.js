/**
 * Crisp Background Service Worker
 *
 * Handles auth state and communication between popup and content scripts.
 */

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_CONFIG") {
    chrome.storage.sync.get(["apiUrl", "authToken", "enabled", "sensitivity"], (config) => {
      sendResponse({
        apiUrl: config.apiUrl || "https://crisp.app",
        authToken: config.authToken || "",
        enabled: config.enabled !== false,
        sensitivity: config.sensitivity || 30,
      });
    });
    return true; // Will respond asynchronously
  }

  if (message.type === "SAVE_CONFIG") {
    chrome.storage.sync.set(message.config, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Show badge when extension is active
chrome.storage.sync.get(["enabled"], (config) => {
  updateBadge(config.enabled !== false);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    updateBadge(changes.enabled.newValue !== false);
  }
});

function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#666" });
}

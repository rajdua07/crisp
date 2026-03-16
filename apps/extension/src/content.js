/**
 * Crisp Content Script
 *
 * Detects paste events in text fields across all websites.
 * When AI-generated content is detected, shows an inline popover
 * offering to rewrite in the user's voice.
 */

const AI_MARKERS = [
  "comprehensive analysis",
  "leverage",
  "synergy",
  "multi-pronged",
  "it's important to note",
  "in conclusion",
  "delve into",
  "i hope this message finds you well",
  "it's worth noting",
  "in today's",
  "navigate the complexities",
  "holistic approach",
  "streamline",
  "actionable insights",
  "circle back",
  "deep dive",
  "best practices",
  "key takeaways",
  "cutting-edge",
  "at the end of the day",
  "moving forward",
  "game-changer",
];

const CONFIDENCE_THRESHOLD = 0.3;

/**
 * Quick heuristic: how likely is this text AI-generated?
 */
function estimateAIProbability(text) {
  const lower = text.toLowerCase();
  const matches = AI_MARKERS.filter((m) => lower.includes(m)).length;
  let score = Math.min(matches * 0.15, 0.9);

  // Long unbroken paragraphs
  const paragraphs = text.split("\n\n").filter((p) => p.trim());
  const avgLen = paragraphs.length > 0 ? text.length / paragraphs.length : 0;
  if (avgLen > 200) score += 0.15;

  // Em dashes
  if (text.includes("—")) score += 0.1;

  return Math.min(score, 1.0);
}

/**
 * Detect which app/site the user is on for context-aware rewriting.
 */
function detectContext() {
  const host = window.location.hostname;
  if (host.includes("slack.com")) return "slack";
  if (host.includes("mail.google.com")) return "gmail";
  if (host.includes("outlook")) return "outlook";
  if (host.includes("notion.so") || host.includes("notion.site")) return "notion";
  if (host.includes("docs.google.com")) return "google_docs";
  if (host.includes("linkedin.com")) return "linkedin";
  if (host.includes("discord.com")) return "discord";
  return "unknown";
}

/**
 * Creates and shows the Crisp popover near the paste target.
 */
function showPopover(targetElement, pastedText, confidence) {
  // Remove any existing popover
  removePopover();

  const popover = document.createElement("div");
  popover.id = "crisp-popover";
  popover.className = "crisp-popover";

  popover.innerHTML = `
    <div class="crisp-popover-inner">
      <div class="crisp-popover-header">
        <div class="crisp-popover-logo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
            <path d="M8 14v1a4 4 0 0 0 8 0v-1"/>
          </svg>
          <span>Crisp</span>
        </div>
        <span class="crisp-popover-confidence">${Math.round(confidence * 100)}% AI</span>
        <button class="crisp-popover-dismiss" id="crisp-dismiss">×</button>
      </div>
      <button class="crisp-popover-btn" id="crisp-rewrite">
        Rewrite in your voice
      </button>
      <div class="crisp-popover-status" id="crisp-status" style="display:none"></div>
    </div>
  `;

  // Position near the target element
  const rect = targetElement.getBoundingClientRect();
  popover.style.position = "fixed";
  popover.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 100)}px`;
  popover.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
  popover.style.zIndex = "2147483647";

  document.body.appendChild(popover);

  // Wire up dismiss
  document.getElementById("crisp-dismiss").addEventListener("click", removePopover);

  // Wire up rewrite
  document.getElementById("crisp-rewrite").addEventListener("click", async () => {
    const btn = document.getElementById("crisp-rewrite");
    const status = document.getElementById("crisp-status");
    btn.style.display = "none";
    status.style.display = "block";
    status.textContent = "Rewriting in your voice...";
    status.className = "crisp-popover-status crisp-loading";

    try {
      const config = await chrome.storage.sync.get(["apiUrl", "authToken"]);
      const apiUrl = config.apiUrl || "https://crisp.app";
      const context = detectContext();

      const response = await fetch(`${apiUrl}/api/crisp/quick-rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {}),
        },
        body: JSON.stringify({ input_text: pastedText, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Replace the content in the field
      replaceContent(targetElement, pastedText, data.rewritten);

      status.textContent = "Done — rewritten in your voice";
      status.className = "crisp-popover-status crisp-done";

      setTimeout(removePopover, 2000);
    } catch (err) {
      status.textContent = "Failed to rewrite";
      status.className = "crisp-popover-status crisp-error";
      btn.style.display = "block";
      btn.textContent = "Retry";
    }
  });

  // Auto-dismiss after 10 seconds if no action taken
  setTimeout(() => {
    if (document.getElementById("crisp-popover")) {
      removePopover();
    }
  }, 10000);
}

/**
 * Replace content in text fields / contenteditable elements.
 */
function replaceContent(element, originalText, newText) {
  if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
    // Standard form elements
    const currentValue = element.value;
    const startIdx = currentValue.lastIndexOf(originalText.substring(0, 50));
    if (startIdx !== -1) {
      element.value =
        currentValue.substring(0, startIdx) +
        newText +
        currentValue.substring(startIdx + originalText.length);
    } else {
      element.value = newText;
    }
    // Trigger input event so frameworks pick up the change
    element.dispatchEvent(new Event("input", { bubbles: true }));
  } else if (element.isContentEditable) {
    // ContentEditable (Slack, Gmail, Notion, etc.)
    // Use execCommand for undo support
    document.execCommand("selectAll", false, null);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      // Try to find and select just the pasted content
      const range = document.createRange();
      range.selectNodeContents(element);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    document.execCommand("insertText", false, newText);
  }
}

function removePopover() {
  const existing = document.getElementById("crisp-popover");
  if (existing) existing.remove();
}

/**
 * Listen for paste events on the entire page.
 */
document.addEventListener(
  "paste",
  (event) => {
    const text = event.clipboardData?.getData("text/plain");
    if (!text || text.length < 50) return;

    const confidence = estimateAIProbability(text);
    if (confidence < CONFIDENCE_THRESHOLD) return;

    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.tagName === "TEXTAREA" ||
        target.tagName === "INPUT" ||
        target.isContentEditable)
    ) {
      // Small delay to let the paste complete
      setTimeout(() => showPopover(target, text, confidence), 200);
    }
  },
  true
);

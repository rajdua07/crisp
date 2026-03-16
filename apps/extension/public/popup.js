// Load saved config
chrome.storage.sync.get(["apiUrl", "authToken", "enabled"], (config) => {
  document.getElementById("apiUrl").value = config.apiUrl || "https://crisp.app";
  document.getElementById("authToken").value = config.authToken || "";
  document.getElementById("enabled").checked = config.enabled !== false;
});

// Save config
document.getElementById("save").addEventListener("click", () => {
  const config = {
    apiUrl: document.getElementById("apiUrl").value.replace(/\/$/, ""),
    authToken: document.getElementById("authToken").value,
    enabled: document.getElementById("enabled").checked,
  };

  chrome.storage.sync.set(config, () => {
    const status = document.getElementById("status");
    status.style.display = "block";
    setTimeout(() => {
      status.style.display = "none";
    }, 2000);
  });
});

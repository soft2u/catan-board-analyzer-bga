async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0] || null;
}

function setStatus(text, isError = false) {
  const node = document.getElementById("status");
  node.textContent = text;
  node.style.color = isError ? "#b00020" : "#333";
}

async function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  try {
    setStatus("Checking page...");

    const tab = await getActiveTab();

    if (!tab?.id) {
      throw new Error("No active tab found");
    }

    if (!tab.url || !tab.url.includes("boardgamearena.com")) {
      throw new Error("Open a Board Game Arena Catan page first");
    }

    setStatus("Sending analyze command...");
    const response = await sendMessageToTab(tab.id, {
      type: "ANALYZE_CURRENT_BOARD"
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not analyze board");
    }

    setStatus("Analytics opened.");
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : String(error),
      true
    );
  }
});
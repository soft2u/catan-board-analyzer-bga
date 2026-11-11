(() => {
  "use strict";

  const EXTENSION_BUTTON_ID = "soft2u-catan-analyze-btn";
  const EXTENSION_STATUS_ID = "soft2u-catan-analyze-status";

  function isCatanPage() {
    return /\/catan(\?|$|\/)/i.test(location.pathname + location.search);
  }

  function tileKey(tile) {
    return `${tile.x}:${tile.y}`;
  }

  function normalizeClassicTileOrder(tiles) {
    const expectedOrder = [
      "1:2", "1:3", "1:4",
      "2:1", "2:2", "2:3", "2:4",
      "3:1", "3:2", "3:3", "3:4", "3:5",
      "4:1", "4:2", "4:3", "4:4",
      "5:2", "5:3", "5:4"
    ];

    const map = new Map(tiles.map(tile => [tileKey(tile), tile]));

    return expectedOrder
      .map(key => map.get(key))
      .filter(Boolean);
  }

  function requestBoardFromMainWorld() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "EXTRACT_BOARD_FROM_MAIN_WORLD" },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response?.ok) {
            reject(new Error(response?.error || "Could not extract board"));
            return;
          }

          resolve(response.raw);
        }
      );
    });
  }

  function buildPayloadFromRaw(raw) {
    const orderedTiles = normalizeClassicTileOrder(raw.tiles || []);
    const variant = orderedTiles.length === 19 ? "classic" : "unknown";
    let tableId = raw.table_id;
    if (typeof tableId === "number") {
      tableId = Number.isSafeInteger(tableId) && tableId > 0 ? String(tableId) : null;
    }
    tableId = typeof tableId === "string" && tableId.length <= 20 && !/\D/.test(tableId)
      ? tableId.replace(/^0+/, "")
      : null;

    return {
      source: "boardgamearena",
      game: "catan",
      variant,
      ...(tableId ? { table_id: tableId } : {}),
      map: {
        tiles: orderedTiles.map((tile, index) => ({
          index,
          x: Number(tile.x),
          y: Number(tile.y),
          type: Number(tile.type),
          dice_value: tile.dice_value === null ? null : Number(tile.dice_value)
        })),
        harbours: (raw.harbours || []).map(h => ({
          x: Number(h.x),
          y: Number(h.y),
          z: String(h.z),
          type: Number(h.type)
        }))
      }
    };
  }

  function sendPayloadToBackground(payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "OPEN_ANALYTICS",
          payload
        },
        response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response?.ok) {
            reject(new Error(response?.error || "Unknown background error"));
            return;
          }

          resolve(response);
        }
      );
    });
  }

  function getOrCreateStatusNode(container) {
    let status = document.getElementById(EXTENSION_STATUS_ID);

    if (!status) {
      status = document.createElement("div");
      status.id = EXTENSION_STATUS_ID;
      status.style.marginTop = "8px";
      status.style.fontSize = "12px";
      status.style.opacity = "0.9";
      container.appendChild(status);
    }

    return status;
  }

  function setStatus(text, isError = false) {
    const root = document.getElementById(EXTENSION_BUTTON_ID)?.parentElement;
    if (!root) return;

    const status = getOrCreateStatusNode(root);
    status.textContent = text;
    status.style.color = isError ? "#ffd2d2" : "#ffffff";
  }

  async function analyzeBoard() {
    try {
      setStatus("Reading board...");
      const raw = await requestBoardFromMainWorld();
      const payload = buildPayloadFromRaw(raw);

      if (!payload.map.tiles.length) {
        throw new Error("No Catan land tiles detected");
      }

      setStatus(`Detected ${payload.map.tiles.length} land tiles. Opening analytics...`);
      await sendPayloadToBackground(payload);
      setStatus("Analytics opened.");
      return { ok: true };
    } catch (error) {
      console.error("Catan BGA Analyzer error:", error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(message, true);
      return { ok: false, error: message };
    }
  }

  function injectFloatingButton() {
    if (document.getElementById(EXTENSION_BUTTON_ID)) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.right = "16px";
    wrapper.style.bottom = "16px";
    wrapper.style.zIndex = "999999";
    wrapper.style.background = "#1f2937";
    wrapper.style.color = "#fff";
    wrapper.style.padding = "12px";
    wrapper.style.borderRadius = "10px";
    wrapper.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.maxWidth = "260px";

    const title = document.createElement("div");
    title.textContent = "Catan analytics";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "8px";
    wrapper.appendChild(title);

    const disclosure = document.createElement("div");
    disclosure.textContent =
      "Sends board tiles, numbers, harbors, and the BGA table ID when available to catan.soft2u.ro. The service saves a public, shareable board. By choosing Send, you consent to service administrators inspecting this submitted board and table ID for import support and diagnostics.";
    disclosure.style.fontSize = "12px";
    disclosure.style.lineHeight = "1.35";
    disclosure.style.marginBottom = "8px";
    wrapper.appendChild(disclosure);

    const behaviorNote = document.createElement("div");
    behaviorNote.textContent =
      "Reads loaded board data, or visible board elements as a fallback. Adds this button without changing the game state or making moves.";
    behaviorNote.style.fontSize = "11px";
    behaviorNote.style.lineHeight = "1.35";
    behaviorNote.style.marginBottom = "8px";
    wrapper.appendChild(behaviorNote);

    const fairPlay = document.createElement("div");
    fairPlay.textContent = "Use only where live analysis is permitted.";
    fairPlay.style.fontSize = "11px";
    fairPlay.style.lineHeight = "1.35";
    fairPlay.style.marginBottom = "8px";
    fairPlay.style.color = "#fde68a";
    wrapper.appendChild(fairPlay);

    const button = document.createElement("button");
    button.id = EXTENSION_BUTTON_ID;
    button.textContent = "Send board for analysis";
    button.style.border = "0";
    button.style.borderRadius = "8px";
    button.style.padding = "10px 12px";
    button.style.cursor = "pointer";
    button.style.width = "100%";
    button.style.fontWeight = "bold";

    button.addEventListener("click", analyzeBoard);

    wrapper.appendChild(button);
    document.body.appendChild(wrapper);
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "EXTRACT_CURRENT_BOARD") {
      requestBoardFromMainWorld()
        .then(raw => {
          const payload = buildPayloadFromRaw(raw);
          sendResponse({ ok: true, payload });
        })
        .catch(error => {
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : String(error)
          });
        });

      return true;
    }

    if (message?.type === "ANALYZE_CURRENT_BOARD") {
      analyzeBoard()
        .then(sendResponse)
        .catch(error =>
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : String(error)
          })
        );

      return true;
    }

    return false;
  });

  function init() {
    if (!isCatanPage()) {
      return;
    }

    injectFloatingButton();
  }

  init();
})();

function normalizeBgaTableId(value) {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value <= 0) return null;
    value = String(value);
  }
  if (typeof value !== "string" || !value || value.length > 20 || /\D/.test(value)) return null;
  const normalized = value.replace(/^0+/, "");
  return normalized || null;
}

function tableIdFromBgaUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" || url.username || url.password || url.port ||
      !(url.hostname === "boardgamearena.com" || url.hostname.endsWith(".boardgamearena.com"))
    ) return null;
    const values = url.searchParams.getAll("table");
    return values.length === 1 ? normalizeBgaTableId(values[0]) : null;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === "EXTRACT_BOARD_FROM_MAIN_WORLD") {
        const tabId = sender.tab?.id;

        if (!tabId) {
          throw new Error("No sender tab id");
        }

        const results = await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          world: "MAIN",
          func: () => {
            // MAIN-world injection is serialized by Chrome and must be self-contained.
            const normalizeTableId = (value) => {
              if (typeof value === "number") {
                if (!Number.isSafeInteger(value) || value <= 0) return null;
                value = String(value);
              }
              if (typeof value !== "string" || !value || value.length > 20 || /\D/.test(value)) return null;
              return value.replace(/^0+/, "") || null;
            };
            const tableIdFromPage = () => {
              try {
                const url = new URL(location.href);
                if (
                  url.protocol !== "https:" || url.username || url.password || url.port ||
                  !(url.hostname === "boardgamearena.com" || url.hostname.endsWith(".boardgamearena.com"))
                ) return null;
                const values = url.searchParams.getAll("table");
                return values.length === 1 ? normalizeTableId(values[0]) : null;
              } catch {
                return null;
              }
            };

            const extractBoardFromDom = () => {
              const tileTypes = {
                Hills: 2,
                Forest: 3,
                Mountain: 4,
                Field: 5,
                Pasture: 6,
                Desert: 7
              };
              const harbourTypes = {
                three: 0,
                brick: 2,
                lumber: 3,
                ore: 4,
                grain: 5,
                wool: 6
              };

              const tiles = Array.from(
                document.querySelectorAll(".cat_hex[data-row][data-col]")
              )
                .map((hex) => {
                  const typeName = Object.keys(tileTypes).find((name) =>
                    hex.classList.contains(`cat_${name}`)
                  );

                  if (!typeName) {
                    return null;
                  }

                  const numberToken = hex.querySelector(".cat_num_token");
                  const numberClass = numberToken
                    ? Array.from(numberToken.classList).find((className) =>
                        /^cat_num_\d+$/.test(className)
                      )
                    : null;

                  return {
                    x: Number(hex.dataset.row),
                    y: Number(hex.dataset.col),
                    type: tileTypes[typeName],
                    dice_value:
                      typeName === "Desert" || !numberClass
                        ? null
                        : Number(numberClass.replace("cat_num_", ""))
                  };
                })
                .filter(Boolean);

              if (!tiles.length) {
                return null;
              }

              const harbours = Array.from(
                document.querySelectorAll('[id^="cat_shiponboard_"]')
              )
                .map((harbour) => {
                  const match = harbour.id.match(
                    /^cat_shiponboard_(\d+)_(\d+)_([A-Z])$/
                  );
                  const typeName = Object.keys(harbourTypes).find((name) =>
                    harbour.querySelector(`.cat_${name}`)
                  );

                  if (!match || !typeName) {
                    return null;
                  }

                  return {
                    x: Number(match[1]),
                    y: Number(match[2]),
                    z: match[3],
                    type: harbourTypes[typeName]
                  };
                })
                .filter(Boolean);

              return {
                tiles,
                harbours
              };
            };

            const gameui = window.gameui || null;
            const gd =
              gameui?.gamedatas ||
              gameui?.gameData ||
              gameui?.data ||
              window.gamedatas ||
              null;

            const isLandTile = (tile) => String(tile.type) !== "0";
            const board = Array.isArray(gd?.map?.tiles)
              ? {
                  tiles: gd.map.tiles.filter(isLandTile),
                  harbours: gd.map.harbours || []
                }
              : extractBoardFromDom();
            if (!board) return null;

            const tableId = normalizeTableId(gameui?.table_id) ||
              normalizeTableId(gd?.table_id) || tableIdFromPage();
            if (tableId) board.table_id = tableId;
            return board;
          }
        });

        const boardFrame = results?.find(
          (entry) => Array.isArray(entry.result?.tiles) && entry.result.tiles.length
        );
        let raw = boardFrame?.result;

        if (!raw) {
          throw new Error(
            "No Catan board found. Wait for the live game board to finish loading and try again."
          );
        }

        // A replay iframe may omit table identity while its BGA parent URL has it.
        // Never borrow metadata from another injected frame or from replay path numbers.
        if (!normalizeBgaTableId(raw.table_id) && Number.isInteger(boardFrame.frameId) && boardFrame.frameId > 0) {
          const tableId = tableIdFromBgaUrl(sender.tab?.url);
          if (tableId) raw = { ...raw, table_id: tableId };
        }

        sendResponse({ ok: true, raw });
        return;
      }

      if (message?.type === "OPEN_ANALYTICS" && message.payload) {
        const encodedPayload = encodeURIComponent(JSON.stringify(message.payload));
        const url = `${chrome.runtime.getURL("import.html")}#${encodedPayload}`;

        chrome.tabs.create({ url: url.toString() }, () => {
          sendResponse({ ok: true });
        });

        return;
      }

      if (message?.type === "PING") {
        sendResponse({ ok: true });
        return;
      }

      sendResponse({ ok: false, error: "Unknown message type" });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  })();

  return true;
});

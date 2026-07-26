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

            if (!gd?.map || !Array.isArray(gd.map.tiles)) {
              return extractBoardFromDom();
            }

            const isLandTile = (tile) => String(tile.type) !== "0";

            return {
              tiles: (gd.map.tiles || []).filter(isLandTile),
              harbours: gd.map.harbours || []
            };
          }
        });

        const raw = results
          ?.map((entry) => entry.result)
          .find((result) => Array.isArray(result?.tiles) && result.tiles.length);

        if (!raw) {
          throw new Error(
            "No Catan board found. Wait for the live game board to finish loading and try again."
          );
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

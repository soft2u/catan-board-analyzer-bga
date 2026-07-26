const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadBackground({ executeScript = async () => [] } = {}) {
  let messageListener;
  const createdTabs = [];

  const sandbox = {
    URL,
    console,
    chrome: {
      runtime: {
        getURL(resource) {
          return `chrome-extension://test-extension/${resource}`;
        },
        onMessage: {
          addListener(listener) {
            messageListener = listener;
          },
        },
      },
      scripting: {
        executeScript,
      },
      tabs: {
        create(options, callback) {
          createdTabs.push(options);
          callback?.();
        },
      },
    },
  };

  const source = fs.readFileSync(
    path.join(__dirname, "background.js"),
    "utf8"
  );
  vm.runInNewContext(source, sandbox, { filename: "background.js" });

  return { createdTabs, messageListener };
}

function sendMessage(message, sender, messageListener) {
  return new Promise((resolve) => {
    const keepChannelOpen = messageListener(message, sender, resolve);
    assert.equal(keepChannelOpen, true);
  });
}

test("OPEN_ANALYTICS hands the payload to the packaged POST page without a query string", async () => {
  const { createdTabs, messageListener } = loadBackground();
  const payload = {
    source: "boardgamearena",
    game: "catan",
    variant: "classic",
    map: {
      robber: 7,
      tiles: [{ x: 0, y: 0, type: "forest", dice_value: 6 }],
      harbours: [],
    },
  };

  const response = await sendMessage(
    { type: "OPEN_ANALYTICS", payload },
    { tab: { id: 42 } },
    messageListener
  );

  assert.equal(response?.ok, true);
  assert.equal(createdTabs.length, 1);

  const importUrl = new URL(createdTabs[0].url);
  assert.equal(importUrl.protocol, "chrome-extension:");
  assert.equal(importUrl.hostname, "test-extension");
  assert.equal(importUrl.pathname, "/import.html");
  assert.equal(importUrl.search, "");
  assert.deepEqual(
    JSON.parse(decodeURIComponent(importUrl.hash.slice(1))),
    payload
  );
});

test("live tables search every frame and use the board returned by the game iframe", async () => {
  let injection;
  const iframeBoard = {
    tiles: [
      { x: 1, y: 2, type: 5, dice_value: 5 },
      { x: 1, y: 3, type: 4, dice_value: 5 },
    ],
    harbours: [],
  };
  const { messageListener } = loadBackground({
    executeScript: async (details) => {
      injection = details;
      return [
        { frameId: 0, result: null },
        { frameId: 7, result: iframeBoard },
      ];
    },
  });

  const response = await sendMessage(
    { type: "EXTRACT_BOARD_FROM_MAIN_WORLD" },
    { tab: { id: 42 } },
    messageListener
  );

  assert.equal(injection.target.tabId, 42);
  assert.equal(injection.target.allFrames, true);
  assert.equal(injection.world, "MAIN");
  assert.equal(response?.ok, true);
  assert.equal(response.raw, iframeBoard);
});

test("release extraction does not collect page identity, players, or debug game state", () => {
  const backgroundSource = fs.readFileSync(
    path.join(__dirname, "background.js"),
    "utf8"
  );
  const contentSource = fs.readFileSync(
    path.join(__dirname, "content.js"),
    "utf8"
  );

  assert.doesNotMatch(contentSource, /location\.href|document\.title|extracted_at/);
  assert.doesNotMatch(backgroundSource, /players\s*:|__BGA_GD|safeStringify/);
  assert.doesNotMatch(contentSource, /dice_roll|robber\s*:/);
});

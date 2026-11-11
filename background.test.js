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
    table_id: "99999999999999999999",
    map: {
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

test("release extraction does not collect full page identity, players, or debug game state", () => {
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

const boardMap = {
  tiles: [{ x: 1, y: 2, type: 3, dice_value: 6 }],
  harbours: [],
};

function domBoard() {
  const classes = ["cat_hex", "cat_Hills"];
  classes.contains = (value) => classes.includes(value);
  const hex = {
    classList: classes,
    dataset: { row: "1", col: "2" },
    querySelector: () => ({ classList: ["cat_num_token", "cat_num_6"] }),
  };
  return {
    querySelectorAll(selector) {
      if (selector === ".cat_hex[data-row][data-col]") return [hex];
      return [];
    },
  };
}

async function extractFrames(frames, tabUrl) {
  let injection;
  const { messageListener } = loadBackground({
    executeScript: async (details) => {
      injection = details;
      return frames.map((frame) => ({
        frameId: frame.frameId ?? 0,
        // Run the function without service-worker globals, as Chrome serializes it.
        result: vm.runInNewContext(`(${details.func.toString()})()`, {
          window: frame.window || {},
          document: frame.document || { querySelectorAll: () => [] },
          location: { href: frame.url || "https://boardgamearena.com/catan" },
          URL,
        }),
      }));
    },
  });
  const response = await sendMessage(
    { type: "EXTRACT_BOARD_FROM_MAIN_WORLD" },
    { tab: { id: 42, url: tabUrl } },
    messageListener
  );
  return { response: JSON.parse(JSON.stringify(response)), injection };
}

test("serialized MAIN extraction prefers the selected frame runtime table over other frames and URLs", async () => {
  const { response, injection } = await extractFrames([
    { frameId: 0, window: { gameui: { table_id: 11 } }, url: "https://boardgamearena.com/table?table=12" },
    { frameId: 7, window: { gameui: {
      table_id: "000123", gamedatas: { table_id: 456, map: boardMap, players: { secret: true } },
    } }, url: "https://en.boardgamearena.com/catan?table=789&token=private" },
  ], "https://boardgamearena.com/table?table=12");
  assert.equal(injection.target.allFrames, true);
  assert.equal(injection.world, "MAIN");
  assert.deepEqual(response, { ok: true, raw: { ...boardMap, table_id: "123" } });
});

test("game data table identity works with supported game-data aliases", async () => {
  for (const key of ["gamedatas", "gameData", "data"]) {
    const { response } = await extractFrames([{ window: { gameui: {
      table_id: false, [key]: { table_id: "000987", map: boardMap },
    } } }]);
    assert.equal(response.raw.table_id, "987", key);
  }
  const { response } = await extractFrames([{ window: { gamedatas: { table_id: 987, map: boardMap } } }]);
  assert.equal(response.raw.table_id, "987");
});

test("DOM fallback reads only the numeric table query from its BGA frame", async () => {
  const { response } = await extractFrames([{
    document: domBoard(),
    url: "https://en.boardgamearena.com/12/catan?table=000654&player=999&token=secret#chat",
  }]);
  assert.deepEqual(response, { ok: true, raw: {
    tiles: [{ x: 1, y: 2, type: 2, dice_value: 6 }], harbours: [], table_id: "654",
  } });
});

test("only a nested board lacking identity uses its validated parent-tab table query", async () => {
  const frames = [
    { frameId: 0, window: { gameui: { table_id: 999 } } },
    { frameId: 8, document: domBoard(), url: "https://boardgamearena.com/archive/replay/123/456/catan" },
  ];
  const nested = await extractFrames(frames, "https://boardgamearena.com/table?table=000888&token=secret");
  assert.equal(nested.response.raw.table_id, "888");

  const top = await extractFrames([{ frameId: 0, document: domBoard() }], "https://boardgamearena.com/table?table=888");
  assert.equal(Object.hasOwn(top.response.raw, "table_id"), false);

  const noParentId = await extractFrames(frames, "https://boardgamearena.com/archive/replay/123/456?player_id=999");
  assert.equal(Object.hasOwn(noParentId.response.raw, "table_id"), false);
});

test("selected nested frame URL identity takes priority over the parent-tab URL", async () => {
  const { response } = await extractFrames([
    { frameId: 0, url: "https://boardgamearena.com/table?table=111" },
    { frameId: 7, document: domBoard(), url: "https://en.boardgamearena.com/catan?table=00000000000000000222" },
  ], "https://boardgamearena.com/table?table=111");
  assert.equal(response.raw.table_id, "222");

  const parent = await extractFrames([{ frameId: 7, document: domBoard() }],
    "https://en.boardgamearena.com/table?table=99999999999999999999");
  assert.equal(parent.response.raw.table_id, "99999999999999999999");
});

test("tutorials and archive numbers import without inventing a table ID", async () => {
  for (const url of [
    "https://boardgamearena.com/catan?training=true",
    "https://boardgamearena.com/archive/replay/20261111/123456/catan?player_id=123&timestamp=456",
  ]) {
    const { response } = await extractFrames([{ document: domBoard(), url }]);
    assert.equal(response.ok, true);
    assert.equal(Object.hasOwn(response.raw, "table_id"), false);
  }
});

test("runtime table IDs accept decimal strings and safe positive integers without precision loss", async () => {
  const values = [
    ["00000000000000000123", "123"],
    ["99999999999999999999", "99999999999999999999"],
    [Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)],
    [1, "1"],
  ];
  for (const [value, expected] of values) {
    const { response } = await extractFrames([{ window: { gameui: { table_id: value, gamedatas: { map: boardMap } } } }]);
    assert.equal(response.raw.table_id, expected);
  }
});

test("runtime table IDs reject malformed, nondecimal, zero, and unsafe values", async () => {
  const invalid = [
    undefined, null, true, false, [], [123], {}, 0, -1, 1.5, NaN, Infinity,
    Number.MAX_SAFE_INTEGER + 1, "", "0", "000", "-1", "+1", "1.5", "1e3",
    " 123", "123 ", "123\n", "0x123", "123abc", "999999999999999999999",
  ];
  for (const value of invalid) {
    for (const source of ["gameui", "gamedatas"]) {
      const gamedatas = { map: boardMap };
      const gameui = { gamedatas };
      (source === "gameui" ? gameui : gamedatas).table_id = value;
      const { response } = await extractFrames([{ window: { gameui } }]);
      assert.equal(Object.hasOwn(response.raw, "table_id"), false, `${source}: ${String(value)}`);
    }
  }
});

test("frame and parent URL fallbacks reject unrelated hosts and invalid or ambiguous parameters", async () => {
  const urls = [
    "https://boardgamearena.com.evil.example/catan?table=123",
    "https://evilboardgamearena.com/catan?table=123",
    "https://evil.example/boardgamearena.com?table=123",
    "http://boardgamearena.com/catan?table=123",
    "https://user:secret@boardgamearena.com/catan?table=123",
    "https://boardgamearena.com:444/catan?table=123",
    "https://boardgamearena.com/catan?table=123&table=456",
    "https://boardgamearena.com/catan?table[]=123",
    "https://boardgamearena.com/catan?table=0",
    "https://boardgamearena.com/catan?table=1e3",
    "https://boardgamearena.com/catan?table=%20123",
    "https://boardgamearena.com/catan?table=123%0A",
    "https://boardgamearena.com/catan?table=999999999999999999999",
    "not a URL",
  ];
  for (const url of urls) {
    const frame = await extractFrames([{ document: domBoard(), url }]);
    const parent = await extractFrames([{ frameId: 7, document: domBoard() }], url);
    assert.equal(Object.hasOwn(frame.response.raw, "table_id"), false, `frame: ${url}`);
    assert.equal(Object.hasOwn(parent.response.raw, "table_id"), false, `parent: ${url}`);
  }
});

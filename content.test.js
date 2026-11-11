const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function element() {
  return {
    style: {}, children: [], listeners: {},
    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
    },
    addEventListener(event, listener) { this.listeners[event] = listener; },
  };
}

function loadContent(raw) {
  let messageListener;
  const messages = [];
  const body = element();
  const findById = (id, node = body) => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findById(id, child);
      if (found) return found;
    }
    return null;
  };
  const document = { body, createElement: element, getElementById: findById };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "content.js"), "utf8"), {
    document,
    location: { pathname: "/catan", search: "?table=999&token=secret" },
    console,
    chrome: { runtime: {
      onMessage: { addListener(listener) { messageListener = listener; } },
      sendMessage(message, callback) {
        messages.push(JSON.parse(JSON.stringify(message)));
        if (message.type === "EXTRACT_BOARD_FROM_MAIN_WORLD") callback({ ok: true, raw });
        else callback({ ok: true });
      },
    } },
  }, { filename: "content.js" });
  return {
    document, messages,
    sendMessage(message) {
      return new Promise((resolve) => {
        assert.equal(messageListener(message, {}, resolve), true);
      });
    },
  };
}

function rawBoard(tableId) {
  return {
    table_id: tableId,
    tiles: [{ x: 1, y: 2, type: 3, dice_value: 6, owner: "private" }],
    harbours: [{ x: 1, y: 2, z: "A", type: 0, player_id: 123 }],
    page: { url: "https://boardgamearena.com/catan?table=999&token=secret", title: "Private" },
    players: { secret: true }, robber: 5, dice_roll: [3, 4],
  };
}

function expectedPayload(tableId) {
  return {
    source: "boardgamearena", game: "catan", variant: "unknown",
    ...(tableId ? { table_id: tableId } : {}),
    map: {
      tiles: [{ index: 0, x: 1, y: 2, type: 3, dice_value: 6 }],
      harbours: [{ x: 1, y: 2, z: "A", type: 0 }],
    },
  };
}

test("floating action sends only board fields and normalized table ID after a click", async () => {
  const content = loadContent(rawBoard("000123"));
  assert.deepEqual(content.messages, []);
  const button = content.document.getElementById("soft2u-catan-analyze-btn");
  assert.ok(button.parentElement.children.some((node) => /BGA table ID when available/.test(node.textContent || "")));
  const response = await button.listeners.click();
  assert.equal(response.ok, true);
  assert.deepEqual(content.messages, [
    { type: "EXTRACT_BOARD_FROM_MAIN_WORLD" },
    { type: "OPEN_ANALYTICS", payload: expectedPayload("123") },
  ]);
});

test("popup click reaches the same content payload builder and preserves a 20-digit table ID", async () => {
  const content = loadContent(rawBoard("99999999999999999999"));
  const nodes = { analyzeBtn: element(), status: element() };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "popup.js"), "utf8"), {
    document: { getElementById(id) { return nodes[id]; } },
    chrome: {
      runtime: {},
      tabs: {
        query: async () => [{ id: 42, url: "https://boardgamearena.com/catan?table=99999999999999999999" }],
        sendMessage(tabId, message, callback) {
          assert.equal(tabId, 42);
          content.sendMessage(message).then(callback);
        },
      },
    },
  }, { filename: "popup.js" });
  assert.deepEqual(content.messages, []);
  await nodes.analyzeBtn.listeners.click();
  assert.equal(nodes.status.textContent, "Analytics opened.");
  assert.deepEqual(content.messages[1], {
    type: "OPEN_ANALYTICS", payload: expectedPayload("99999999999999999999"),
  });
});

test("content only permits canonical valid table_id metadata and omits malformed identities", async () => {
  const values = [
    [123, "123"], ["000123", "123"], [Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)],
    [undefined, null], [null, null], [false, null], [true, null], [[], null], [[123], null], [{}, null],
    [0, null], [-1, null], [1.2, null], [Number.MAX_SAFE_INTEGER + 1, null], [Infinity, null],
    ["", null], ["0", null], ["000", null], ["1e3", null], ["-123", null], ["+123", null],
    ["1.2", null], [" 123", null], ["123 ", null], ["123\n", null], ["999999999999999999999", null],
  ];
  for (const [value, expected] of values) {
    const raw = { ...rawBoard(value), tableId: "888", table: { id: "777" } };
    const content = loadContent(raw);
    const response = await content.sendMessage({ type: "EXTRACT_CURRENT_BOARD" });
    assert.equal(response.ok, true);
    assert.deepEqual(JSON.parse(JSON.stringify(response.payload)), expectedPayload(expected), String(value));
    assert.equal(content.messages.length, 1);
  }
});

test("boards without table identity still open analytics through either action", async () => {
  for (const viaMessage of [false, true]) {
    const content = loadContent(rawBoard(undefined));
    const response = viaMessage
      ? await content.sendMessage({ type: "ANALYZE_CURRENT_BOARD" })
      : await content.document.getElementById("soft2u-catan-analyze-btn").listeners.click();
    assert.equal(response.ok, true);
    assert.deepEqual(content.messages[1].payload, expectedPayload());
  }
});

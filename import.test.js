const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadImportPage({
  payload,
  response = {
    ok: true,
    status: 200,
    url: "https://catan.soft2u.ro/map-analytics/ABC",
  },
}) {
  const fetchCalls = [];
  const replacements = [];
  const status = {
    textContent: "",
    classList: {
      values: [],
      add(value) {
        this.values.push(value);
      },
    },
  };
  const location = {
    hash: payload === undefined
      ? ""
      : `#${encodeURIComponent(JSON.stringify(payload))}`,
    pathname: "/import.html",
    replace(url) {
      replacements.push(url);
    },
  };
  const sandbox = {
    URL,
    Error,
    JSON,
    decodeURIComponent,
    document: {
      getElementById() {
        return status;
      },
    },
    fetch: async (...args) => {
      fetchCalls.push(args);
      return response;
    },
    globalThis: null,
    history: {
      calls: [],
      replaceState(...args) {
        this.calls.push(args);
        location.hash = "";
      },
    },
    location,
  };
  sandbox.globalThis = sandbox;

  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "import.js"), "utf8"),
    sandbox,
    { filename: "import.js" }
  );

  return {
    fetchCalls,
    history: sandbox.history,
    importPromise: sandbox.__CATAN_IMPORT_PROMISE__,
    location,
    replacements,
    status,
  };
}

test("minimal board payload and exact table ID are posted without credentials or referrer", async () => {
  const payload = {
    source: "boardgamearena",
    game: "catan",
    variant: "classic",
    table_id: "99999999999999999999",
    map: {
      tiles: [{ index: 0, x: 1, y: 2, type: 3, dice_value: 5 }],
      harbours: [],
    },
  };
  const page = loadImportPage({ payload });

  await page.importPromise;

  assert.equal(page.fetchCalls.length, 1);
  const [url, options] = page.fetchCalls[0];
  assert.equal(url, "https://catan.soft2u.ro/import-from-bga");
  assert.equal(options.method, "POST");
  assert.equal(options.credentials, "omit");
  assert.equal(options.referrerPolicy, "no-referrer");
  assert.deepEqual(JSON.parse(options.body), payload);
  assert.equal(page.location.hash, "");
  assert.equal(page.history.calls.length, 1);
  assert.deepEqual(page.replacements, [
    "https://catan.soft2u.ro/map-analytics/ABC",
  ]);
});

test("missing payload fails safely without contacting the service", async () => {
  const page = loadImportPage({ payload: undefined });

  await page.importPromise;

  assert.equal(page.fetchCalls.length, 0);
  assert.match(page.status.textContent, /payload is missing/i);
  assert.deepEqual(page.status.classList.values, ["is-error"]);
});

test("unexpected redirect destination is rejected", async () => {
  const page = loadImportPage({
    payload: { source: "boardgamearena", game: "catan", map: {} },
    response: {
      ok: true,
      status: 200,
      url: "https://example.com/not-analytics",
    },
  });

  await page.importPromise;

  assert.equal(page.replacements.length, 0);
  assert.match(page.status.textContent, /unexpected destination/i);
});

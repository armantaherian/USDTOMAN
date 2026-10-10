import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function worker() {
  const handlers = {};
  let calls = 0;
  const cache = {
    match: async () => new Response("cached"),
    put: async () => {},
  };
  const source = fs.readFileSync("src/sw.js", "utf8")
    .replace("BUILD_VERSION", "test")
    .replace("BUILD_ASSETS", JSON.stringify(["app.js", "data.json", "index.html"]));
  vm.runInNewContext(source, {
    self: { registration: { scope: "https://example.test/app/" }, addEventListener: (name, handler) => handlers[name] = handler },
    caches: { open: async () => cache }, URL, AbortController, setTimeout, clearTimeout, Response,
    fetch: async () => { calls++; return new Response("fresh"); },
  });
  return {
    async request(path) {
      let response;
      handlers.fetch({ request: { url: "https://example.test/app/" + path, method: "GET", mode: "cors" }, respondWith: promise => response = promise });
      return (await response).text();
    },
    calls: () => calls,
  };
}

test("versioned static assets reuse the offline cache without a network request", async () => {
  const sw = worker();
  assert.equal(await sw.request("app.js"), "cached");
  assert.equal(sw.calls(), 0);
});

test("price snapshots still fetch fresh data", async () => {
  const sw = worker();
  assert.equal(await sw.request("data.json"), "fresh");
  assert.equal(sw.calls(), 1);
});

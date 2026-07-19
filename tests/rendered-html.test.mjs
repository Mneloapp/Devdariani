import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

function fetchHtml(worker, pathname = "/") {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders development preview metadata", async () => {
  const worker = await loadWorker();

  const response = await fetchHtml(worker);

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders the isolated shaft journey route", async () => {
  const worker = await loadWorker();
  const response = await fetchHtml(worker, "/shaft");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /Inside the Whole/i);
  assert.match(html, /Engineering the Whole\./i);
  assert.match(html, /Fire protection/i);
  assert.match(html, /devdariani-central-city-v3\.webp/i);
  assert.match(html, /devdariani-central-city-mobile-v3\.webp/i);
  assert.doesNotMatch(html, /devdariani-city-material-pass-v2\.webp/i);
  assert.match(html, /Completed DEVDARIANI-engineered building/i);
});

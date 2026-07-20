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
  assert.match(html, /Orchestrics™/i);
  assert.match(html, /data-theme=["']dark["']/i);
  assert.match(html, /data-tone=["']dark["']/i);
  assert.match(
    html,
    /class=["'][^"']*\borigin-chapter\b[^"']*["']/i,
  );
  assert.match(html, /\bid=["']founder-title["']/i);
  assert.match(html, /Before Devdariani became a company/i);
  assert.match(html, /Giorgi Devdariani/i);
  assert.match(html, /Founder \/ MEP Engineer/i);
  assert.match(html, /Not separate systems/i);
  assert.match(html, /The discipline of making every system work as one/i);
  assert.match(html, /From experience/i);
  assert.match(html, /Discuss a project/i);
  assert.match(
    html,
    /After BMS completes[\s\S]*?roof opens[\s\S]*?camera exits the shaft[\s\S]*?five system traces converge/i,
  );

  assert.doesNotMatch(html, /Selected work will be published shortly/i);
  assert.doesNotMatch(html, /\bid=["']projects-title["']/i);
  assert.doesNotMatch(html, /projects-threshold--shaft-exit/i);

  assert.doesNotMatch(
    html,
    /shaft-orchestrics-portal|shaft-portal-callout|data-portal-(?:path|marker|callout)=|projects-threshold--portal|05 systems\s*\/\s*01 whole|Orchestrics aperture/i,
  );

  assert.doesNotMatch(html, /devdariani-(?:central-city|city-render|city-material)/i);
  assert.doesNotMatch(html, /Completed DEVDARIANI-engineered building/i);
});

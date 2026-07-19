import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

const portalSystems = [
  {
    descriptor: "Ductwork + ventilation",
    id: "hvac",
    label: "HVAC",
    number: "01",
  },
  {
    descriptor: "Cable containment",
    id: "electrical",
    label: "Electrical",
    number: "02",
  },
  {
    descriptor: "Supply + return",
    id: "plumbing",
    label: "Plumbing",
    number: "03",
  },
  {
    descriptor: "Flanged life-safety riser",
    id: "fire",
    label: "Fire protection",
    number: "04",
  },
  {
    descriptor: "Cabinet + control network",
    id: "bms",
    label: "BMS",
    number: "05",
  },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
  assert.match(html, /shaft-orchestrics-portal/i);
  assert.match(html, /05 systems \/ 01 whole/i);
  assert.match(html, /Orchestrics™/i);
  assert.match(html, /projects-threshold--portal/i);

  assert.equal((html.match(/\bdata-portal-path=/gi) ?? []).length, 5);
  assert.equal((html.match(/\bdata-portal-marker=/gi) ?? []).length, 5);
  assert.equal((html.match(/\bdata-portal-callout=/gi) ?? []).length, 5);

  for (const { descriptor, id, label, number } of portalSystems) {
    assert.match(html, new RegExp(`\\bdata-portal-path=["']${id}["']`, "i"));
    assert.match(html, new RegExp(`\\bdata-portal-marker=["']${id}["']`, "i"));
    assert.match(
      html,
      new RegExp(
        `<div(?=[^>]*\\bdata-portal-callout=["']${id}["'])[^>]*>` +
          `[\\s\\S]*?<strong>[\\s\\S]*?${number}[\\s\\S]*?${escapeRegExp(label)}` +
          `[\\s\\S]*?</strong>[\\s\\S]*?<small>${escapeRegExp(descriptor)}</small>` +
          `[\\s\\S]*?</div>`,
        "i",
      ),
    );
  }

  assert.doesNotMatch(html, /devdariani-(?:central-city|city-render|city-material)/i);
  assert.doesNotMatch(html, /Completed DEVDARIANI-engineered building/i);
});

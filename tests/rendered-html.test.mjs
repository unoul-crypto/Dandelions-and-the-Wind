import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the game setup", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Одуванчик и ветер/);
  assert.match(html, /Одуванчик/);
  assert.match(html, /ветер/i);
  assert.match(html, /Начать игру/);
  assert.match(html, /Правила партии/);
  assert.match(html, /Дальность семян/);
  assert.match(html, /Кто играет/);
  assert.match(html, /Я — одуванчик/);
  assert.match(html, /Я — ветер/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("contains all eight wind directions and both win conditions", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.equal((page.match(/id: "/g) ?? []).length, 8);
  assert.match(page, /Array\(width \* height\)/);
  assert.match(page, /id="board-width"/);
  assert.match(page, /id="board-height"/);
  assert.match(page, /gridTemplateRows/);
  assert.match(page, /className="compass-arrow"/);
  assert.match(page, /id="plant-on-seed"/);
  assert.match(page, /id="seed-range"/);
  assert.match(page, /id="max-blows"/);
  assert.match(page, /id="required-blows"/);
  assert.match(page, /requestedSeedRange === null/);
  assert.match(page, /className="direction-count"/);
  assert.match(page, /type GameMode = "self" \| "human-dandelion" \| "human-wind"/);
  assert.match(page, /const isAiTurn/);
  assert.match(page, /Соперник оценивает поле/);
  assert.match(page, /remaining === 0/);
  assert.match(page, /DIRECTIONS\.every/);
  assert.match(layout, /lang="ru"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import process from "node:process";

const projectRoot = process.cwd();
const configPath = path.join(projectRoot, "assets", "cloudflare-assets.js");

const source = await fs.readFile(configPath, "utf8");
const sandbox = {
  window: {},
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "cloudflare-assets.js" });

const assets = sandbox.window.THL_ASSETS || {};
const entries = Object.entries(assets);

if (!entries.length) {
  console.error("No CDN assets found in assets/cloudflare-assets.js");
  process.exit(1);
}

async function fetchWithFallback(url) {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) {
      return { ok: true, status: head.status, method: "HEAD" };
    }

    const getRes = await fetch(url, { method: "GET" });
    return { ok: getRes.ok, status: getRes.status, method: "GET" };
  }
  catch {
    try {
      const getRes = await fetch(url, { method: "GET" });
      return { ok: getRes.ok, status: getRes.status, method: "GET" };
    }
    catch {
      return { ok: false, status: 0, method: "GET" };
    }
  }
}

const importantKeys = [
  "site.hienThiTimKiem",
  "salon.mau01.hero",
  "salon.mau01.products",
];

const failedImportant = [];
let okCount = 0;
let missingCount = 0;

for (const [key, url] of entries) {
  const result = await fetchWithFallback(url);
  if (result.ok) {
    okCount++;
    console.log(`[OK] ${key} -> ${url} (${result.method} ${result.status})`);
  }
  else {
    missingCount++;
    console.log(`[MISSING] ${key} -> ${url} (${result.method} ${result.status})`);
    if (importantKeys.includes(key)) {
      failedImportant.push(key);
    }
  }
}

console.log("");
console.log(`Summary: ok=${okCount}, missing=${missingCount}, total=${entries.length}`);

if (failedImportant.length) {
  console.error(`Missing important CDN assets: ${failedImportant.join(", ")}`);
  process.exit(1);
}

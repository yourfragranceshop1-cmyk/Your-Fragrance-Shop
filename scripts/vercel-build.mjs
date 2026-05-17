/**
 * Custom Vercel Build Script
 * 
 * Bridges the gap between TanStack Start's Vite plugin output
 * (dist/client + dist/server) and Vercel's Build Output API v3.
 * 
 * Output structure:
 *   .vercel/output/
 *   ├── config.json              ← routing rules
 *   ├── static/                  ← client assets (from dist/client)
 *   └── functions/
 *       └── ssr.func/            ← serverless function
 *           ├── .vc-config.json  ← runtime config
 *           ├── index.mjs        ← entry (adapts fetch handler)
 *           └── server/          ← server bundle (from dist/server)
 */

import { execSync } from "child_process";
import { cpSync, mkdirSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUTPUT = join(ROOT, ".vercel", "output");

// ── 1. Run vite build ────────────────────────────────────────────────
console.log("\n🔨 Running vite build...\n");
execSync("npx vite build", { stdio: "inherit", env: { ...process.env, VERCEL: "1" } });

// ── 2. Clean previous output ─────────────────────────────────────────
if (existsSync(OUTPUT)) {
  rmSync(OUTPUT, { recursive: true, force: true });
}

// ── 3. Create directory structure ────────────────────────────────────
const STATIC_DIR = join(OUTPUT, "static");
const FUNC_DIR = join(OUTPUT, "functions", "ssr.func");
mkdirSync(STATIC_DIR, { recursive: true });
mkdirSync(FUNC_DIR, { recursive: true });

// ── 4. Copy client assets → static ──────────────────────────────────
console.log("\n📦 Copying client assets to .vercel/output/static/...");
cpSync(join(ROOT, "dist", "client"), STATIC_DIR, { recursive: true });

// ── 6. Bundle function and all node_modules using esbuild ───────────
console.log("⚡ Bundling serverless function and all dependencies with esbuild...");

const tempEntryPath = join(ROOT, "dist", "temp-entry.mjs");
writeFileSync(
  tempEntryPath,
  `import server from "./server/server.js";

export default async function handler(req, res) {
  try {
    // Build Web Standard Request from Node.js IncomingMessage
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url || "/", proto + "://" + host);

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) headers.set(key, Array.isArray(val) ? val.join(", ") : val);
    }

    const hasBody = req.method !== "GET" && req.method !== "HEAD";

    // Collect body for non-GET requests
    let body = undefined;
    if (hasBody) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    // Call TanStack Start's fetch handler
    const response = await server.fetch(request, {}, {});

    // Write Web Standard Response back to Node.js ServerResponse
    res.statusCode = response.status;
    for (const [key, val] of response.headers.entries()) {
      res.setHeader(key, val);
    }

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      };
      await pump();
    } else {
      const buf = await response.arrayBuffer();
      res.write(Buffer.from(buf));
    }
    res.end();
  } catch (err) {
    console.error("SSR handler error:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end("<h1>Internal Server Error</h1><p>" + (err.message || "Unknown error") + "</p>");
  }
}
`
);

const outFilePath = join(FUNC_DIR, "index.mjs");
const bannerJs = "import { createRequire } from 'module'; const require = createRequire(import.meta.url);";
execSync(
  `npx esbuild "${tempEntryPath}" --bundle --platform=node --format=esm --target=node20 --minify --banner:js="${bannerJs}" --outfile="${outFilePath}"`,
  { stdio: "inherit" }
);

// Clean temporary entry
if (existsSync(tempEntryPath)) {
  rmSync(tempEntryPath);
}

// ── 7. Create function config (.vc-config.json) ─────────────────────
writeFileSync(
  join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      maxDuration: 30,
      supportsResponseStreaming: true,
    },
    null,
    2
  )
);

// ── 8. Create Vercel output config.json ─────────────────────────────
console.log("\n📝 Writing .vercel/output/config.json...\n");
writeFileSync(
  join(OUTPUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve static assets first (JS, CSS, images, etc.)
        { handle: "filesystem" },
        // All other requests go to the SSR function
        { src: "/(.*)", dest: "/ssr" },
      ],
    },
    null,
    2
  )
);

console.log("✅ Vercel Build Output API structure created successfully!");
console.log("   .vercel/output/static/     ← client assets");
console.log("   .vercel/output/functions/  ← SSR serverless function (completely bundled!)\n");

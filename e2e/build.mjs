// Builds the app with the mock API running, so pages that fetch at build time
// (home, offers, listings) prerender with the same data the tests expect.
// Usage: npm run e2e:build
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const PORT = 8100;

function waitForPort(port, timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect(port, "127.0.0.1");
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) reject(new Error("mock API did not start"));
        else setTimeout(attempt, 250);
      });
    };
    attempt();
  });
}

const mock = spawn(process.execPath, ["e2e/mock-api.mjs"], { stdio: "inherit" });

let status = 1;
try {
  await waitForPort(PORT);
  const build = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "build"],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: `http://localhost:${PORT}`,
        NEXT_PUBLIC_BASE_URL: "https://www.yuricart.com",
        NEXT_PUBLIC_META_PIXEL_ID: "0",
      },
    },
  );
  status = build.status ?? 1;
} finally {
  mock.kill();
}

process.exit(status);

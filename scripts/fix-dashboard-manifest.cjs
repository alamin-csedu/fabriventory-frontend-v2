const fs = require("fs");
const path = require("path");

(async () => {
  const appDir = path.join(process.cwd(), ".next", "server", "app");
  const src = path.join(appDir, "page_client-reference-manifest.js");
  const dstDir = path.join(appDir, "(dashboard)");
  const dst = path.join(dstDir, "page_client-reference-manifest.js");

  const payload = {
    sessionId: "6bad13",
    runId: "build-fix",
    hypothesisId: "H1",
    location: "scripts/fix-dashboard-manifest.cjs",
    message: "Checking and fixing dashboard client-reference manifest location",
    data: {
      appDir,
      src,
      dst,
      srcExists: fs.existsSync(src),
      dstExists: fs.existsSync(dst),
    },
    timestamp: Date.now(),
  };

  // #region agent log
  if (typeof fetch === "function") {
    fetch("http://127.0.0.1:7618/ingest/27f9fde5-b3de-4d0f-a791-5daa5ef9142f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "6bad13",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
  // #endregion

  if (fs.existsSync(src)) {
    if (!fs.existsSync(dstDir)) {
      fs.mkdirSync(dstDir, { recursive: true });
    }
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
    }
  }
})();


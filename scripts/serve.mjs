import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
const root = path.resolve("dist");
const clients = new Set();
let revision = 0;
let building = false;
let pending = false;
let debounce;
function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  const child = spawn(process.execPath, ["scripts/build.mjs"], {
    stdio: "inherit",
  });
  child.on("error", (error) => console.error("Build failed:", error.message));
  child.on("close", (code) => {
    building = false;
    if (code === 0) {
      revision++;
      for (const client of clients) client.write(`data: ${revision}\n\n`);
      console.log("Rebuilt; reloading browser.");
    }
    if (pending) {
      pending = false;
      rebuild();
    }
  });
}
for (const directory of ["src", "scripts"]) {
  fs.watch(directory, { recursive: true }, () => {
    clearTimeout(debounce);
    debounce = setTimeout(rebuild, 150);
  });
}
const reloadScript = `<script>
  const updates = new EventSource('/__dev_events');
  let revision;
  updates.onmessage = (event) => {
    if (revision !== undefined && revision !== event.data) location.reload();
    revision = event.data;
  };
</script>`;
http
  .createServer((req, res) => {
    const name = req.url.split("?")[0];
    if (name === "/__dev_events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
      });
      res.write(`data: ${revision}\n\n`);
      clients.add(res);
      const heartbeat = setInterval(() => res.write(": keepalive\n\n"), 15000);
      req.on("close", () => {
        clearInterval(heartbeat);
        clients.delete(res);
      });
      return;
    }
    const file = path.resolve(
      root,
      "." + (name === "/" ? "/index.html" : name),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, body) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".json": "application/json",
        }[path.extname(file)] || "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-store");
      if (path.extname(file) === ".html")
        body = body.toString().replace("</body>", reloadScript + "</body>");
      res.end(body);
    });
  })
  .listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));

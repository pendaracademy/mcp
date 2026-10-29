import http from "node:http";
import { WebSocketServer } from "ws";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function listenHttp({ host, port, token, bridge, createMcp }) {
  const httpMcp = createMcp();
  registerTools(httpMcp, bridge);
  const mcpTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${host}:${port}`);
    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, tab: bridge.connected }));
      return;
    }
    if (url.pathname === "/mcp") {
      const raw = await readBody(req);
      let parsed;
      try {
        parsed = raw.length ? JSON.parse(raw.toString("utf8")) : undefined;
      } catch {
        res.writeHead(400).end("invalid json");
        return;
      }
      await mcpTransport.handleRequest(req, res, parsed);
      return;
    }
    res.writeHead(404).end();
  });

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", `http://${host}:${port}`);
    if (url.pathname !== "/bridge") {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  });

  wss.on("connection", (ws) => {
    const timer = setTimeout(() => ws.close(), 8_000);
    ws.once("message", (raw) => {
      clearTimeout(timer);
      let message;
      try {
        message = JSON.parse(String(raw));
      } catch {
        ws.close();
        return;
      }
      if (message.type !== "hello" || message.token !== token) {
        ws.send(JSON.stringify({ type: "error", error: "invalid token" }));
        ws.close();
        return;
      }
      bridge.attach(ws);
      ws.send(JSON.stringify({ type: "ready" }));
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, host, async () => {
      try {
        await httpMcp.connect(mcpTransport);
        resolve(server);
      } catch (error) {
        reject(error);
      }
    });
    server.on("error", reject);
  });
}

export function createMcpServer() {
  return new McpServer({ name: "pendar", version: "0.1.0" });
}

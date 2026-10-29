#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TabBridge } from "./bridge.js";
import { createMcpServer, listenHttp } from "./http.js";
import { DEFAULT_HOST, DEFAULT_PORT, TOKEN_BYTES } from "./protocol.js";
import { registerTools } from "./tools.js";

function log(line) {
  process.stderr.write(`${line}\n`);
}

const host = process.env.PENDAR_MCP_HOST || DEFAULT_HOST;
const port = Number(process.env.PENDAR_MCP_PORT || DEFAULT_PORT);
const token = process.env.PENDAR_MCP_TOKEN || randomBytes(TOKEN_BYTES).toString("hex");
const stdio = process.stdin.isTTY !== true || process.argv.includes("--stdio");

const bridge = new TabBridge();

await listenHttp({
  host,
  port,
  token,
  bridge,
  createMcp: createMcpServer,
});

log(`Pendar MCP listening on http://${host}:${port}`);
log(`Builder websocket: ws://${host}:${port}/bridge`);
log(`Pairing token: ${token}`);
log("Paste the token in the course builder. This process never calls the Pendar API.");

if (stdio) {
  const mcp = createMcpServer();
  registerTools(mcp, bridge);
  await mcp.connect(new StdioServerTransport());
}

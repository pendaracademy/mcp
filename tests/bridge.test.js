import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import { TabBridge, toolError } from "../src/bridge.js";

class FakeSocket extends EventEmitter {
  constructor() {
    super();
    this.readyState = 1;
    this.sent = [];
  }
  send(data) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    this.readyState = 3;
    this.emit("close");
  }
}

test("call fails when no tab is connected", async () => {
  const bridge = new TabBridge();
  await assert.rejects(() => bridge.call("get_course", {}), /no builder tab/);
});

test("call resolves with the tab response", async () => {
  const bridge = new TabBridge();
  const socket = new FakeSocket();
  bridge.attach(socket);
  const pending = bridge.call("get_course", {});
  const request = socket.sent[0];
  assert.equal(request.type, "request");
  assert.equal(request.method, "get_course");
  socket.emit("message", JSON.stringify({ type: "response", id: request.id, result: { title: "Go" } }));
  assert.deepEqual(await pending, { title: "Go" });
});

test("toolError marks the MCP result as an error", () => {
  const result = toolError(new Error("no builder tab"));
  assert.equal(result.isError, true);
  assert.equal(result.content[0].text, "no builder tab");
});

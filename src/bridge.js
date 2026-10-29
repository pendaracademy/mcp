import { randomUUID } from "node:crypto";
import { CALL_TIMEOUT_MS } from "./protocol.js";

export class TabBridge {
  constructor() {
    this.socket = null;
    this.pending = new Map();
  }

  get connected() {
    return this.socket !== null && this.socket.readyState === 1;
  }

  attach(socket) {
    const previous = this.socket;
    this.socket = socket;
    if (previous && previous !== socket) {
      this.failAll("builder tab replaced");
      try {
        previous.send(JSON.stringify({ type: "replaced" }));
        previous.close();
      } catch {
        // ignore
      }
    }
    socket.on("message", (raw) => this.onMessage(raw));
    socket.on("close", () => {
      if (this.socket === socket) {
        this.socket = null;
        this.failAll("builder tab disconnected");
      }
    });
  }

  onMessage(raw) {
    let message;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (message.type !== "response" || typeof message.id !== "string") return;
    const waiter = this.pending.get(message.id);
    if (!waiter) return;
    this.pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(message.error));
    else waiter.resolve(message.result ?? null);
  }

  failAll(reason) {
    for (const [id, waiter] of this.pending) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error(reason));
      this.pending.delete(id);
    }
  }

  call(method, params) {
    if (!this.connected) return Promise.reject(new Error("no builder tab"));
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("builder tab timed out"));
      }, CALL_TIMEOUT_MS);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ type: "request", id, method, params: params ?? {} }));
    });
  }
}

export function toolError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

export function toolOk(result) {
  return {
    content: [{ type: "text", text: JSON.stringify(result ?? { ok: true }) }],
  };
}

# @pendar/mcp

Local MCP server for the Pendar course builder. An AI agent talks to this process. The process talks to the open builder tab over a websocket. It never stores AI keys and never calls the Pendar API.

```
AI host  --stdio or http://127.0.0.1:7420/mcp-->  @pendar/mcp
builder tab  <--ws://127.0.0.1:7420/bridge--      @pendar/mcp
```

## Run

From this repo:

```sh
npx -y github:pendaracademy/mcp
```

Or clone and `node src/cli.js`. It binds `127.0.0.1:7420` and prints a pairing token on stderr. Paste that token in the Pendar course builder (saved as `pendar.mcpToken`).

```
PENDAR_MCP_PORT=7420
PENDAR_MCP_TOKEN=optional-fixed-token
```

`npx @pendar/mcp` works after the package is published to npm.

## Grok

```toml
[mcp_servers.pendar]
command = "npx"
args = ["-y", "github:pendaracademy/mcp"]
```

Claude Desktop and Cursor use the same command. HTTP MCP is `http://127.0.0.1:7420/mcp` while the process is running.

## Tools

Course: `get_course`, `update_course`, `publish_course`, `archive_course`.

Chapters: `add_chapter`, `rename_chapter`, `move_chapter`, `publish_chapter`, `archive_chapter`, `remove_chapter`.

Items: `get_open_item`, `add_item`, `open_item`, `remove_item`, `move_item`, `set_title`, `set_item_meta`, `publish_item`, `archive_item`, `replace_lesson_html`, `replace_quiz`, `replace_exercise`, `replace_homework`.

The teacher keeps the course open. The tab applies changes through the builder save queue. Lesson HTML is sanitized in the browser. Quizzes need exactly one correct choice. `write_code` and `debug` exercises are rejected. Homework has no sample-file upload.

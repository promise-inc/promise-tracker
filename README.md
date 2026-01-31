# Promise Tracker

VS Code extension that tracks your editor activity and syncs with [Promise Hub](https://promise.codes).

<p align="center">
  <img src="https://raw.githubusercontent.com/promise-inc/promise-tracker/main/assets/demo.svg" alt="Promise Tracker demo" width="680" />
</p>

## What it does

- Sends heartbeats as you code (file edits, saves, editor switches)
- Shows today's coding time in the status bar
- Auto-detects project from `.promise-hub.json`
- Breaks down time by project and language

## Install

Search for **Promise Tracker** in the VS Code Extensions marketplace, or:

```bash
code --install-extension promise-hub.promise-tracker
```

## Setup

1. Open the Command Palette (`Cmd+Shift+P`)
2. Run `Promise Tracker: Login`
3. Paste your Promise Hub hook token

The extension starts tracking automatically after login.

## Project Detection

Place a `.promise-hub.json` in your project root:

```json
{
  "apiUrl": "https://api.promise.codes/api",
  "teamId": "your-team-id",
  "projectId": "your-project-id"
}
```

The extension walks up from each file to find the nearest config. If none is found, it uses the workspace folder name.

> **How to get this file:** Open Promise Hub, go to **CLI Setup**, select your team and project, and copy the generated JSON.

## Commands

| Command | Description |
|---------|-------------|
| `Promise Tracker: Login` | Authenticate with your hook token |
| `Promise Tracker: Logout` | Clear stored credentials |
| `Promise Tracker: Status` | Show today's coding summary |
| `Promise Tracker: Open Dashboard` | Open Promise Hub in browser |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `promise-tracker.apiUrl` | `""` | API URL (empty = use `.promise-hub.json`) |
| `promise-tracker.heartbeatInterval` | `120` | Heartbeat interval in seconds |
| `promise-tracker.debug` | `false` | Enable debug logging |

## How Heartbeats Work

- **Normal activity** (typing, switching files): sent every 120s (configurable)
- **Write activity** (saving): sent every 30s
- **Deduplication**: same file within interval is skipped
- **Gap detection**: 5min+ gap starts a new coding session

## Also by Promise Inc.

| Package | Description |
|---------|-------------|
| [`@promise-inc/ai-guard`](https://github.com/promise-inc/ai-guard) | Detect AI-generated code patterns before commit |
| [`@promise-inc/dev-reel`](https://github.com/promise-inc/dev-reel) | Generate animated SVG terminal recordings |
| [`@promise-inc/devlog`](https://github.com/promise-inc/devlog) | Logger with automatic context |
| [`@promise-inc/fs-guard`](https://github.com/promise-inc/fs-guard) | Validate project folder and file structure |
| [`@promise-inc/ui-states`](https://github.com/promise-inc/ui-states) | Auto-skeleton loading states from real DOM |

## License

MIT

---

Developed by [Promise Inc.](https://promise.codes)

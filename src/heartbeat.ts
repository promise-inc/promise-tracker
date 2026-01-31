import * as vscode from 'vscode';
import * as path from 'path';
import { HEARTBEAT_INTERVAL, WRITE_INTERVAL } from './constants';
import { isAuthenticated } from './auth';
import { sendHeartbeat } from './api';
import { detectProject } from './project';
import { updateStatusBar } from './statusbar';

let lastHeartbeatTime = 0;
let lastFile = '';
const disposables: vscode.Disposable[] = [];

function getInterval(): number {
  return vscode.workspace.getConfiguration('promise-tracker').get<number>('heartbeatInterval') || HEARTBEAT_INTERVAL;
}

async function handleActivity(document: vscode.TextDocument, isWrite: boolean): Promise<void> {
  if (!isAuthenticated()) return;
  if (document.uri.scheme !== 'file') return;

  const filePath = document.uri.fsPath;
  const now = Date.now();
  const interval = isWrite ? WRITE_INTERVAL : getInterval();
  const elapsed = (now - lastHeartbeatTime) / 1000;

  // Deduplicate: skip if same file and within interval
  if (filePath === lastFile && elapsed < interval) {
    return;
  }

  lastHeartbeatTime = now;
  lastFile = filePath;

  const detected = detectProject(filePath);
  const fileName = path.basename(filePath);
  const language = document.languageId || 'unknown';

  const response = await sendHeartbeat({
    project: detected.projectName,
    file: fileName,
    language,
    isWrite,
    timestamp: new Date(now).toISOString(),
    editor: 'vscode',
    projectId: detected.projectId,
  }, detected.apiUrl);

  if (response) {
    updateStatusBar(response.todayTotal);
  }
}

export function initHeartbeat(): void {
  // Text changes (typing)
  disposables.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      handleActivity(e.document, false);
    })
  );

  // File saves
  disposables.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      handleActivity(doc, true);
    })
  );

  // Editor switches
  disposables.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document) {
        handleActivity(editor.document, false);
      }
    })
  );

  // Window focus
  disposables.push(
    vscode.window.onDidChangeWindowState((state) => {
      if (state.focused) {
        const editor = vscode.window.activeTextEditor;
        if (editor?.document) {
          handleActivity(editor.document, false);
        }
      }
    })
  );

  // Send initial heartbeat for the active editor
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor?.document) {
    handleActivity(activeEditor.document, false);
  }
}

export function disposeHeartbeat(): void {
  for (const d of disposables) {
    d.dispose();
  }
  disposables.length = 0;
}

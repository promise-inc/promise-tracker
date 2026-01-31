import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function initStatusBar(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'promise-tracker.status';
  statusBarItem.tooltip = 'Promise Tracker — Click for status';
  updateStatusBar(0);
  statusBarItem.show();
  return statusBarItem;
}

export function updateStatusBar(totalSeconds: number): void {
  if (!statusBarItem) return;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);

  if (totalSeconds < 60) {
    statusBarItem.text = '$(clock) 0m';
  } else if (h === 0) {
    statusBarItem.text = `$(clock) ${m}m`;
  } else {
    statusBarItem.text = `$(clock) ${h}h ${m.toString().padStart(2, '0')}m`;
  }
}

export function disposeStatusBar(): void {
  statusBarItem?.dispose();
}

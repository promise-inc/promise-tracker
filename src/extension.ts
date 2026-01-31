import * as vscode from 'vscode';
import { initAuth, login, logout, isAuthenticated } from './auth';
import { getTodaySummary, getApiUrl } from './api';
import { initStatusBar, updateStatusBar, disposeStatusBar } from './statusbar';
import { initHeartbeat, disposeHeartbeat } from './heartbeat';

export function activate(context: vscode.ExtensionContext) {
  // Initialize auth with extension context
  initAuth(context);

  // Initialize status bar
  const statusBar = initStatusBar();
  context.subscriptions.push(statusBar);

  // Initialize heartbeat listeners
  initHeartbeat();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('promise-tracker.login', async () => {
      const success = await login();
      if (success) {
        // Fetch today's summary to populate status bar
        const summary = await getTodaySummary();
        if (summary) {
          updateStatusBar(summary.totalSeconds);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('promise-tracker.logout', async () => {
      await logout();
      updateStatusBar(0);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('promise-tracker.status', async () => {
      if (!isAuthenticated()) {
        const action = await vscode.window.showInformationMessage(
          'Promise Tracker: Not logged in.',
          'Login'
        );
        if (action === 'Login') {
          await vscode.commands.executeCommand('promise-tracker.login');
        }
        return;
      }

      const summary = await getTodaySummary();
      if (!summary) {
        vscode.window.showWarningMessage('Promise Tracker: Could not fetch summary.');
        return;
      }

      const h = Math.floor(summary.totalSeconds / 3600);
      const m = Math.floor((summary.totalSeconds % 3600) / 60);
      const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

      const topProject = summary.projectBreakdown[0]?.project ?? 'None';
      const topLanguage = summary.languageBreakdown[0]?.language ?? 'None';

      vscode.window.showInformationMessage(
        `Today: ${timeStr} | Top project: ${topProject} | Top language: ${topLanguage} | Heartbeats: ${summary.heartbeatCount}`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('promise-tracker.dashboard', () => {
      const apiUrl = getApiUrl();
      // Derive dashboard URL from API URL (strip /api)
      const dashboardUrl = apiUrl.replace(/\/api$/, '');
      vscode.env.openExternal(vscode.Uri.parse(`${dashboardUrl}/editor-time`));
    })
  );

  // If already authenticated, fetch initial summary
  if (isAuthenticated()) {
    getTodaySummary().then((summary) => {
      if (summary) {
        updateStatusBar(summary.totalSeconds);
      }
    });
  }
}

export function deactivate() {
  disposeHeartbeat();
  disposeStatusBar();
}

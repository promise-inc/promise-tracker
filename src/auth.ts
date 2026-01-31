import * as vscode from 'vscode';
import { TOKEN_KEY } from './constants';
import { getApiUrl } from './api';

let context: vscode.ExtensionContext;

export function initAuth(ctx: vscode.ExtensionContext) {
  context = ctx;
}

export async function login(): Promise<boolean> {
  const token = await vscode.window.showInputBox({
    prompt: 'Enter your Promise Hub hook token',
    placeHolder: 'eyJhbGciOi...',
    password: true,
    ignoreFocusOut: true,
  });

  if (!token) {
    return false;
  }

  // Validate token by calling /auth/me
  try {
    const url = `${getApiUrl()}/auth/me`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      vscode.window.showErrorMessage('Invalid token. Please check and try again.');
      return false;
    }

    await context.globalState.update(TOKEN_KEY, token);
    vscode.window.showInformationMessage('Promise Tracker: Logged in successfully.');
    return true;
  } catch (err) {
    vscode.window.showErrorMessage(`Promise Tracker: Connection failed — ${err instanceof Error ? err.message : 'unknown error'}`);
    return false;
  }
}

export async function logout(): Promise<void> {
  await context.globalState.update(TOKEN_KEY, undefined);
  vscode.window.showInformationMessage('Promise Tracker: Logged out.');
}

export function getToken(): string | undefined {
  return context.globalState.get<string>(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

import * as vscode from 'vscode';
import { DEFAULT_API_URL } from './constants';
import { getToken } from './auth';

export function getApiUrl(): string {
  return vscode.workspace.getConfiguration('promise-tracker').get<string>('apiUrl') || DEFAULT_API_URL;
}

function isDebug(): boolean {
  return vscode.workspace.getConfiguration('promise-tracker').get<boolean>('debug') || false;
}

async function request<T>(path: string, options: RequestInit = {}, apiUrlOverride?: string): Promise<T | null> {
  const token = getToken();
  if (!token) {
    return null;
  }

  const url = `${apiUrlOverride || getApiUrl()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      if (isDebug()) {
        console.error(`[Promise Tracker] ${options.method ?? 'GET'} ${path} → ${res.status}`);
      }
      return null;
    }
    const json = (await res.json()) as { data: T };
    return json.data;
  } catch (err) {
    if (isDebug()) {
      console.error(`[Promise Tracker] ${path} error:`, err);
    }
    return null;
  }
}

export interface HeartbeatPayload {
  project: string;
  file: string;
  language: string;
  isWrite: boolean;
  timestamp: string;
  editor: string;
  projectId?: string;
}

export interface HeartbeatResponse {
  todayTotal: number;
}

export interface TodaySummary {
  totalSeconds: number;
  heartbeatCount: number;
  projectBreakdown: { project: string; seconds: number; percentage: number }[];
  languageBreakdown: { language: string; seconds: number; percentage: number }[];
}

export async function sendHeartbeat(data: HeartbeatPayload, apiUrlOverride?: string): Promise<HeartbeatResponse | null> {
  return request<HeartbeatResponse>('/time/editor-heartbeat', {
    method: 'POST',
    body: JSON.stringify(data),
  }, apiUrlOverride);
}

export async function getTodaySummary(): Promise<TodaySummary | null> {
  return request<TodaySummary>('/time/editor-summary/today');
}

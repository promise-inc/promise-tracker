import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface ProjectConfig {
  apiUrl?: string;
  tokenFile?: string;
  teamId?: string;
  teamName?: string;
  projectId?: string;
  projectName?: string;
}

const configCache = new Map<string, ProjectConfig | null>();

export function detectProject(filePath: string): {
  apiUrl?: string;
  teamId?: string;
  projectId?: string;
  projectName: string;
} {
  // Walk up from file's directory looking for .promise-hub.json
  let dir = path.dirname(filePath);
  const root = path.parse(dir).root;

  while (dir !== root) {
    // Check cache
    if (configCache.has(dir)) {
      const cached = configCache.get(dir);
      if (cached) {
        return {
          apiUrl: cached.apiUrl,
          teamId: cached.teamId,
          projectId: cached.projectId,
          projectName: cached.projectName || path.basename(dir),
        };
      }
    }

    const configPath = path.join(dir, '.promise-hub.json');
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const config: ProjectConfig = JSON.parse(raw);
        configCache.set(dir, config);
        return {
          apiUrl: config.apiUrl,
          teamId: config.teamId,
          projectId: config.projectId,
          projectName: config.projectName || path.basename(dir),
        };
      } catch {
        // Invalid JSON, skip
      }
    }

    dir = path.dirname(dir);
  }

  // Fallback: use workspace folder name
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
  const projectName = workspaceFolder ? workspaceFolder.name : path.basename(path.dirname(filePath));

  return { projectName };
}

export function clearProjectCache(): void {
  configCache.clear();
}

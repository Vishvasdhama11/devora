/* global require, module, process, Buffer */
/* eslint-disable @typescript-eslint/no-require-imports */

const vscode = require("vscode");

function getBaseUrl() {
  const configured = process.env.DEVORA_WEB_URL;
  return configured || "http://localhost:3000";
}

async function openUrl(pathname) {
  const targetUrl = `${getBaseUrl()}${pathname}`;
  await vscode.env.openExternal(vscode.Uri.parse(targetUrl));
}

function createWorkspaceFromPrompt() {
  return vscode.window.showInputBox({
    prompt: "Name your Devora workspace",
    placeHolder: "API migration sprint",
    value: "New Devora workspace",
  });
}

async function openDashboard() {
  await openUrl("/dashboard");
}

async function openTools() {
  await openUrl("/tools");
}

async function createWorkspace() {
  const workspaceName = await createWorkspaceFromPrompt();
  if (!workspaceName) {
    return;
  }

  const workspace = {
    id: `ws-${Date.now().toString(36)}`,
    name: workspaceName,
    description: "Created from the VS Code extension",
    visibility: "private",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "vscode-extension",
  };

  const folder = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (folder) {
    const settingsPath = vscode.Uri.joinPath(folder, ".devora-workspaces.json");
    const exists = await vscode.workspace.fs.stat(settingsPath).then(() => true).catch(() => false);
    const current = exists
      ? JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(settingsPath)).toString("utf8"))
      : [];

    await vscode.workspace.fs.writeFile(
      settingsPath,
      Buffer.from(JSON.stringify([...current, workspace], null, 2), "utf8"),
    );
  }

  vscode.window.showInformationMessage(`Devora workspace created: ${workspaceName}`);
}

function activate(context) {
  const dashboardCommand = vscode.commands.registerCommand("devora.openDashboard", openDashboard);
  const toolsCommand = vscode.commands.registerCommand("devora.openTools", openTools);
  const workspaceCommand = vscode.commands.registerCommand("devora.createWorkspace", createWorkspace);

  context.subscriptions.push(dashboardCommand, toolsCommand, workspaceCommand);

  vscode.window.setStatusBarMessage("Devora ready", 2000);
}

function deactivate() {}

module.exports = { activate, deactivate };

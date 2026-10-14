#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const command = args[0] ?? "help";

function findProjectRoot(startDir = process.cwd()) {
  let current = startDir;

  while (current !== path.dirname(current)) {
    const registryPath = path.join(current, "src", "tools", "registry.ts");
    if (fs.existsSync(registryPath)) {
      return current;
    }
    current = path.dirname(current);
  }

  return process.cwd();
}

function getWorkspaceFilePath() {
  return path.join(findProjectRoot(), ".devora-workspaces.json");
}

function printHelp() {
  console.log(`Devora CLI

Usage:
  devora list
  devora tools
  devora workspace list
  devora workspace new <name>
  devora open <tool-slug>
  devora help
`);
}

function getTools() {
  const projectRoot = findProjectRoot();
  const registryPath = path.join(projectRoot, "src", "tools", "registry.ts");

  if (!fs.existsSync(registryPath)) {
    return [
      { slug: "json-formatter", name: "JSON Formatter" },
      { slug: "regex-tester", name: "Regex Tester" },
      { slug: "color-picker", name: "Color Picker" },
      { slug: "url-parser", name: "URL Parser" },
    ];
  }

  const source = fs.readFileSync(registryPath, "utf8");
  const matches = [...source.matchAll(/id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"/g)];

  return matches.map(([, , name, slug]) => ({ slug, name }));
}

function handleList() {
  const tools = getTools();
  console.log(JSON.stringify(tools, null, 2));
}

function handleWorkspaceList() {
  const filePath = getWorkspaceFilePath();

  if (!fs.existsSync(filePath)) {
    console.log(JSON.stringify([], null, 2));
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(JSON.stringify(data, null, 2));
}

function handleWorkspaceNew() {
  const name = args[2] ?? "new-workspace";
  const filePath = getWorkspaceFilePath();
  const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : [];
  const item = {
    id: `ws-${Date.now().toString(36)}`,
    name,
    createdAt: new Date().toISOString(),
    source: "devora-cli",
  };

  fs.writeFileSync(filePath, JSON.stringify([...existing, item], null, 2));
  console.log(`Created workspace: ${name}`);
}

function handleOpenTool() {
  const slug = args[1] ?? "json-formatter";
  const tools = getTools();
  const match = tools.find((tool) => tool.slug === slug);

  console.log(match ? `Opening Devora tool: ${match.name}` : `Opening Devora tool: ${slug}`);
  console.log(`Open the browser to /tools/${slug}`);
}

switch (command) {
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  case "list":
  case "tools":
    handleList();
    break;
  case "workspace":
    if (args[1] === "list") {
      handleWorkspaceList();
      break;
    }
    if (args[1] === "new") {
      handleWorkspaceNew();
      break;
    }
    printHelp();
    break;
  case "open":
    handleOpenTool();
    break;
  default:
    printHelp();
}

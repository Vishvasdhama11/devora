import { ApiTester } from "@/components/tools/api-tester";
import { ColorTools } from "@/components/tools/color-tools";
import { EncodingTool } from "@/components/tools/encoding-tool";
import { GitTool } from "@/components/tools/git-generator";
import { HashGenerator } from "@/components/tools/hash-generator";
import { JsonStudio } from "@/components/tools/json-studio";
import { MarkdownTool } from "@/components/tools/markdown-tool";
import { RegexBuilder } from "@/components/tools/regex-builder";
import { TimeTool } from "@/components/tools/time-tool";
import { UrlTool } from "@/components/tools/url-tool";
import { UuidGenerator } from "@/components/tools/uuid-generator";

export type ToolCategory =
  | "JSON"
  | "API"
  | "Regex"
  | "Encoding"
  | "Formatting"
  | "CSS"
  | "HTML"
  | "Security"
  | "Git"
  | "Time"
  | "URL";

export type ToolDefinition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  keywords: string[];
  component: React.ComponentType;
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    slug: "json-formatter",
    description: "Pretty-print JSON documents, validate syntax, and convert to TypeScript.",
    category: "JSON",
    tags: ["json", "format", "pretty"],
    keywords: ["json formatter", "pretty print", "indentation", "parse"],
    component: JsonStudio,
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    slug: "regex-tester",
    description: "Build and test patterns with match highlighting and common templates.",
    category: "Regex",
    tags: ["regex", "pattern", "match"],
    keywords: ["regex", "pattern", "matching", "capture groups"],
    component: RegexBuilder,
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    slug: "base64-encoder",
    description: "Encode or decode Base64, URL-safe strings, and HTML entities in-browser.",
    category: "Encoding",
    tags: ["base64", "encode", "decode"],
    keywords: ["base64", "url encode", "html entity"],
    component: EncodingTool,
  },
  {
    id: "api-tester",
    name: "API Tester",
    slug: "api-tester",
    description: "Send requests, inspect headers, time responses, and save a local request history.",
    category: "API",
    tags: ["api", "http", "rest"],
    keywords: ["rest api", "request builder", "headers", "fetch"],
    component: ApiTester,
  },
  {
    id: "color-picker",
    name: "Color Picker",
    slug: "color-picker",
    description: "Convert between HEX, RGB, HSL, and CSS variables with a vibrant palette tool.",
    category: "CSS",
    tags: ["color", "hex", "palette"],
    keywords: ["hex", "rgb", "hsl", "css variable"],
    component: ColorTools,
  },
  {
    id: "url-parser",
    name: "URL Parser",
    slug: "url-parser",
    description: "Break down URLs, build query strings, and inspect components safely in the browser.",
    category: "URL",
    tags: ["url", "query", "params"],
    keywords: ["url parser", "query params", "uri"],
    component: UrlTool,
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    slug: "uuid-generator",
    description: "Generate randomized UUIDs and copy them in a single click.",
    category: "Security",
    tags: ["uuid", "identity", "generator"],
    keywords: ["uuid", "guid", "random id"],
    component: UuidGenerator,
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    slug: "hash-generator",
    description: "Create SHA-256 hashes from strings without sending data to a server.",
    category: "Security",
    tags: ["hash", "sha256", "security"],
    keywords: ["sha256", "hash generator", "digest"],
    component: HashGenerator,
  },
  {
    id: "markdown-formatter",
    name: "Markdown Formatter",
    slug: "markdown-formatter",
    description: "Write and preview Markdown, then format rich content before sharing it.",
    category: "Formatting",
    tags: ["markdown", "preview", "document"],
    keywords: ["markdown", "preview", "formatter"],
    component: MarkdownTool,
  },
  {
    id: "time-converter",
    name: "Unix Timestamp Converter",
    slug: "time-converter",
    description: "Convert Unix timestamps, dates, and time zones in real time.",
    category: "Time",
    tags: ["time", "date", "timezone"],
    keywords: ["timestamp", "timezone", "date converter"],
    component: TimeTool,
  },
  {
    id: "git-command-generator",
    name: "Git Command Generator",
    slug: "git-command-generator",
    description: "Generate common Git commands for branching, commits, and release workflows.",
    category: "Git",
    tags: ["git", "command", "terminal"],
    keywords: ["git command", "branch", "commit", "checkout"],
    component: GitTool,
  },
];

export const TOOL_MAP = new Map(TOOL_REGISTRY.map((tool) => [tool.slug, tool]));
export const TOOL_BY_CATEGORY = TOOL_REGISTRY.reduce<Record<string, ToolDefinition[]>>((acc, tool) => {
  acc[tool.category] ??= [];
  acc[tool.category].push(tool);
  return acc;
}, {});

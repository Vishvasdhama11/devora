function escapeCsvValue(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function jsonToCsv(input: string): string {
  const value: unknown = JSON.parse(input);

  if (!Array.isArray(value) || !value.every(isObjectRecord)) {
    throw new Error("JSON must be an array of objects.");
  }

  if (value.length === 0) {
    return "";
  }

  const headers = [...new Set(value.flatMap((row: Record<string, unknown>) => Object.keys(row)))];

  if (headers.length === 0) {
    throw new Error("Each object must contain at least one property.");
  }

  const rows = [
    headers,
    ...value.map((row: Record<string, unknown>) => headers.map((header) => toCsvValue(row[header]))),
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
}

function parseCsv(input: string): string[][] {
  if (input.length === 0) {
    return [];
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let afterQuote = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        cell += character;
      }
      continue;
    }

    if (afterQuote && character !== "," && character !== "\r" && character !== "\n") {
      throw new Error("Unexpected character after a quoted CSV field.");
    }

    if (character === '"') {
      if (cell.length > 0) {
        throw new Error("Unexpected quote in an unquoted CSV field.");
      }
      inQuotes = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
      afterQuote = false;
    } else if (character === "\r" || character === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      afterQuote = false;
      if (character === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
    } else {
      cell += character;
    }
  }

  if (inQuotes) {
    throw new Error("CSV contains an unclosed quoted field.");
  }

  if (cell.length > 0 || row.length > 0 || !/[\r\n]$/.test(input)) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((record) => record.some((field) => field.length > 0));
}

export function csvToJson(input: string): string {
  const rows = parseCsv(input);

  if (rows.length === 0) {
    return "[]";
  }

  const [headers, ...records] = rows;
  if (headers.length === 0 || headers.some((header) => header.trim().length === 0)) {
    throw new Error("CSV must start with non-empty column names.");
  }

  if (new Set(headers).size !== headers.length) {
    throw new Error("CSV column names must be unique.");
  }

  const result = records.map((record, rowIndex) => {
    if (record.length > headers.length) {
      throw new Error(`CSV row ${rowIndex + 2} has more values than the header.`);
    }

    return Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""]));
  });

  return JSON.stringify(result, null, 2);
}

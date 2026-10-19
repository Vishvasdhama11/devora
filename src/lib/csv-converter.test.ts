import { describe, expect, it } from "vitest";

import { csvToJson, jsonToCsv } from "@/lib/csv-converter";

describe("jsonToCsv", () => {
  it("converts object arrays and unions keys across rows", () => {
    expect(jsonToCsv('[{"name":"Ada","active":true},{"name":"Lin","score":4}]')).toBe(
      "name,active,score\r\nAda,true,\r\nLin,,4",
    );
  });

  it("escapes commas, quotes, and line breaks and serializes nested values", () => {
    expect(jsonToCsv('[{"note":"hello, \\"world\\"\\nagain","meta":{"id":1}}]')).toBe(
      'note,meta\r\n"hello, ""world""\nagain","{""id"":1}"',
    );
  });

  it("rejects data that is not an array of non-empty objects", () => {
    expect(() => jsonToCsv('{"name":"Ada"}')).toThrow("array of objects");
    expect(() => jsonToCsv("[{},{}]")).toThrow("at least one property");
    expect(() => jsonToCsv("[null]")).toThrow("array of objects");
  });
});

describe("csvToJson", () => {
  it("parses quoted fields, escaped quotes, and CRLF records", () => {
    expect(csvToJson('name,note\r\nAda,"hello, ""world"""\r\nLin,"line one\nline two"\r\n')).toBe(
      JSON.stringify(
        [
          { name: "Ada", note: 'hello, "world"' },
          { name: "Lin", note: "line one\nline two" },
        ],
        null,
        2,
      ),
    );
  });

  it("fills missing values with empty strings and ignores blank records", () => {
    expect(csvToJson("name,role\nAda\n\n")).toBe(JSON.stringify([{ name: "Ada", role: "" }], null, 2));
  });

  it("rejects malformed quotes, duplicate headers, and excess fields", () => {
    expect(() => csvToJson('name,note\nAda,"unfinished')).toThrow("unclosed quoted field");
    expect(() => csvToJson('name,note\nAda,"closed"x')).toThrow("after a quoted CSV field");
    expect(() => csvToJson("name,name\nAda,Lin")).toThrow("unique");
    expect(() => csvToJson("name\nAda,Lin")).toThrow("more values");
  });
});

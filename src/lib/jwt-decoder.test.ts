import { describe, expect, it } from "vitest";

import { decodeJwt } from "@/lib/jwt-decoder";

function encodeBase64Url(value: unknown): string {
  return btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

describe("decodeJwt", () => {
  it("decodes the header and payload without requiring standard Base64 padding", () => {
    const token = `${encodeBase64Url({ alg: "HS256", typ: "JWT" })}.${encodeBase64Url({ sub: "user-1", name: "Ada Lovelace" })}.signature`;

    expect(decodeJwt(token)).toEqual({
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: "user-1", name: "Ada Lovelace" },
    });
  });

  it("rejects malformed tokens and malformed encoded JSON", () => {
    expect(() => decodeJwt("not-a-jwt")).toThrow("three JWT segments");
    expect(() => decodeJwt("a.b.c")).toThrow("not valid Base64URL-encoded JSON");
  });
});

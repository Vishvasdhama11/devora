import { describe, expect, it } from "vitest";

import { generatePassword } from "@/lib/password-generator";

const everyCharacterType = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
};

describe("generatePassword", () => {
  it("generates passwords of the requested length containing every selected character type", () => {
    const password = generatePassword(32, everyCharacterType);

    expect(password).toHaveLength(32);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password.split("").some((character) => "!@#$%^&*()-_=+[]{};:,.?/|~".includes(character))).toBe(true);
  });

  it("supports a single character set and validates length and selections", () => {
    const symbolsOnlyPassword = generatePassword(12, { ...everyCharacterType, lowercase: false, uppercase: false, numbers: false });
    expect(symbolsOnlyPassword.split("").every((character) => "!@#$%^&*()-_=+[]{};:,.?/|~".includes(character))).toBe(true);
    expect(() => generatePassword(7, everyCharacterType)).toThrow("between 8 and 128");
    expect(() => generatePassword(10, { lowercase: false, uppercase: false, numbers: false, symbols: false })).toThrow("at least one");
  });
});

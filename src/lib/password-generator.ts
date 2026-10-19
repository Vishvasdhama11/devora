export type PasswordOptions = {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

const CHARACTER_SETS: Record<keyof PasswordOptions, string> = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/|~",
};

const CHARACTER_SET_KEYS: (keyof PasswordOptions)[] = ["lowercase", "uppercase", "numbers", "symbols"];

function secureRandomIndex(maxExclusive: number, cryptoSource: Crypto): number {
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const sample = new Uint32Array(1);

  do {
    cryptoSource.getRandomValues(sample);
  } while (sample[0] >= limit);

  return sample[0] % maxExclusive;
}

export function generatePassword(
  length: number,
  options: PasswordOptions,
  cryptoSource: Crypto = globalThis.crypto,
): string {
  if (!Number.isInteger(length) || length < 8 || length > 128) {
    throw new Error("Password length must be between 8 and 128 characters.");
  }

  const selectedSets = CHARACTER_SET_KEYS
    .filter((key) => options[key])
    .map((key) => CHARACTER_SETS[key]);

  if (selectedSets.length === 0) {
    throw new Error("Select at least one character type.");
  }

  const allCharacters = selectedSets.join("");
  const password = selectedSets.map((set) => set[secureRandomIndex(set.length, cryptoSource)]);

  while (password.length < length) {
    password.push(allCharacters[secureRandomIndex(allCharacters.length, cryptoSource)]);
  }

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1, cryptoSource);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }

  return password.join("");
}

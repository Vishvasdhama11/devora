function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string): { header: unknown; payload: unknown } {
  const segments = token.trim().split(".");

  if (segments.length !== 3 || !segments[0] || !segments[1]) {
    throw new Error("Enter a token with the three JWT segments: header.payload.signature.");
  }

  try {
    return {
      header: JSON.parse(decodeBase64Url(segments[0])),
      payload: JSON.parse(decodeBase64Url(segments[1])),
    };
  } catch {
    throw new Error("The JWT header or payload is not valid Base64URL-encoded JSON.");
  }
}

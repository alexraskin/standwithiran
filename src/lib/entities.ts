/**
 * Minimal XML/HTML entity decoder.
 *
 * This replaces the `he` package, which compiled to a 95KB server chunk (the
 * largest in the build) to service roughly forty lines of feed parsing. RSS
 * needs the five XML predefined entities, `&nbsp;`, and numeric references.
 */
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const ENTITY = /&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g;

export function decodeEntities(input: string): string {
  return input.replace(ENTITY, (match, body: string) => {
    if (body[0] !== '#') {
      return NAMED[body.toLowerCase()] ?? match;
    }

    const hex = body[1] === 'x' || body[1] === 'X';
    const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);

    // Reject anything outside the Unicode range and the surrogate block, both
    // of which make String.fromCodePoint throw.
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
    if (code >= 0xd800 && code <= 0xdfff) return match;

    return String.fromCodePoint(code);
  });
}

import crypto from "crypto";

export type Token = readonly [tokenBytes: Buffer, tokenHash: TokenHash];

export interface TokenHash {
  /** The `base64` encoded digest of the hashed token. */
  digest: string;
  /** The `base64` encoded salt, used to hash the token. */
  salt: string;
}

/**
 * Creates a new token along with its hash.
 * @param tokenLen The length of the token in bytes. Default: 16
 * @param saltLen The length of the salt in bytes. Default: 16
 */
export function createToken(tokenLen = 16, saltLen = 16): Token {
  const salt = crypto.randomBytes(saltLen);
  const token = crypto.randomBytes(tokenLen);
  const hash = crypto.createHmac("sha256", salt).update(token).digest("base64");
  return [token, { digest: hash, salt: salt.toString("base64") }];
}

/**
 * Verifies whether the provided token matches the given token hash.
 *
 * To get the required buffer from an encoded string, you can use `Buffer.from`,
 * e.g. `Buffer.from(tokenStr, "base64url")`.
 */
export function verifyToken(inputToken: Buffer, tokenHash: TokenHash): boolean {
  const actual = crypto
    .createHmac("sha256", Buffer.from(tokenHash.salt, "base64"))
    .update(inputToken)
    .digest();
  const expected = Buffer.from(tokenHash.digest, "base64");
  return crypto.timingSafeEqual(actual, expected);
}

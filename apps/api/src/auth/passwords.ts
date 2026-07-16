import { scryptSync, timingSafeEqual } from "node:crypto";
import * as argon2 from "argon2";

const ARGON2_OPTIONS = { type: argon2.argon2id } as const;
const DUMMY_PASSWORD = "pumdoki-dummy-password-never-used";
const dummyHashPromise = argon2.hash(DUMMY_PASSWORD, ARGON2_OPTIONS);

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  encoded: string,
  password: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (encoded.startsWith("$argon2")) {
    try {
      return {
        valid: await argon2.verify(encoded, password),
        needsRehash: false,
      };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  if (encoded.startsWith("scrypt:")) {
    const [, salt, expectedHex] = encoded.split(":");
    if (!salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) {
      return { valid: false, needsRehash: false };
    }
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return {
      valid:
        expected.length === actual.length && timingSafeEqual(expected, actual),
      needsRehash: true,
    };
  }

  return { valid: false, needsRehash: false };
}

export async function runDummyPasswordVerify(password: string): Promise<void> {
  const dummyHash = await dummyHashPromise;
  await argon2.verify(dummyHash, password).catch(() => false);
}

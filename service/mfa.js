// Multi-factor authentication helpers: authenticator-app codes (TOTP),
// one-time recovery codes, and the short-lived "login in progress" state.
const crypto = require("crypto");
const { authenticator } = require("otplib");
const QRCode = require("qrcode");

const ISSUER = "SneakPeek360";
const STEP_MS = 30 * 1000; // a TOTP code lasts 30 seconds
authenticator.options = { window: 1 }; // also accept the previous/next code (clock drift)

// ---- Encrypting authenticator secrets at rest ----
// A TOTP secret has to be readable by the server, so it can't be hashed.
// Instead it is encrypted (AES-256-GCM) with a key from dbConfig.json, so a
// copy of the database alone is not enough to generate anyone's codes.
// The user's id is mixed in as "additional data": a secret copied from one
// user's record to another's will not decrypt.
const ENCRYPTED_PREFIX = "enc:v1:";
let encryptionKey = null;

const setEncryptionKey = (hex) => {
  if (typeof hex !== "string" || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "MFA_ENCRYPTION_KEY must be 64 hex characters (32 bytes) in dbConfig.json"
    );
  }
  encryptionKey = Buffer.from(hex, "hex");
};

const isEncrypted = (stored) =>
  typeof stored === "string" && stored.startsWith(ENCRYPTED_PREFIX);

const encryptSecret = (plain, userId) => {
  if (!encryptionKey) throw new Error("MFA encryption key is not set");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  cipher.setAAD(Buffer.from(String(userId)));
  const data = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENCRYPTED_PREFIX + [iv, tag, data].map((b) => b.toString("base64")).join(":");
};

// Also accepts a secret saved before encryption existed (plain text), so
// nobody is locked out mid-upgrade; the server re-saves those encrypted at startup.
const decryptSecret = (stored, userId) => {
  if (!isEncrypted(stored)) return stored;
  if (!encryptionKey) throw new Error("MFA encryption key is not set");
  const [iv, tag, data] = stored
    .slice(ENCRYPTED_PREFIX.length)
    .split(":")
    .map((part) => Buffer.from(part, "base64"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, iv);
  decipher.setAAD(Buffer.from(String(userId)));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
};

// ---- Login in progress ----
// After a correct password the browser holds a random challenge token, not a
// session. Only a correct authenticator (or recovery) code turns it into a
// session. Kept in memory: a server restart just means "log in again".
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const MAX_CHALLENGE_ATTEMPTS = 5;
const challenges = new Map(); // token -> { userId, expiresAt, attempts, pendingSecret }

const createChallenge = (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  challenges.set(token, {
    userId: String(userId),
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
    attempts: 0,
    pendingSecret: null, // set while the user is scanning the QR code
  });
  return token;
};

const getChallenge = (token) => {
  if (typeof token !== "string") return null;
  const entry = challenges.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    challenges.delete(token);
    return null;
  }
  return entry;
};

const deleteChallenge = (token) => challenges.delete(token);

// Too many wrong codes on one challenge ends it (the user logs in again)
const recordChallengeFailure = (token) => {
  const entry = challenges.get(token);
  if (!entry) return;
  entry.attempts += 1;
  if (entry.attempts >= MAX_CHALLENGE_ATTEMPTS) challenges.delete(token);
};

// ---- Per-account lockout ----
// Without this, someone who knows a password could start a fresh challenge
// every 5 guesses. Ten wrong codes locks MFA attempts for that account.
const LOCK_AFTER = 10;
const LOCK_MS = 15 * 60 * 1000;
const failures = new Map(); // userId -> { count, lockedUntil }

const isLocked = (userId) => {
  const f = failures.get(String(userId));
  return Boolean(f && f.lockedUntil > Date.now());
};

const recordUserFailure = (userId) => {
  const key = String(userId);
  const f = failures.get(key) || { count: 0, lockedUntil: 0 };
  if (f.lockedUntil && f.lockedUntil <= Date.now()) {
    f.count = 0; // an old lock has expired
    f.lockedUntil = 0;
  }
  f.count += 1;
  if (f.count >= LOCK_AFTER) f.lockedUntil = Date.now() + LOCK_MS;
  failures.set(key, f);
};

const clearUserFailures = (userId) => failures.delete(String(userId));

// Drop expired entries so the maps can't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of challenges) {
    if (entry.expiresAt < now) challenges.delete(token);
  }
  for (const [id, f] of failures) {
    if (f.lockedUntil <= now && f.count < LOCK_AFTER) failures.delete(id);
  }
}, 60 * 1000).unref();

// ---- Authenticator app (TOTP) ----
const generateSetup = async (username, existingSecret) => {
  const secret = existingSecret || authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(username, ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
  return { secret, otpauthUrl, qrDataUrl };
};

// Returns the time step the code belongs to, or null if the code is wrong.
// The caller must reject a step that is not newer than the last one used,
// otherwise a code could be replayed within its 30 second window.
const checkTotp = (secret, code) => {
  const clean = String(code || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return null;
  const delta = authenticator.checkDelta(clean, secret);
  if (delta === null || delta === undefined) return null;
  return Math.floor(Date.now() / STEP_MS) + delta;
};

// ---- Recovery codes ----
// Random, high-entropy, single use. Only SHA-256 hashes are stored.
const hashRecoveryCode = (code) =>
  crypto
    .createHash("sha256")
    .update(String(code).toLowerCase().replace(/[^a-z0-9]/g, ""))
    .digest("hex");

const generateRecoveryCodes = (count = 8) => {
  const codes = Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString("hex"); // 10 hex characters
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { codes, hashes: codes.map(hashRecoveryCode) };
};

module.exports = {
  setEncryptionKey,
  isEncrypted,
  encryptSecret,
  decryptSecret,
  createChallenge,
  getChallenge,
  deleteChallenge,
  recordChallengeFailure,
  isLocked,
  recordUserFailure,
  clearUserFailures,
  generateSetup,
  checkTotp,
  generateRecoveryCodes,
  hashRecoveryCode,
};

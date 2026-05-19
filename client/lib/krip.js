import CryptoJS from "crypto-js";

const RANDOM_LEN = 16; // hex chars
const KEY_LEN = 64; // hex chars (32 bytes)
const IV_LEN = 32; // hex chars (16 bytes)

function randomHex(len) {
  // CryptoJS works with bytes; we need hex chars => bytes = len/2
  const bytes = Math.ceil(len / 2);
  return CryptoJS.lib.WordArray.random(bytes)
    .toString(CryptoJS.enc.Hex)
    .slice(0, len);
}

function encrypt(obj) {
  // KEY (32 bytes) + IV (16 bytes) in hex
  const keyHex = CryptoJS.lib.WordArray.random(KEY_LEN / 2).toString(
    CryptoJS.enc.Hex,
  );
  const ivHex = CryptoJS.lib.WordArray.random(IV_LEN / 2).toString(
    CryptoJS.enc.Hex,
  );

  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const plaintext = JSON.stringify(obj);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv });
  const dataHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

  // Payload layout expected by decrypt():
  // R1 (16) + KEY (64) + R2 (16) + DATA (var) + R3 (16) + IV (32) + R4 (16)
  const r1 = randomHex(RANDOM_LEN);
  const r2 = randomHex(RANDOM_LEN);
  const r3 = randomHex(RANDOM_LEN);
  const r4 = randomHex(RANDOM_LEN);

  return `${r1}${keyHex}${r2}${dataHex}${r3}${ivHex}${r4}`;
}

function decrypt(payload) {
  let cursor = 0;

  // R1
  cursor += RANDOM_LEN;

  // KEY
  const keyHex = payload.slice(cursor, cursor + KEY_LEN);
  cursor += KEY_LEN;

  // R2
  cursor += RANDOM_LEN;

  // PAYLOAD (vai até antes do R3 + IV + R4)
  const ivStart = payload.length - (RANDOM_LEN + IV_LEN + RANDOM_LEN);
  const payloadHex = payload.slice(cursor, ivStart);

  // R3
  const ivHex = payload.slice(
    ivStart + RANDOM_LEN,
    ivStart + RANDOM_LEN + IV_LEN,
  );

  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const ciphertext = CryptoJS.enc.Hex.parse(payloadHex);

  // CryptoJS expects CipherParams when passando objetos
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext,
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv });

  const text = decrypted.toString(CryptoJS.enc.Utf8);
  if (!text) {
    throw new Error("Falha ao descriptografar");
  }

  return JSON.parse(text);
}

export const krip = {
  encrypt,
  decrypt,
};

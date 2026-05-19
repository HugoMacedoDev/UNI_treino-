const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const RANDOM_BYTES = 8;

const randomHex = (bytes) => crypto.randomBytes(bytes).toString("hex");

const encrypt = (obj) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const objectString = JSON.stringify(obj);
  let encrypted = cipher.update(objectString, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const encryptV1 = (obj) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const objectString = JSON.stringify(obj);
  let encrypted = cipher.update(objectString, "utf8", "hex");
  encrypted += cipher.final("hex");

  const r1 = randomHex(RANDOM_BYTES);
  const r2 = randomHex(RANDOM_BYTES);
  const r3 = randomHex(RANDOM_BYTES);
  const r4 = randomHex(RANDOM_BYTES);

  return (
    r1 + key.toString("hex") + r2 + encrypted + r3 + iv.toString("hex") + r4
  );
};

const decrypt = (encrypted) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  const obj = JSON.parse(decrypted);
  return obj;
};

const decryptV1 = (payload) => {
  try {
    const randomHexSize = RANDOM_BYTES * 2;

    let offset = 0;

    offset += randomHexSize;

    const keyHex = payload.slice(offset, offset + 64);
    const key = Buffer.from(keyHex, "hex");
    offset += 64;
    offset += randomHexSize;

    const ivHex = payload.slice(
      payload.length - randomHexSize - 32,
      payload.length - randomHexSize,
    );
    const iv = Buffer.from(ivHex, "hex");

    const encrypted = payload.slice(
      offset,
      payload.length - (randomHexSize * 2 + 32),
    );

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (err) {
    throw new Error("Erro ao descriptografar V1");
  }
};

module.exports = { encrypt, encryptV1, decrypt, decryptV1 };

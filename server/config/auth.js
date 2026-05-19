const bcrypt = require('bcryptjs');

const custo = 12;

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(custo);
  return bcrypt.hash(plainPassword, salt);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
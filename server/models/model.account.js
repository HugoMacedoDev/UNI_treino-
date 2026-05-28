const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  id: String,
  nome: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
  lesoes: { type: [String], default: [] },
  tokenRedefinicaoSenha: { type: String, required: false, default: null },
  validadeTokenRedefinicaoSenha: { type: Date, required: false, default: null },
});

module.exports = mongoose.model("Account", accountSchema);
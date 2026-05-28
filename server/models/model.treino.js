const mongoose = require("mongoose");

const exercicioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  series: { type: Number, required: true },
  repeticoes: { type: Number, required: true },
  carga: { type: Number, required: false, default: 0 },
  observacao: { type: String, required: false, default: "" }
});

const treinoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: false, default: "" },
  // diasSemana: { type: String, required: true },
  duracaoMinutos: { type: Number, required: true },
  exercicios: { type: [exercicioSchema], default: [] }
});

module.exports = mongoose.model("Treino", treinoSchema);
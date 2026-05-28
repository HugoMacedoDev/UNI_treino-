const Treino = require("../models/model.treino");

async function getListarTreinosController() {
  const treinos = await Treino.find();
  return treinos;
}

async function postCriarTreinoController(body) {
  const { nome, descricao, duracaoMinutos } = body;
  
  if (!nome || !duracaoMinutos) {
    throw { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  const novoTreino = new Treino({ nome, descricao, duracaoMinutos });
  const resultado = await novoTreino.save();
  return resultado;
}

async function putAtualizarTreinoController(body, params) {
  const { id } = params;
  const { nome, descricao, duracaoMinutos } = body;

  const treinoAtualizado = await Treino.findByIdAndUpdate(
    id,
    { nome, descricao, duracaoMinutos },
    { new: true }
  );

  if (!treinoAtualizado) {
    throw { success: false, message: "Treino não encontrado." };
  }

  return treinoAtualizado;
}

async function deleteRemoverTreinoController(body, params) {
  const { id } = params;
  const treinoDeletado = await Treino.findByIdAndDelete(id);
  
  if (!treinoDeletado) {
    throw { success: false, message: "Treino não encontrado." };
  }

  return { success: true, message: "Treino deletado com sucesso." };
}

async function getListarExerciciosController(body, params) {
  const { id } = params;
  const treino = await Treino.findById(id);

  if (!treino) {
    throw { success: false, message: "Treino não encontrado." };
  }

  return treino.exercicios;
}

async function postAdicionarExercicioController(body, params) {
  const { id } = params;
  const { nome, series, repeticoes, carga, observacao } = body;

  if (!nome || !series || !repeticoes) {
    throw { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  const treino = await Treino.findById(id);
  if (!treino) {
    throw { success: false, message: "Treino não encontrado." };
  }

  treino.exercicios.push({ nome, series, repeticoes, carga, observacao });
  await treino.save();

  return treino.exercicios[treino.exercicios.length - 1];
}

async function deleteRemoverExercicioController(body, params) {
  const { id, exercicioId } = params;

  const treino = await Treino.findById(id);
  if (!treino) {
    throw { success: false, message: "Treino não encontrado." };
  }

  const exercicio = treino.exercicios.id(exercicioId);
  if (!exercicio) {
    throw { success: false, message: "Exercício não encontrado neste treino." };
  }

  exercicio.deleteOne();
  await treino.save();

  return { success: true, message: "Exercício removido com sucesso." };
}

module.exports = {
  getListarTreinosController,
  postCriarTreinoController,
  putAtualizarTreinoController,
  deleteRemoverTreinoController,
  getListarExerciciosController,
  postAdicionarExercicioController,
  deleteRemoverExercicioController
};
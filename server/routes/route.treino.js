const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.treino");
const { verifyJWT } = require("../middleware/middleware.jwtoken");

// Coloque o verifyJWT AQUI nas suas rotas originais
router.get("/", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.getListarTreinosController, "result");
});

router.post("/", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.postCriarTreinoController, "result");
});

router.put("/:id", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.putAtualizarTreinoController, "result", req.params);
});

router.delete("/:id", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.deleteRemoverTreinoController, "result", req.params);
});

router.get("/:id/exercicios", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.getListarExerciciosController, "result", req.params);
});

router.post("/:id/exercicios", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.postAdicionarExercicioController, "result", req.params);
});

router.delete("/:id/exercicios/:exercicioId", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.deleteRemoverExercicioController, "result", req.params);
});

module.exports = router;
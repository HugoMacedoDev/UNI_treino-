const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.chat.js");
const { optionalJWT } = require("../middleware/middleware.jwtoken");

// Se houver JWT valido, injeta req.user para considerar as lesoes do aluno.
// Sem login, o chat continua funcionando como conversa publica.
router.post("/", optionalJWT, (req, res) => {
    responseHandler(req, res, controller.postEnviarMensagemController, "Mensagem");
});

module.exports = router;
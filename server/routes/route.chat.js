const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.chat.js");
const jwt = require("jsonwebtoken");

const SECRET = process.env.NODE_API_KEY;

function optionalJWT(req, res, next) {
  const authHeader = req.headers["authorization"] || req.query.token;
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

  if (!token) {
    req.user = {};
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, SECRET);
  } catch {
    req.user = {};
  }

  next();
}

/**
 * @swagger
 * /v1/mensagem:
 *   post:
 *     tags:
 *       - Mensagem
 *     summary: Envia mensagem para o Gemini
 *     description: Retorna a resposta gerada pela API do Gemini. Visitantes podem enviar mensagens ate atingir o limite do front-end; usuarios logados enviam com JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mensagem
 *             properties:
 *               mensagem:
 *                 type: string
 *                 example: faca um treino de superiores para mim
 *     responses:
 *       200:
 *         description: Resposta gerada com sucesso.
 *       401:
 *         description: Token ausente ou invalido.
 */
router.post("/", optionalJWT, (req, res) => {
  responseHandler(
    req,
    res,
    controller.postEnviarMensagemController,
    "Resposta",
    req,
  );
});

module.exports = router;

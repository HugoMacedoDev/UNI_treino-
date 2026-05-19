const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.account");

/**
 * @swagger
 * /v1/login:
 *   post:
 *     tags:
 *       - Login
 *     summary: Retorna token de acesso
 *     description: Retorna token de acesso para que possam ser feitas requisições ao back-end
 *     responses:
 *       200:
 *         description: Token gerado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
//  *     parameters:
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           type: string
// router.post("/", (req, res) => {
//   responseHandler(req, res, controller.postTokenController, "Token", req);
// });

router.post("/login", (req, res) => {
  responseHandler(req, res, controller.postLoginController, "result");
});

router.get("/google", (req, res) => {
  responseHandler(req, res, controller.getGoogleAuthUrlController, "url");
});

router.get("/google/callback", async (req, res) => {
  try {
    const result = await controller.getGoogleCallbackController(req, res);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const params = new URLSearchParams({
      token: result.accessToken,
      email: result.usuario.email,
      nome: result.usuario.nome,
    });

    res.redirect(`${clientUrl}/login?${params.toString()}`);
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const message =
      error.conteudo || error.message || "Nao foi possivel entrar com Google.";

    res.redirect(
      `${clientUrl}/login?googleError=${encodeURIComponent(message)}`,
    );
  }
});

router.post("/register", (req, res) => {
  responseHandler(req, res, controller.postRegisterController, "result");
});

router.post("/resetPassword/sendCode", (req, res) => {
  responseHandler(
    req,
    res,
    controller.postSendResetPasswordEmailController,
    "result",
  );
});

router.post("/resetPassword", (req, res) => {
  responseHandler(req, res, controller.postResetPasswordController, "result");
});
module.exports = router;

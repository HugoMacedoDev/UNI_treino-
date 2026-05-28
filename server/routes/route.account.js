const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.account");
const { verifyJWT } = require("../middleware/middleware.jwtoken");

/**
 * @swagger
 * /v1/login:
 * post:
 * tags:
 * - Login
 * summary: Retorna token de acesso
 * description: Retorna token de acesso para que possam ser feitas requisições ao back-end
 * responses:
 * 200:
 * description: Token gerado com sucesso.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 */
//   * parameters:
//   * - in: query
//   * name: status
//   * schema:
//   * type: string
// router.post("/", (req, res) => {
//   responseHandler(req, res, controller.postTokenController, "Token", req);
// });

router.post("/login", (req, res) => {
    responseHandler(req, res, controller.postLoginController, "result");
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

// ROTAS DE LESÕES (Protegidas pelo JWT)
router.get("/lesoes", verifyJWT, (req, res) => {
    // Passamos o req inteiro para o handler poder extrair o req.user
    responseHandler(req, res, controller.getListarLesoesController, "result", req.params, req);
});

router.post("/lesoes", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.postAdicionarLesaoController, "result", req.params, req);
});

router.delete("/lesoes/:index", verifyJWT, (req, res) => {
    responseHandler(req, res, controller.deleteRemoverLesaoController, "result", req.params, req);
});

module.exports = router;
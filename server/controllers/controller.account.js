const { getToken } = require("../middleware/middleware.jwtoken");
const { google } = require("googleapis");
const runValidation = require("../handlers/utils");
const LoginFieldsValidator = require("../handlers/ConcreteHandlers/LoginFieldsValidator");
const ResetPassFieldsValidator = require("../handlers/ConcreteHandlers/ResetPassFieldsValidator");
const UserValidator = require("../handlers/ConcreteHandlers/UserValidator");
const PasswordStrengthValidator = require("../handlers/ConcreteHandlers/PasswordStrengthValidator");
const UserExistsValidator = require("../handlers/ConcreteHandlers/UserValidator");
const EmailSentValidator = require("../handlers/ConcreteHandlers/EmailSentValidator");
const ResetCodeValidator = require("../handlers/ConcreteHandlers/ResetCodeValidator");
const NotPreviousPasswordValidator = require("../handlers/ConcreteHandlers/NotPreviousPasswordValidator");
const EmailFormatValidator = require("../handlers/ConcreteHandlers/EmailFormatValidator");
const PasswordMatchValidator = require("../handlers/ConcreteHandlers/PasswordMatchValidator");
const Account = require("../models/model.account");
const { hashPassword } = require("../config/auth");
const {
  default: sendResetPasswordEmail,
} = require("../models/model.mailer");
const crypto = require("crypto");

function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_CALLBACK_URL ||
    `http://localhost:${process.env.NODE_API_PORT}/v1/account/google/callback`;

  if (!clientId || !clientSecret) {
    throw {
      msg: "500",
      campo: "google",
      conteudo: "Credenciais do Google nao configuradas.",
    };
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function postLoginController(req, res) {
  const loginChain = new LoginFieldsValidator();
  loginChain.setNext(new EmailFormatValidator()).setNext(new UserValidator());

  res = runValidation(
    loginChain,
    req,
    (onSuccess = () => {
      return { success: true, accessToken: getToken({}) };
    }),
  );

  return res;
}

async function getGoogleAuthUrlController() {
  const oauth2Client = getGoogleOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: ["profile", "email"],
  });
}

async function getGoogleCallbackController(req, res) {
  const oauth2Client = getGoogleOAuthClient();
  const { code } = req.query;

  if (!code) {
    throw {
      msg: "400",
      campo: "google",
      conteudo: "Codigo de autorizacao do Google nao informado.",
    };
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  const email = data.email;
  const nome = data.name || email?.split("@")[0] || "Usuario";

  if (!email) {
    throw {
      msg: "400",
      campo: "google",
      conteudo: "O Google nao retornou um e-mail valido.",
    };
  }

  return {
    accessToken: getToken({ email, nome, provider: "google" }),
    usuario: { email, nome, picture: data.picture || null },
  };
}

async function postRegisterController(req, res) {
  let { nome, email, senha } = req;

  const hash = await hashPassword(senha);
  senha = hash;
  console.log(hash);
  const account = new Account({ nome, email, senha });

  res = await account.save();

  return res;
}

async function postSendResetPasswordEmailController(req, res) {
  const { email } = req;

  try {
    const token = crypto.randomBytes(20).toString("hex");
    const now = new Date();

    // Salvar token no banco

    return sendResetPasswordEmail(email, token);
  } catch (err) {
    return { error: "Cannot reset password, try again", message: err };
  }
}

async function postResetPasswordController(req, res) {
  const resetPasswordChain = new ResetCodeValidator();
  resetPasswordChain
    .setNext(new PasswordMatchValidator())
    .setNext(new NotPreviousPasswordValidator())
    .setNext(new PasswordStrengthValidator());

  return runValidation(resetPasswordChain, req);
}

module.exports = {
  postLoginController,
  getGoogleAuthUrlController,
  getGoogleCallbackController,
  postSendResetPasswordEmailController,
  postResetPasswordController,
  postRegisterController,
};

const { getToken } = require("../middleware/middleware.jwtoken");
const runValidation = require("../handlers/utils");
const LoginFieldsValidator = require("../handlers/ConcreteHandlers/LoginFieldsValidator");
const ResetPassFieldsValidator = require("../handlers/ConcreteHandlers/ResetPassFieldsValidator");
const PasswordStrengthValidator = require("../handlers/ConcreteHandlers/PasswordStrengthValidator");
const EmailSentValidator = require("../handlers/ConcreteHandlers/EmailSentValidator");
const ResetCodeValidator = require("../handlers/ConcreteHandlers/ResetCodeValidator");
const NotPreviousPasswordValidator = require("../handlers/ConcreteHandlers/NotPreviousPasswordValidator");
const EmailFormatValidator = require("../handlers/ConcreteHandlers/EmailFormatValidator");
const PasswordMatchValidator = require("../handlers/ConcreteHandlers/PasswordMatchValidator");
const Account = require("../models/model.account");
const { hashPassword, verifyPassword } = require("../config/auth");
const { default: sendResetPasswordEmail } = require("../models/model.mailer");
const crypto = require("crypto");
const bcrypt = require('bcryptjs');

async function postLoginController(body) {
    const { email, password } = body;

    // 1. Valida campos obrigatorios e formato do e-mail (sincrono)
    const fieldChain = new LoginFieldsValidator();
    fieldChain.setNext(new EmailFormatValidator());
    const fieldResult = fieldChain.handle({ email, password });
    if (!fieldResult.success) throw fieldResult;

    // 2. Busca usuario no banco
    const user = await Account.findOne({ email });
    if (!user) {
        throw { success: false, message: "Usuario ou senha invalidos.", campo: "email" };
    }

    // 3. Compara a senha usando bcrypt (verifyPassword = bcrypt.compare)
    const senhaValida = await verifyPassword(password, user.senha);
    if (!senhaValida) {
        throw { success: false, message: "Usuario ou senha invalidos.", campo: "senha" };
    }

    // 4. Gera o JWT com dados do usuario no payload
    const accessToken = getToken({
        id: String(user._id),
        email: user.email,
        nome: user.nome,
    });

    return { success: true, accessToken };
}

async function postRegisterController(req) {
    let { nome, email, senha } = req;

    const hash = await hashPassword(senha);
    senha = hash;
    const account = new Account({ nome, email, senha });

    const result = await account.save();

    return result;

}

async function postSendResetPasswordEmailController(req) {
    const { email } = req;

    try {
        const token = crypto.randomBytes(20).toString("hex");

        const tempoValidade = new Date();
        tempoValidade.setHours(tempoValidade.getHours() + 1);

        const usuario = await Account.findOne({ email });

        if (!usuario) {
            return {
                success: true,
                message: "Se o e-mail informado estiver cadastrado, as instruções de recuperação foram enviadas."
            };
        }

        usuario.tokenRedefinicaoSenha = token;
        usuario.validadeTokenRedefinicaoSenha = tempoValidade;
        await usuario.save();

        const recipients = [{
            email: usuario.email,
            name: usuario.nome
        }];

        await sendResetPasswordEmail(recipients, token);

        return {
            success: true,
            message: "Se o e-mail informado estiver cadastrado, as instruções de recuperação foram enviadas."
        };
    } catch (err) {
        return { error: "Não foi possível redefinir sua senha, tente novamente.", message: err };
    }
}

async function postResetPasswordController(req) {
    const { email, senha, token } = req;

    try {
        const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!regexSenha.test(senha)) {
            return {
                error: "A senha deve conter pelo menos 8 caracteres, incluindo letras e números."
            };
        }

        const usuario = await Account.findOne({ email });

        if (!usuario) {
            return { error: "Usuário não encontrado ou dados inválidos." };
        }

        if (!usuario.tokenRedefinicaoSenha || usuario.tokenRedefinicaoSenha !== token) {
            return { error: "Token de redefinição inválido ou já utilizado." };
        }

        const agora = new Date();
        if (usuario.validadeTokenRedefinicaoSenha < agora) {
            return { error: "Este token expirou. Solicite uma nova recuperação." };
        }

        const ehIgualASenhaAnterior = await bcrypt.compare(senha, usuario.senha);
        if (ehIgualASenhaAnterior) {
            return { error: "A nova senha não pode ser igual à sua senha atual." };
        }

        const saltRounds = 10;
        const novaSenhaCriptografada = await bcrypt.hash(senha, saltRounds);

        usuario.senha = novaSenhaCriptografada;
        usuario.tokenRedefinicaoSenha = null;
        usuario.validadeTokenRedefinicaoSenha = null;

        await usuario.save();

        return { success: true, message: "Senha redefinida com sucesso!" };

    } catch (err) {
        console.error("Erro no postResetPasswordController:", err);
        return { error: "Cannot reset password, try again", message: err.message || err };
    }
}

// Nova função: Adicionar Lesão ao Perfil
async function postAdicionarLesaoController(body, params, req) {
    const { lesao } = body; // A string da lesão (ex: "Tendinite no ombro (Leve) - Evitar elevação frontal")
    const userId = req.user.id; // Pegamos o ID do token JWT

    const usuario = await Account.findById(userId);
    if (!usuario) {
        throw { success: false, message: "Usuário não encontrado." };
    }

    usuario.lesoes.push(lesao);
    await usuario.save();

    return { success: true, lesoes: usuario.lesoes };
}

// Nova função: Remover Lesão do Perfil
async function deleteRemoverLesaoController(body, params, req) {
    const { index } = params; // Qual lesão da lista remover
    const userId = req.user.id;

    const usuario = await Account.findById(userId);
    if (!usuario) {
        throw { success: false, message: "Usuário não encontrado." };
    }

    if (index > -1 && index < usuario.lesoes.length) {
        usuario.lesoes.splice(index, 1);
        await usuario.save();
    }

    return { success: true, lesoes: usuario.lesoes };
}

// Nova Função: Listar Lesões
async function getListarLesoesController(body, params, req) {
    const userId = req.user.id;
    const usuario = await Account.findById(userId);
    if (!usuario) {
        throw { success: false, message: "Usuário não encontrado." };
    }
    return { success: true, lesoes: usuario.lesoes };
}

module.exports = {
    postLoginController,
    postSendResetPasswordEmailController,
    postResetPasswordController,
    postRegisterController,
    postAdicionarLesaoController, // EXPORTANDO AQUI
    deleteRemoverLesaoController, // EXPORTANDO AQUI
    getListarLesoesController // EXPORTANDO AQUI
};
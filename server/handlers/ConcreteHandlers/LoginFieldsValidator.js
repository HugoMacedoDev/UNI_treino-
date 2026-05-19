const BaseValidator = require("../BaseHandlers/BaseValidator");

class LoginFieldsValidator extends BaseValidator {
  handle(request) {
    if (!request.email || !request.password) {
      return {
        success: false,
        error: "Erro: Preencha todos os campos são obrigatórios.",
      };
    }
    return super.handle(request);
  }
}

module.exports = LoginFieldsValidator;

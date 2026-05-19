const BaseValidator = require("../BaseHandlers/BaseValidator");

class ResetPassFieldsValidator extends BaseValidator {
  handle(request) {
    if (!request.email) {
      return {
        success: false,
        error: "Erro: Preencha todos os campos são obrigatórios.",
      };
    }
    return super.handle(request);
  }
}

module.exports = ResetPassFieldsValidator;

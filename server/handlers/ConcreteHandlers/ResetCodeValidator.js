const BaseValidator = require("../BaseHandlers/BaseValidator");

class ResetCodeValidator extends BaseValidator {
  handle(data) {
    if (!data.code || data.code !== "123456") {
      return {
        success: false,
        message: "Código de recuperação inválido ou expirado.",
        campo: "code",
      };
    }
    return super.handle(data);
  }
}
module.exports = ResetCodeValidator;

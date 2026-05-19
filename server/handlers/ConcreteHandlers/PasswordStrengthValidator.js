const BaseValidator = require("../BaseHandlers/BaseValidator");

class PasswordStrengthValidator extends BaseValidator {
  handle(data) {
    if (data.password.length < 6) {
      return {
        success: false,
        message: "Senha muito curta (mínimo 5 caracteres).",
        campo: "auth",
      };
    }
    return super.handle(data);
  }
}

module.exports = PasswordStrengthValidator;

const BaseValidator = require("../BaseHandlers/BaseValidator");

class PasswordMatchValidator extends BaseValidator {
  handle(data) {
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: "As senhas não coincidem.",
        campo: "auth",
      };
    }

    return super.handle(data);
  }
}

module.exports = PasswordMatchValidator;

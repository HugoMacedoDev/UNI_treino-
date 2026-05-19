const BaseValidator = require("../BaseHandlers/BaseValidator");

class EmailFormatValidator extends BaseValidator {
  handle(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        campo: "email",
      };
    }
    return super.handle(data);
  }
}

module.exports = EmailFormatValidator;

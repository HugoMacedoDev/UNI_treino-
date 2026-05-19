const BaseValidator = require("../BaseHandlers/BaseValidator");

class NotPreviousPasswordValidator extends BaseValidator {
  handle(data) {
    if (data.password === "senha") {
      return {
        success: false,
        message: "A nova senha não pode ser igual à anterior.",
        campo: "password",
      };
    }
    return super.handle(data);
  }
}
module.exports = NotPreviousPasswordValidator;

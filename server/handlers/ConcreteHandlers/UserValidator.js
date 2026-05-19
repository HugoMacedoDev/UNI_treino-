const BaseValidator = require("../BaseHandlers/BaseValidator");

class UserExistsValidator extends BaseValidator {
  handle(request) {
    if (
      !(request.email == "user@unitreino.com" && request.password == "senha") &&
      !(request.email == "user@unitreino.com" && request.password == "senha2")
    ) {
      return { success: false, message: "Usuário ou senha inválidos." };
    }
    return super.handle(request);
  }
}

module.exports = UserExistsValidator;

const BaseValidator = require("../BaseHandlers/BaseValidator");

class EmailSentValidator extends BaseValidator {
  handle(data) {
    const lastSent = false;
    if (lastSent) {
      return {
        success: false,
        message: "Aguarde alguns minutos para solicitar novo envio.",
        campo: "cooldown",
      };
    } else {
      return {
        success: true,
        message: "E-mail de redefinição de senha enviado com sucesso!",
      };
    }
    return super.handle(data);
  }
}
module.exports = EmailSentValidator;

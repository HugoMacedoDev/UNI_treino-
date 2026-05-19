class BaseValidator {
  constructor() {
    this.nextValidator = null;
  }

  setNext(validator) {
    this.nextValidator = validator;
    return validator;
  }

  handle(request) {
    if (this.nextValidator) {
      return this.nextValidator.handle(request);
    }
    return { success: true };
  }
}

module.exports = BaseValidator;

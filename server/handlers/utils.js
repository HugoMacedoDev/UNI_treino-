const runValidation = (chain, data, onSuccess) => {
  const result = chain.handle(data);

  if (result.success) {
    if (onSuccess) {
      return onSuccess();
    } else {
      return result;
    }
  } else {
    throw result;
  }
};

module.exports = runValidation;

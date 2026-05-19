const { decrypt } = require("./controller.criptography");

async function responseHandler(
  req,
  res,
  controllerMethod,
  responseKey,
  ...argument
) {
  const retorno = {};
  const INICIAL = performance.now();

  if (req.debug) {
    console.log(
      req.ip.split(":")[3],
      controllerMethod.name,
      "debug:",
      req.debug,
    );
  }

  try {
    try {
      req.user.sie = decrypt(req.user.sie);
    } catch {
      if (typeof req.user?.sie === "string" && req.user.sie.length > 5) {
        throw { msg: "405", campo: "responseHandler", conteudo: "" };
      }
    }

    retorno[responseKey] =
      argument.length === 0
        ? await controllerMethod(req.body, req)
        : await controllerMethod(req.body, ...argument);

    retorno.operacaoFinalizada = true;
    retorno.mensagem = { msg: "100: PROCESSO CONCLUIDO COM SUCESSO;" };

    const FINAL = performance.now();
    const runtime = (FINAL - INICIAL).toFixed(2);
    retorno.runtime = runtime;
  } catch (error) {
    console.error(`[Erro no Controller: ${controllerMethod.name}]`, error);

    const contexto = req.user?.contexto || "NaoDefinido";
    let ex;

    if (error.campo) {
      ex = {
        msg: error.msg || error.message || error.mensagem,
        campo: error.campo,
        conteudo: error.conteudo,
        detalhe: error.detalhe || "",
        contexto: contexto,
      };
    } else {
      ex = {
        msg: "209",
        campo: controllerMethod.name,
        conteudo: req.body || req.query || req.params || "",
        detalhe: error.message || error.mensagem || error,
        contexto: contexto,
      };
    }

    retorno.operacaoFinalizada = false;
    retorno.mensagem = ex;

    const FINAL = performance.now();
    const runtime = (FINAL - INICIAL).toFixed(2);
    retorno.runtime = runtime;
  }
  res.json(retorno);
}

module.exports = responseHandler;

const axios = require("axios");

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_TIMEOUT_MS = 15000;

async function postEnviarMensagemController(body) {
  const mensagem = body?.mensagem || body?.message || body?.prompt;
  const apiKey = process.env.GEMINI_APIKEY;

  if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
    throw {
      msg: "400",
      campo: "mensagem",
      conteudo: "Informe uma mensagem para enviar ao Gemini.",
    };
  }

  if (!apiKey) {
    throw {
      msg: "500",
      campo: "GEMINI_APIKEY",
      conteudo: "Chave da API do Gemini nao configurada.",
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  let response;

  try {
    response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: mensagem.trim() }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        timeout: GEMINI_TIMEOUT_MS,
      },
    );
  } catch (error) {
    throw {
      msg: "502",
      campo: "Gemini",
      conteudo: "Erro ao se comunicar com a API do Gemini.",
      detalhe: error.response?.data?.error?.message || error.message,
    };
  }

  const texto = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!texto) {
    throw {
      msg: "502",
      campo: "Gemini",
      conteudo: "A API do Gemini nao retornou texto.",
      detalhe: response.data,
    };
  }

  return texto;
}

module.exports = { postEnviarMensagemController };

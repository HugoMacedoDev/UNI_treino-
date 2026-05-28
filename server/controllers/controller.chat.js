const axios = require("axios");
const Account = require("../models/model.account");
require("dotenv").config();

const GEMINI_APIKEY = process.env.GEMINI_APIKEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GEMINI_MAX_RETRIES = 2;

/**
 * Monta o system prompt da IA com:
 *  - Restricao ao tema academia/treinos (UniFor)
 *  - Lesoes do aluno para filtrar exercicios perigosos
 */
function buildSystemPrompt(lesoes = []) {
  const basePrompt = `
Voce e o UniTreino, assistente virtual de treinos da Academia UniFor (Universidade de Fortaleza).
Sua unica funcao e auxiliar os alunos com assuntos relacionados a academia e condicionamento fisico.

VOCE PODE ajudar com:
- Sugestao e planejamento de treinos (musculacao, funcional, cardio, etc.)
- Explicacao de execucao de exercicios
- Dicas de aquecimento, alongamento e recuperacao
- Orientacao sobre series, repeticoes e cargas
- Motivacao e habitos saudaveis relacionados a academia

VOCE NAO DEVE responder sobre:
- Culinaria, receitas ou dietas detalhadas (encaminhe para um nutricionista)
- Politica, entretenimento, tecnologia ou qualquer outro tema fora de academia
- Diagnosticos ou tratamentos medicos (recomende sempre um medico)
- Suplementacao com indicacao de marcas ou doses especificas

Caso o usuario pergunte algo fora do escopo, responda educadamente:
"Sou especializado apenas em treinos e condicionamento fisico. Para esse assunto, recomendo buscar um profissional adequado."

Seja sempre objetivo, motivador e seguro nas suas respostas.
  `.trim();

  const lesoesPrompt =
    lesoes.length > 0
      ? `\n\nRESTRICOES FISICAS DO ALUNO:\nEste aluno possui as seguintes lesoes ou limitacoes: ${lesoes.join(", ")}.\nSEMPRE leve isso em conta ao sugerir exercicios. Evite movimentos que possam agravar essas condicoes e proponha alternativas seguras quando necessario.`
      : "";

  return basePrompt + lesoesPrompt;
}

function buildFallbackResponse(mensagem) {
  const texto = mensagem.toLowerCase();

  const hasAny = (palavras) => palavras.some((palavra) => texto.includes(palavra));

  if (hasAny(["dor", "lesao", "lesão", "machuquei", "machucado", "joelho", "ombro", "lombar", "coluna"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te orientar com seguranca:",
      "",
      "- Se voce sente dor forte, pontada, formigamento ou perda de forca, pare o exercicio.",
      "- Evite treinar pesado a regiao dolorida ate ser avaliado.",
      "- Procure um medico, fisioterapeuta ou profissional de educacao fisica presencial.",
      "- Para continuar treinando, escolha exercicios sem dor e com carga leve.",
      "",
      "Dor muscular leve apos treino pode ser normal. Dor articular ou dor aguda nao deve ser ignorada.",
    ].join("\n");
  }

  if (hasAny(["suplemento", "creatina", "whey", "pre treino", "pré treino", "termogenico", "termogênico"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te responder de forma geral:",
      "",
      "Suplementos podem ajudar, mas nao substituem treino, alimentacao e descanso.",
      "Para doses, marcas ou combinacoes especificas, procure um nutricionista.",
      "",
      "Para musculacao, o mais importante costuma ser:",
      "- Treinar com consistencia",
      "- Comer proteina suficiente ao longo do dia",
      "- Dormir bem",
      "- Progredir carga ou repeticoes aos poucos",
    ].join("\n");
  }

  if (hasAny(["dieta", "alimentacao", "alimentação", "comer", "caloria", "proteina", "proteína", "emagrecer comendo"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso dar uma orientacao geral:",
      "",
      "- Para ganhar massa, normalmente e necessario treinar bem e comer o suficiente.",
      "- Para perder gordura, normalmente e necessario manter deficit calorico.",
      "- Proteinas ajudam na recuperacao e manutencao muscular.",
      "- Evite dietas muito restritivas sem acompanhamento.",
      "",
      "Para um plano alimentar detalhado, o ideal e procurar um nutricionista.",
    ].join("\n");
  }

  if (hasAny(["iniciante", "comecando", "começando", "primeiro treino", "nunca treinei", "voltei a treinar"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te passar um treino base para iniciante:",
      "",
      "Treino Full Body - 3 vezes por semana",
      "1. Leg press: 3 series de 10 a 12 repeticoes",
      "2. Supino maquina ou halteres: 3 series de 10 a 12 repeticoes",
      "3. Puxada na frente: 3 series de 10 a 12 repeticoes",
      "4. Cadeira extensora: 2 a 3 series de 12 repeticoes",
      "5. Mesa flexora: 2 a 3 series de 12 repeticoes",
      "6. Desenvolvimento de ombros: 2 a 3 series de 10 repeticoes",
      "7. Abdominal: 3 series de 12 a 20 repeticoes",
      "",
      "Use carga leve/moderada e foque em aprender a execucao.",
    ].join("\n");
  }

  if (hasAny(["hipertrofia", "ganhar massa", "massa muscular", "crescer", "ficar grande"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te passar uma base para hipertrofia:",
      "",
      "- Frequencia: treine cada grupo muscular 1 a 2 vezes por semana.",
      "- Series: 10 a 20 series semanais por grupo muscular, ajustando ao seu nivel.",
      "- Repeticoes: geralmente 6 a 15 repeticoes funcionam bem.",
      "- Carga: escolha um peso que deixe as ultimas repeticoes dificeis, sem perder tecnica.",
      "- Descanso: 60 a 120 segundos entre series, ou mais em exercicios pesados.",
      "- Progressao: tente aumentar carga, repeticoes ou qualidade da execucao ao longo das semanas.",
    ].join("\n");
  }

  if (hasAny(["emagrecer", "perder gordura", "secar", "definir", "definicao", "definição"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso sugerir uma estrategia de treino para perda de gordura:",
      "",
      "- Musculacao 3 a 5 vezes por semana para manter massa muscular.",
      "- Cardio 2 a 4 vezes por semana, de 20 a 40 minutos.",
      "- Priorize exercicios compostos: agachamento, remadas, supinos, puxadas e levantamentos.",
      "- Mantenha boa intensidade, mas sem sacrificar a execucao.",
      "- A perda de gordura depende muito da alimentacao; procure um nutricionista para plano detalhado.",
    ].join("\n");
  }

  if (hasAny(["forca", "força", "ficar forte", "aumentar carga", "carga maxima", "carga máxima"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te passar uma base para ganho de forca:",
      "",
      "- Foque em exercicios compostos: agachamento, supino, remada, terra e desenvolvimento.",
      "- Trabalhe com 3 a 6 repeticoes em exercicios principais.",
      "- Descanse 2 a 4 minutos entre series pesadas.",
      "- Aumente a carga aos poucos e mantenha tecnica perfeita.",
      "- Evite testar carga maxima toda semana.",
      "",
      "Exemplo: 4 series de 4 a 6 repeticoes no exercicio principal, depois acessorios com 8 a 12 repeticoes.",
    ].join("\n");
  }

  if (hasAny(["serie", "série", "series", "séries", "repeticao", "repetição", "repeticoes", "repetições", "quantas reps"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas aqui vai uma regra simples para series e repeticoes:",
      "",
      "- Hipertrofia: 3 a 4 series de 8 a 12 repeticoes.",
      "- Forca: 3 a 5 series de 3 a 6 repeticoes.",
      "- Resistencia muscular: 2 a 4 series de 12 a 20 repeticoes.",
      "- Iniciante: 2 a 3 series de 10 a 12 repeticoes.",
      "",
      "A carga deve permitir terminar a serie com tecnica boa e esforco controlado.",
    ].join("\n");
  }

  if (hasAny(["carga", "peso", "quanto peso", "aumentar peso", "progressao", "progressão"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te orientar sobre carga:",
      "",
      "- Escolha uma carga que permita completar as repeticoes com tecnica correta.",
      "- Se voce termina muito facil, aumente um pouco na proxima serie ou treino.",
      "- Se perde a postura ou rouba o movimento, diminua a carga.",
      "- Uma boa referencia e terminar a serie sentindo que conseguiria fazer mais 1 a 3 repeticoes.",
      "- Progrida aos poucos: mais repeticoes, mais carga ou melhor controle do movimento.",
    ].join("\n");
  }

  if (hasAny(["descanso", "descansar", "intervalo", "tempo entre series", "tempo entre séries"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas aqui vai uma base de descanso:",
      "",
      "- Exercicios pesados compostos: 90 a 180 segundos.",
      "- Exercicios isoladores: 45 a 90 segundos.",
      "- Treino de forca: 2 a 4 minutos.",
      "- Treino mais metabolico/cardio: 30 a 60 segundos.",
      "",
      "Se a tecnica cair muito na proxima serie, descanse um pouco mais.",
    ].join("\n");
  }

  if (hasAny(["aquecimento", "aquecer", "antes do treino"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso sugerir um aquecimento simples:",
      "",
      "1. Cardio leve: 5 minutos de esteira, bike ou eliptico.",
      "2. Mobilidade da regiao que sera treinada: 3 a 5 minutos.",
      "3. Series leves do primeiro exercicio antes de colocar carga de trabalho.",
      "",
      "Exemplo no supino: 1 ou 2 series leves antes das series principais.",
    ].join("\n");
  }

  if (hasAny(["alongamento", "alongar", "mobilidade"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas aqui vai uma orientacao geral:",
      "",
      "- Antes do treino: prefira mobilidade e alongamentos dinamicos.",
      "- Depois do treino: pode usar alongamentos leves, 20 a 30 segundos por posicao.",
      "- Nao force alongamento com dor.",
      "- Para melhorar mobilidade, pratique com frequencia e controle.",
    ].join("\n");
  }

  if (hasAny(["execucao", "execução", "como fazer", "postura", "tecnica", "técnica"])) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas aqui vao regras gerais de execucao:",
      "",
      "- Controle a subida e a descida do movimento.",
      "- Mantenha a coluna neutra sempre que possivel.",
      "- Evite usar impulso para levantar a carga.",
      "- Sinta o musculo alvo trabalhando.",
      "- Pare se sentir dor articular ou dor aguda.",
      "",
      "Se for um exercicio especifico, me mande o nome dele que eu explico melhor.",
    ].join("\n");
  }

  if (
    texto.includes("divida") ||
    texto.includes("dividir") ||
    texto.includes("divisao") ||
    texto.includes("divisão") ||
    texto.includes("3 vezes") ||
    texto.includes("tres vezes") ||
    texto.includes("três vezes") ||
    texto.includes("4 vezes") ||
    texto.includes("quatro vezes") ||
    texto.includes("5 vezes") ||
    texto.includes("cinco vezes") ||
    texto.includes("6 vezes") ||
    texto.includes("seis vezes") ||
    texto.includes("semana")
  ) {
    if (hasAny(["3 vezes", "tres vezes", "três vezes", "3x"])) {
      return [
        "No momento estou com dificuldade para acessar a IA externa, mas posso sugerir uma divisao base para 3 treinos por semana:",
        "",
        "Dia 1 - Full body A",
        "- Agachamento ou leg press: 3 series de 8 a 12 repeticoes",
        "- Supino reto: 3 series de 8 a 12 repeticoes",
        "- Remada baixa: 3 series de 10 a 12 repeticoes",
        "- Desenvolvimento de ombros: 3 series de 10 a 12 repeticoes",
        "- Abdominal: 3 series de 12 a 20 repeticoes",
        "",
        "Dia 2 - Full body B",
        "- Levantamento terra romeno: 3 series de 8 a 12 repeticoes",
        "- Puxada na frente: 3 series de 10 a 12 repeticoes",
        "- Supino inclinado: 3 series de 8 a 12 repeticoes",
        "- Cadeira extensora: 3 series de 12 a 15 repeticoes",
        "- Rosca direta: 3 series de 10 a 12 repeticoes",
        "",
        "Dia 3 - Full body C",
        "- Afundo ou passada: 3 series de 10 a 12 repeticoes por perna",
        "- Remada unilateral: 3 series de 10 a 12 repeticoes",
        "- Desenvolvimento de ombros: 3 series de 8 a 12 repeticoes",
        "- Mesa flexora: 3 series de 10 a 12 repeticoes",
        "- Triceps na polia: 3 series de 10 a 12 repeticoes",
      ].join("\n");
    }

    if (hasAny(["5 vezes", "cinco vezes", "5x"])) {
      return [
        "No momento estou com dificuldade para acessar a IA externa, mas posso sugerir uma divisao base para 5 treinos por semana:",
        "",
        "Dia 1 - Peito e triceps",
        "Dia 2 - Costas e biceps",
        "Dia 3 - Pernas completo",
        "Dia 4 - Ombros, abdomen e cardio leve",
        "Dia 5 - Superiores ou inferiores com foco nos pontos fracos",
        "",
        "Use 3 a 4 exercicios principais por treino, com 3 a 4 series de 8 a 12 repeticoes.",
        "Mantenha pelo menos 1 ou 2 dias de descanso/recuperacao na semana.",
      ].join("\n");
    }

    if (hasAny(["6 vezes", "seis vezes", "6x"])) {
      return [
        "No momento estou com dificuldade para acessar a IA externa, mas posso sugerir uma divisao base para 6 treinos por semana:",
        "",
        "Push/Pull/Legs 2x",
        "Dia 1 - Push: peito, ombros e triceps",
        "Dia 2 - Pull: costas e biceps",
        "Dia 3 - Legs: quadriceps, posteriores, gluteos e panturrilhas",
        "Dia 4 - Push novamente",
        "Dia 5 - Pull novamente",
        "Dia 6 - Legs novamente",
        "Dia 7 - Descanso",
        "",
        "Essa divisao exige boa recuperacao. Se estiver muito cansado, reduza volume ou treine 4 a 5 vezes por semana.",
      ].join("\n");
    }

    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso sugerir uma divisao base para 4 treinos por semana:",
      "",
      "Dia 1 - Superiores A",
      "- Supino reto: 3 series de 8 a 12 repeticoes",
      "- Remada baixa: 3 series de 10 a 12 repeticoes",
      "- Desenvolvimento de ombros: 3 series de 8 a 12 repeticoes",
      "- Rosca direta: 3 series de 10 a 12 repeticoes",
      "- Triceps na polia: 3 series de 10 a 12 repeticoes",
      "",
      "Dia 2 - Inferiores A",
      "- Agachamento: 3 series de 8 a 12 repeticoes",
      "- Leg press: 3 series de 10 a 12 repeticoes",
      "- Cadeira extensora: 3 series de 12 a 15 repeticoes",
      "- Mesa flexora: 3 series de 10 a 12 repeticoes",
      "- Panturrilha: 3 series de 12 a 20 repeticoes",
      "",
      "Dia 3 - Superiores B",
      "- Puxada na frente: 3 series de 10 a 12 repeticoes",
      "- Remada unilateral: 3 series de 10 a 12 repeticoes",
      "- Supino inclinado: 3 series de 8 a 12 repeticoes",
      "- Elevacao lateral: 3 series de 12 a 15 repeticoes",
      "- Abdominal: 3 series de 12 a 20 repeticoes",
      "",
      "Dia 4 - Inferiores B",
      "- Levantamento terra romeno: 3 series de 8 a 12 repeticoes",
      "- Afundo ou passada: 3 series de 10 a 12 repeticoes por perna",
      "- Cadeira flexora: 3 series de 10 a 12 repeticoes",
      "- Elevacao pelvica: 3 series de 10 a 12 repeticoes",
      "- Panturrilha: 3 series de 12 a 20 repeticoes",
      "",
      "Sugestao de agenda: segunda, terca, quinta e sexta. Descanse ou faca cardio leve nos outros dias.",
    ].join("\n");
  }

  if (texto.includes("superior") || texto.includes("peito") || texto.includes("costa") || texto.includes("braco")) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te passar um treino base de superiores:",
      "",
      "1. Supino reto: 3 series de 8 a 12 repeticoes",
      "2. Remada baixa: 3 series de 10 a 12 repeticoes",
      "3. Desenvolvimento de ombros: 3 series de 8 a 12 repeticoes",
      "4. Puxada na frente: 3 series de 10 a 12 repeticoes",
      "5. Rosca direta: 3 series de 10 a 12 repeticoes",
      "6. Triceps na polia: 3 series de 10 a 12 repeticoes",
      "",
      "Use carga moderada, mantenha a execucao controlada e pare se sentir dor.",
    ].join("\n");
  }

  if (texto.includes("inferior") || texto.includes("perna") || texto.includes("quadriceps") || texto.includes("gluteo")) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te passar um treino base de inferiores:",
      "",
      "1. Agachamento livre ou no smith: 3 series de 8 a 12 repeticoes",
      "2. Leg press: 3 series de 10 a 12 repeticoes",
      "3. Cadeira extensora: 3 series de 12 a 15 repeticoes",
      "4. Mesa flexora: 3 series de 10 a 12 repeticoes",
      "5. Elevacao pelvica: 3 series de 10 a 12 repeticoes",
      "6. Panturrilha em pe ou sentado: 3 series de 12 a 20 repeticoes",
      "",
      "Aqueça antes, controle a execucao e pare se sentir dor.",
    ].join("\n");
  }

  if (texto.includes("cardio") || texto.includes("esteira") || texto.includes("corrida") || texto.includes("bike")) {
    return [
      "No momento estou com dificuldade para acessar a IA externa, mas posso te passar um treino base de cardio:",
      "",
      "1. Aquecimento: 5 minutos em ritmo leve",
      "2. Intervalos: 8 rounds de 1 minuto moderado/forte + 1 minuto leve",
      "3. Desaquecimento: 5 minutos em ritmo leve",
      "",
      "Mantenha uma intensidade segura e reduza o ritmo se sentir tontura, dor ou falta de ar fora do normal.",
    ].join("\n");
  }

  return "No momento estou com dificuldade para acessar a IA externa. Pode tentar novamente em alguns instantes ou pedir um treino especifico, como superiores, inferiores ou cardio.";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askGemini(systemPrompt, mensagem) {
  let lastError;

  for (let tentativa = 0; tentativa <= GEMINI_MAX_RETRIES; tentativa += 1) {
    try {
      return await axios.post(
        GEMINI_URL,
        {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: mensagem }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_APIKEY,
          },
          timeout: 30000,
        }
      );
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const canRetry = status === 503 || status === 429 || error.code === "ECONNABORTED";

      if (!canRetry || tentativa === GEMINI_MAX_RETRIES) {
        throw lastError;
      }

      await wait(1500 * (tentativa + 1));
    }
  }

  throw lastError;
}

async function postEnviarMensagemController(body, req) {
  console.log("Chegou")
  const { mensagem } = body;

  if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
    throw { success: false, message: "Mensagem nao pode ser vazia.", campo: "mensagem" };
  }

  // Busca lesoes do aluno pelo id que vem no JWT (decodificado pelo verifyJWT)
  let lesoes = [];
  try {
    const userId = req?.user?.id;
    if (userId) {
      const user = await Account.findById(userId).select("lesoes");
      lesoes = user?.lesoes ?? [];
    }
  } catch {
    // Se falhar, continua sem lesoes no prompt
  }

  const systemPrompt = buildSystemPrompt(lesoes);

  let geminiResponse;
  try {
    geminiResponse = await askGemini(systemPrompt, mensagem.trim());
  } catch (error) {
    const status = error.response?.status;
    const geminiMessage = error.response?.data?.error?.message;
    console.error("[Gemini indisponivel]", status || error.message, geminiMessage || "");

    if (status === 429) {
      return {
        Resposta:
          "A IA do Gemini esta sem cota disponivel no momento. Verifique a cota/billing do projeto no Google AI Studio ou tente novamente mais tarde.",
      };
    }

    if (status === 400 || status === 403) {
      return {
        Resposta:
          "Nao consegui autenticar ou usar a API do Gemini. Confira se a chave GEMINI_APIKEY esta correta e se a Gemini API esta habilitada no projeto.",
      };
    }

    if (status === 503) {
      return {
        Resposta:
          "A IA do Gemini esta em alta demanda no momento e nao conseguiu responder. Tente novamente em alguns instantes.",
      };
    }

    return {
      Resposta:
        "Nao consegui obter uma resposta da IA do Gemini agora. Tente novamente em alguns instantes.",
    };
  }

  const resposta =
    geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Nao foi possivel obter uma resposta no momento. Tente novamente.";

  return { Resposta: resposta };
}

module.exports = { postEnviarMensagemController };

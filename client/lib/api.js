import axios from "axios";
import { useConfigStore } from "../store/configStore";
import { krip } from "./krip";
import { queryClient } from "./queryClient";

/**
 * Instância compartilhada do axios.
 * A cada requisição, pegamos a URL base e o token do configStore.
 */
export const api = axios.create();

// Alias (para reaproveitar código antigo que importava axiosInstance)
export const axiosInstance = api;

api.interceptors.request.use(
  (config) => {
    const { token } = useConfigStore.getState();

    const baseURL = import.meta.env.VITE_URL_API_NODE;

    // BaseURL apenas do configStore
    if (baseURL) {
      config.baseURL = baseURL;
    }

    // Token em todas as requisições (string vazia se não tiver)
    config.headers = config.headers || {};
    config.headers.Authorization = token || "";

    // Encriptação opcional (quando solicitado via header)
    // Uso: api.post("/rota", dados, { headers: { "x-krip": "1" } })
    const wantsKrip = String(config.headers?.["x-krip"] ?? "") === "1";

    if (wantsKrip) {
      // POST, PUT, PATCH, DELETE (envia no body)
      if (["post", "put", "patch", "delete"].includes(config.method || "")) {
        if (config.data !== undefined) {
          config.data = { payload: krip.encrypt(config.data) };
        }
      }

      // GET ou DELETE com query params
      if (
        (config.method === "get" || config.method === "delete") &&
        config.params
      ) {
        config.params = { payload: krip.encrypt(config.params) };
      }
    }

    return config;
  },
  (error) => {
    console.error("Erro antes mesmo de enviar:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // downloads (arraybuffer/blob) normalmente não tem mensagem/msg
    if (response.data?.byteLength) return response;

    const contentType = response.headers?.["content-type"];
    if (
      contentType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return response;
    }

    // Se vier payload criptografado, tenta descriptografar
    // - { payload: "..." } (padrão sugerido)
    // - ou response.data ser string
    const data = response.data;
    if (typeof data === "string") {
      try {
        response.data = krip.decrypt(data);
      } catch {
        // se não for krip válido, ignora
      }
    } else if (data?.dados && typeof data.dados === "string") {
      try {
        response.data = krip.decrypt(data.dados);
      } catch {
        // se não for krip válido, ignora e mantém como veio
      }
    }

    const msg = response?.data?.mensagem?.msg;

    if (msg?.slice(0, 3) === "405") {
      // Limpa tudo imediatamente quando detecta auth inválida
      // 1. Limpa localStorage
      localStorage.clear();
      // 2. Limpa sessionStorage
      sessionStorage.clear();
      // 3. Limpa todo o config do store (config, token, user, user_info, user_info_seg)
      useConfigStore.getState().clearAll();
      // 4. Limpa cache do React Query
      queryClient.clear();
      // 5. Limpa cache do navegador (se possível)
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }

      // Mostra um overlay simples e bonito pedindo para relogar
      const win = window;
      if (!win.__gestaoAuthAlertShown) {
        win.__gestaoAuthAlertShown = true;

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(15, 23, 42, 0.65)"; // slate-900/65
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        const card = document.createElement("div");
        card.style.background = "white";
        card.style.borderRadius = "0.75rem";
        card.style.padding = "1.75rem 2rem";
        card.style.maxWidth = "22rem";
        card.style.width = "100%";
        card.style.boxShadow =
          "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)";
        card.style.fontFamily =
          "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif";
        card.style.textAlign = "center";

        const title = document.createElement("h2");
        title.textContent = "Sessão expirada";
        title.style.fontSize = "1.25rem";
        title.style.fontWeight = "600";
        title.style.marginBottom = "0.5rem";
        title.style.color = "#0f172a"; // slate-900

        const text = document.createElement("p");
        text.textContent =
          "Sua autenticação não é mais válida. Faça login novamente para continuar.";
        text.style.fontSize = "0.95rem";
        text.style.color = "#64748b"; // slate-500
        text.style.marginBottom = "1.5rem";

        const button = document.createElement("button");
        button.textContent = "Voltar para o início";
        button.style.display = "inline-flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";
        button.style.width = "100%";
        button.style.padding = "0.6rem 1rem";
        button.style.borderRadius = "0.5rem";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.fontSize = "0.95rem";
        button.style.fontWeight = "500";
        button.style.color = "white";
        button.style.background = "linear-gradient(to right, #0ea5e9, #2563eb)"; // azul bonito
        button.style.boxShadow =
          "0 10px 15px -3px rgba(37, 99, 235, 0.3), 0 4px 6px -4px rgba(37, 99, 235, 0.3)";

        button.onclick = () => {
          document.body.removeChild(overlay);
          win.__gestaoAuthAlertShown = false;
          // Redireciona para a rota base (já limpamos tudo acima)
          window.location.href = "/";
        };

        card.appendChild(title);
        card.appendChild(text);
        card.appendChild(button);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
      }

      throw new Error("Token Inválido");
    }

    // Mantém a regra antiga: mensagem.msg deve começar com "100"
    if (typeof response?.data?.mensagem?.msg === "string") {
      const m = response.data.mensagem.msg;
      if (m.slice(0, 3) !== "100") {
        throw new Error(
          response?.data?.mensagem?.conteudo?.detalhe ||
            (typeof response?.data?.mensagem?.conteudo === "string" &&
              response?.data?.mensagem?.conteudo) ||
            (typeof response?.data?.mensagem?.detalhe === "string" &&
              response?.data?.mensagem?.detalhe) ||
            response?.data?.mensagem?.msg,
        );
      }
    }

    return response;
  },
  (error) => Promise.reject(error),
);

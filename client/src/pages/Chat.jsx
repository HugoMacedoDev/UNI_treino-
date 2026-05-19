import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { api } from '../../lib/api';

const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

const GUEST_MESSAGE_LIMIT = 30;
const GUEST_MESSAGE_COUNT_KEY = 'unitreino_guest_message_count';
const REDIRECT_AFTER_LOGIN_KEY = 'unitreino_redirect_after_login';

function getGuestMessageCount() {
  const count = Number(localStorage.getItem(GUEST_MESSAGE_COUNT_KEY));
  return Number.isFinite(count) ? count : 0;
}

function incrementGuestMessageCount() {
  const nextCount = getGuestMessageCount() + 1;
  localStorage.setItem(GUEST_MESSAGE_COUNT_KEY, String(nextCount));
  return nextCount;
}

function StopButton({ onClick }) {
  return (
    <button className="stop-generation-btn" onClick={onClick} aria-label="Parar geração">
      <span className="stop-square" aria-hidden="true" />
      Parar geração
    </button>
  );
}

function Chat() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hydrated, isLoggedIn } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [ultimaMsgBot, setUltimaMsgBot] = useState(null);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  // Guarda contra duplo disparo do StrictMode em dev
  const firstMsgSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const firstMessage = location.state?.firstMessage;
    if (firstMessage && !firstMsgSentRef.current) {
      firstMsgSentRef.current = true;
      sendMessage(firstMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  async function sendMessage(text, retryBotId = null) {
    if (!hydrated) return;

    if (!isLoggedIn && !retryBotId && getGuestMessageCount() >= GUEST_MESSAGE_LIMIT) {
      setLoginPopupOpen(true);
      return;
    }

    if (!retryBotId) {
      setMessages((prev) => [...prev, {
        id: `user-${Date.now()}`, tipo: 'usuario', conteudo: text
      }]);
    }

    const botId = retryBotId ?? `bot-${Date.now()}`;

    setMessages((prev) => {
      const already = prev.find((m) => m.id === botId);
      if (already) return prev.map((m) =>
        m.id === botId ? { ...m, conteudo: '', loading: true, error: false } : m
      );
      return [...prev, { id: botId, tipo: 'bot', conteudo: '', loading: true, error: false }];
    });

    setIsGenerating(true);
    setUltimaMsgBot(null);
    abortControllerRef.current = new AbortController();
    timeoutRef.current = setTimeout(() => abortControllerRef.current?.abort(), 20000);

    try {
      const response = await api.post('/v1/mensagem', {
        mensagem: text,
      }, {
        signal: abortControllerRef.current.signal,
      });

      const conteudo =
        response.data?.Resposta ??
        response.data?.mensagem?.conteudo ??
        response.data?.dados ??
        'Sem resposta do servidor.';

      setMessages((prev) =>
        prev.map((m) => m.id === botId ? { ...m, conteudo, loading: false } : m)
      );
      setUltimaMsgBot(botId);
      if (!isLoggedIn && !retryBotId) {
        incrementGuestMessageCount();
      }
    } catch (err) {
      const wasCanceled = err.name === 'AbortError' || err.name === 'CanceledError';
      const errorMessage =
        err?.response?.data?.mensagem?.detalhe ||
        err?.response?.data?.mensagem?.conteudo ||
        err?.message ||
        'Ocorreu uma falha de comunicacao. Tente novamente.';

      setMessages((prev) =>
        prev.map((m) => m.id === botId
          ? {
              ...m,
              conteudo: wasCanceled ? 'Tempo limite excedido. Tente novamente.' : errorMessage,
              loading: false,
              error: true,
              onRetry: () => sendMessage(text, botId),
            }
          : m
        )
      );
    } finally {
      clearTimeout(timeoutRef.current);
      setIsGenerating(false);
    }
  }

  function handleStopGeneration() {
    abortControllerRef.current?.abort();
    clearTimeout(timeoutRef.current);
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.tipo === 'bot' && m.loading
          ? { ...m, loading: false, conteudo: m.conteudo || '[geração interrompida]' }
          : m
      )
    );
  }

  function handleAdicionarTreino() {
    // TODO: lógica de salvar treino sugerido pela IA
    alert('Treino adicionado! (TODO: integrar com POST /v1/treinos)');
  }

  function handleLoginRequired() {
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, '/novo-chat');
    navigate('/login');
  }

  return (
    <div className="chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="chat-body">
        {isLoggedIn && (
          <>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((v) => !v)}
              treinos={MOCK_TREINOS}
            />
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
              treinos={MOCK_TREINOS}
            />
          </>
        )}

        <main className="chat-main" aria-label="Conversa">
          <div className="chat-messages" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatMessage message={msg} />
                {/* Botão "Adicionar treino" aparece após a última resposta do bot — logado */}
                {isLoggedIn && msg.id === ultimaMsgBot && msg.tipo === 'bot' && !msg.loading && !msg.error && (
                  <div className="chat-add-treino-area">
                    <button
                      className="chat-add-treino-btn"
                      onClick={handleAdicionarTreino}
                    >
                      Adicionar treino
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isGenerating && (
            <div className="chat-stop-area">
              <StopButton onClick={handleStopGeneration} />
            </div>
          )}

          <div className="chat-input-area">
            <ChatInput
              onSend={(text) => sendMessage(text)}
              disabled={!hydrated || isGenerating}
            />
          </div>
        </main>
      </div>

      {loginPopupOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="login-required-title">
          <div className="modal-card">
            <h2 id="login-required-title" className="modal-title">
              Faca login para enviar mensagens.
            </h2>
            <p className="modal-texto">
              Voce atingiu o limite de 30 mensagens como visitante. Faca login para continuar conversando com a IA.
            </p>
            <div className="modal-acoes">
              <button className="btn-secundario" onClick={() => setLoginPopupOpen(false)}>
                Permanecer desconectado
              </button>
              <button className="chat-login-modal-btn" onClick={handleLoginRequired}>
                Fazer login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;

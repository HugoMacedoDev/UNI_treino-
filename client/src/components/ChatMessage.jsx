import Logo from "./Logo";

function TypingIndicator() {
  return (
    <div className="typing-indicator" aria-label="Assistente digitando">
      <span />
      <span />
      <span />
    </div>
  );
}

function RetryButton({ onRetry }) {
  return (
    <button
      className="message-retry-btn"
      onClick={onRetry}
      aria-label="Tentar novamente"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.68" />
      </svg>
      Tentar novamente
    </button>
  );
}

/**
 * Renderiza o texto do bot respeitando quebras de linha e listas simples.
 * Para markdown completo, instalar react-markdown futuramente.
 */
function BotText({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let listBuffer = [];

  function flushList() {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="message-list">
          {listBuffer.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  }

  lines.forEach((line, i) => {
    const bulletMatch = line.match(/^[•\-\*]\s+(.+)/);
    const numberedMatch = line.match(/^\d+\.\s+(.+)/);

    if (bulletMatch || numberedMatch) {
      listBuffer.push(bulletMatch ? bulletMatch[1] : numberedMatch[1]);
    } else {
      flushList();
      if (line.trim() === "") {
        elements.push(<br key={`br-${i}`} />);
      } else {
        elements.push(
          <p key={`p-${i}`} className="message-p">
            {line}
          </p>,
        );
      }
    }
  });
  flushList();

  return <>{elements}</>;
}

function ChatMessage({ message }) {
  const { tipo, conteudo, loading, error, onRetry } = message;
  const isUser = tipo === "usuario";

  if (isUser) {
    return (
      <div className="message message--user">
        <div className="message-bubble message-bubble--user">{conteudo}</div>
      </div>
    );
  }

  return (
    <div className="message message--bot">
      <div className="message-bot-avatar" aria-hidden="true">
        <Logo size={22} iconOnly />
      </div>
      <div className="message-bubble message-bubble--bot">
        {loading ? (
          <TypingIndicator />
        ) : error ? (
          <>
            <p className="message-error-text">
              {conteudo || "Ocorreu uma falha de comunicacao. Tente novamente."}
            </p>
            {onRetry && <RetryButton onRetry={onRetry} />}
          </>
        ) : (
          <BotText text={conteudo} />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;

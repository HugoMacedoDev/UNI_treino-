import { useState, useRef } from 'react';

/* icones */
function IcImage() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IcCode() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IcMic() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8"  y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IcArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

/**
 * ChatInput — campo de entrada compartilhado entre NovoChat e Chat.
 *
 * Props:
 *   onSend      {function(text)}  — chamado ao enviar
 *   disabled    {boolean}         — desabilita enquanto o bot responde
 *   placeholder {string}
 */
function ChatInput({ onSend, disabled = false, placeholder = 'Como posso te ajudar hoje?' }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const hasText = value.trim().length > 0;

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleChange(e) {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }

  return (
    <div className={`chat-input-box${disabled ? ' chat-input-box--disabled' : ''}`}>
      <textarea
        ref={textareaRef}
        className="chat-input-textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        aria-label="Mensagem para o assistente"
      />
      <div className="chat-input-footer">
        <div className="chat-input-icons">
          <button className="chat-input-icon-btn" type="button" aria-label="Anexar imagem" disabled={disabled}>
            <IcImage />
          </button>
          <button className="chat-input-icon-btn" type="button" aria-label="Inserir bloco de código" disabled={disabled}>
            <IcCode />
          </button>
          <button className="chat-input-icon-btn" type="button" aria-label="Gravar áudio" disabled={disabled}>
            <IcMic />
          </button>
        </div>

        {/* Botão enviar: visível no mobile, desktop texto */}
        <button
          className={`chat-send-btn${hasText ? ' chat-send-btn--active' : ''}`}
          type="button"
          onClick={submit}
          disabled={!hasText || disabled}
          aria-label="Enviar mensagem"
        >
          <IcArrowUp />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;

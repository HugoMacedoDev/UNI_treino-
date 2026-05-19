import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

/* ── Ícones ── */
function IcMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IcPlusCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8"  y1="12" x2="16" y2="12" />
    </svg>
  );
}
function IcSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IcBell({ hasUnread }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasUnread && (
        <span style={{
          position: 'absolute', top: '-3px', right: '-3px',
          width: '8px', height: '8px', background: '#ef4444',
          borderRadius: '50%',
        }} />
      )}
    </div>
  );
}

/* ── Painel de Notificações ── */
function NotificacoesPainel({ onVoltar, notifications, onMarkAsRead }) {
  return (
    <>
      <div className="sidebar-header">
        <span className="sidebar-title">Notificações</span>
        <button className="sidebar-voltar-btn" onClick={onVoltar}>Voltar</button>
      </div>
      <div className="sidebar-notif-list">
        {notifications.length === 0 ? (
          <span className="sidebar-empty">Nenhuma notificação</span>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`sidebar-notif-card${n.lida ? ' sidebar-notif-card--lida' : ''}`}
              onClick={() => onMarkAsRead(n.id)}
            >
              <span className="sidebar-notif-fonte">Academia Unifor</span>
              <p className="sidebar-notif-msg">{n.mensagem}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ── Conteúdo principal ── */
function SidebarContent({ treinos, user, onNewChat, onToggle, onItemClick, onShowNotif }) {
  const { unreadCount } = useNotifications();

  return (
    <>
      <div className="sidebar-header">
        <div className="sidebar-header-left">
          {/* Botão sanduíche — abre/fecha a sidebar */}
          {onToggle && (
            <button className="sidebar-icon-btn" onClick={onToggle} aria-label="Recolher menu">
              <IcMenu />
            </button>
          )}
          {/* "Treinos" clicável → /crud-treino */}
          <Link to="/crud-treino" className="sidebar-title-link" onClick={onItemClick}>
            Treinos
          </Link>
        </div>
        <button className="sidebar-icon-btn" onClick={onNewChat} aria-label="Novo chat">
          <IcPlusCircle />
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Pesquisar..."
          className="sidebar-search-input"
          aria-label="Pesquisar treinos"
        />
        <span className="sidebar-search-icon"><IcSearch /></span>
      </div>

      <nav className="sidebar-nav" aria-label="Histórico de treinos">
        <span className="sidebar-section-label">Treinos</span>
        {treinos.length === 0 ? (
          <span className="sidebar-empty">Nenhum treino ainda.</span>
        ) : (
          treinos.map((t) => (
            <Link
              key={t.id}
              to={`/chat/${t.id}`}
              className="sidebar-item"
              onClick={onItemClick}
            >
              {t.titulo}
            </Link>
          ))
        )}
      </nav>

      <div className="sidebar-list-btn-area">
        <Link to="/crud-treino" className="sidebar-acessar-lista-btn" onClick={onItemClick}>
          Acessar lista
        </Link>
      </div>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-avatar" aria-hidden="true">
            {user.nome?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <Link to="/perfil" className="sidebar-user-email" onClick={onItemClick}>
            {user.email ?? 'aluno@gmail.com'}
          </Link>
          <button
            className="sidebar-icon-btn sidebar-bell-btn"
            onClick={onShowNotif}
            aria-label="Ver notificações"
          >
            <IcBell hasUnread={unreadCount > 0} />
          </button>
        </div>
      )}
    </>
  );
}

/* ── Sidebar principal ── */
function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose, treinos = [] }) {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);

  function handleNewChat() {
    navigate('/novo-chat');
    onMobileClose?.();
  }

  const commonContent = showNotif ? (
    <NotificacoesPainel
      onVoltar={() => setShowNotif(false)}
      notifications={notifications}
      onMarkAsRead={markAsRead}
    />
  ) : (
    <SidebarContent
      treinos={treinos}
      user={user}
      onNewChat={handleNewChat}
      onToggle={!mobileOpen ? onToggle : undefined}
      onItemClick={onMobileClose}
      onShowNotif={() => setShowNotif(true)}
    />
  );

  /* Desktop colapsado */
  if (collapsed) {
    return (
      <aside className="sidebar sidebar--collapsed" aria-label="Menu recolhido">
        <button className="sidebar-icon-btn" onClick={onToggle} aria-label="Expandir menu">
          <IcMenu />
        </button>
        <button className="sidebar-icon-btn" onClick={handleNewChat} aria-label="Novo chat">
          <IcPlusCircle />
        </button>
        {user && (
          <div className="sidebar-collapsed-footer">
            <div className="sidebar-avatar" title={user.email ?? ''} aria-hidden="true">
              {user.nome?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        )}
      </aside>
    );
  }

  /* Mobile drawer */
  if (onMobileClose !== undefined) {
    return (
      <>
        {mobileOpen && (
          <div className="sidebar-overlay" onClick={onMobileClose} aria-hidden="true" />
        )}
        <aside
          className={`sidebar sidebar--mobile${mobileOpen ? ' sidebar--mobile-open' : ''}`}
          aria-label="Menu lateral"
          aria-hidden={!mobileOpen}
        >
          {commonContent}
        </aside>
      </>
    );
  }

  /* Desktop expandido */
  return (
    <aside className="sidebar sidebar--expanded" aria-label="Menu lateral">
      {commonContent}
    </aside>
  );
}

export default Sidebar;

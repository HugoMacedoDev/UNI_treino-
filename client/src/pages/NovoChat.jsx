import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

function NovoChat() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleFirstMessage(text) {
    // TODO: POST /api/conversas
    navigate('/chat/novo', { state: { firstMessage: text } });
  }

  return (
    <div className="novo-chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="novo-chat-body">
        {isLoggedIn && (
          <>
            {/* Desktop — com toggle */}
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((v) => !v)}
              treinos={MOCK_TREINOS}
            />
            {/* Mobile — drawer */}
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
              treinos={MOCK_TREINOS}
            />
          </>
        )}

        <main className="novo-chat-main" aria-label="Novo chat">
          <div className="novo-chat-logo-area" aria-hidden="true">
            <Logo size={64} />
          </div>
          <div className="novo-chat-input-area">
            <ChatInput onSend={handleFirstMessage} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default NovoChat;

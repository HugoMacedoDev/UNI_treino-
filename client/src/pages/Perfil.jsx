import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

// Campo de perfil com ativação por botão "Editar"
function CampoPerfil({ label, value, onChange, type = 'text', readOnly = false }) {
  const [editando, setEditando] = useState(false);

  return (
    <div className="perfil-campo">
      <div className="perfil-campo-header">
        <span className="perfil-campo-label">{label}</span>
        {!readOnly && (
          <button
            className="perfil-editar-btn"
            onClick={() => setEditando((v) => !v)}
            type="button"
          >
            {editando ? 'Salvar' : 'Editar'}
          </button>
        )}
      </div>
      <input
        type={type}
        className={`perfil-campo-input${editando ? ' perfil-campo-input--ativo' : ''}`}
        value={value}
        onChange={onChange}
        disabled={!editando || readOnly}
        aria-label={label}
      />
    </div>
  );
}

function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifAtivas, setNotifAtivas] = useState(true);
  const [campos, setCampos] = useState({
    nome: user?.nome ?? 'Aluno',
    email: user?.email ?? 'aluno@gmail.com',
    endereco: user?.endereco ?? 'Rua xxxxxx, edson queiroz, 2',
    telefone: user?.telefone ?? '+55 85 99999 9999',
  });
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [textoExclusao, setTextoExclusao] = useState('');

  function handleCampo(campo) {
    return (e) => setCampos((prev) => ({ ...prev, [campo]: e.target.value }));
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="chat-body">
        <Sidebar
          collapsed={false}
          treinos={MOCK_TREINOS}
        />
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          treinos={MOCK_TREINOS}
        />

        <main className="perfil-main" aria-label="Perfil">
          <div className="perfil-card">
            {}
            <button className="perfil-voltar" onClick={() => navigate(-1)}>
              Voltar
            </button>

            {}
            <div className="perfil-avatar-area">
              <div className="perfil-avatar">
                {campos.nome?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <button className="perfil-avatar-edit" aria-label="Alterar foto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>

            {}
            <div className="perfil-campos">
              <CampoPerfil label="Nome" value={campos.nome} onChange={handleCampo('nome')} />
              <CampoPerfil label="E-mail" value={campos.email} onChange={handleCampo('email')} type="email" readOnly />
              <CampoPerfil label="Endereço" value={campos.endereco} onChange={handleCampo('endereco')} />
              <CampoPerfil label="Telefone" value={campos.telefone} onChange={handleCampo('telefone')} type="tel" />
            </div>

            {}
            <div className="perfil-toggle-row">
              <span className="perfil-toggle-label">Notificações</span>
              <button
                className={`toggle-switch${notifAtivas ? ' toggle-switch--on' : ''}`}
                onClick={() => setNotifAtivas((v) => !v)}
                role="switch"
                aria-checked={notifAtivas}
                aria-label="Ativar notificações"
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="perfil-acoes">
              <button className="perfil-acao-link" onClick={() => navigate('/recuperar-senha')}>
                Mudar senha
              </button>
              <button className="perfil-acao-link" onClick={handleLogout}>
                Log-out
              </button>
              <button
                className="perfil-acao-link perfil-acao-link--danger"
                onClick={() => setConfirmarExclusao(true)}
              >
                Excluir a minha conta
              </button>
            </div>
          </div>

          {}
          {confirmarExclusao && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h2 className="modal-title">Tem certeza?</h2>
                <p className="modal-texto">
                  Digite <strong>"Eu quero excluir a minha conta"</strong> para confirmar.
                </p>
                <input
                  type="text"
                  className="auth-input"
                  value={textoExclusao}
                  onChange={(e) => setTextoExclusao(e.target.value)}
                  placeholder="Digite a frase de confirmação"
                />
                <div className="modal-acoes">
                  <button className="btn-secundario" onClick={() => setConfirmarExclusao(false)}>
                    Cancelar
                  </button>
                  <button
                    className="btn-perigo"
                    disabled={textoExclusao !== 'Eu quero excluir a minha conta'}
                    onClick={() => {
                      // TODO: DELETE /v1/usuario
                      logout();
                      navigate('/');
                    }}
                  >
                    Excluir conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Perfil;

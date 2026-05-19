import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

const MOCK_LISTA = [
  { id: '1', nome: 'Upper completo com ênfase no ombro', dia: 'Segunda-feira', ultima: '08-Dez-2021' },
  { id: '2', nome: 'Upper completo com ênfase no ombro', dia: 'Segunda-feira', ultima: '08-Dez-2021' },
  { id: '3', nome: 'Upper completo com ênfase no ombro', dia: 'Segunda-feira', ultima: '08-Dez-2021' },
  { id: '4', nome: 'Upper completo com ênfase no ombro', dia: 'Segunda-feira', ultima: '08-Dez-2021' },
  { id: '5', nome: 'Upper completo com ênfase no ombro', dia: 'Segunda-feira', ultima: '08-Dez-2021' },
];

function IcEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IcTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function IcSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function CrudTreino() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [lista, setLista] = useState(MOCK_LISTA);

  const listaFiltrada = lista.filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function handleDeletar(id) {
    setLista((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="chat-body">
        <Sidebar collapsed={false} treinos={MOCK_TREINOS} />
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          treinos={MOCK_TREINOS}
        />

        <main className="crud-main" aria-label="Lista de treinos">
          {/* Barra superior */}
          <div className="crud-topbar">
            <div className="crud-search-wrap">
              <span className="crud-search-icon"><IcSearch /></span>
              <input
                type="text"
                className="crud-search"
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Pesquisar treinos"
              />
            </div>
            <button className="btn-voltar-top" onClick={() => navigate(-1)}>
              voltar
            </button>
          </div>

          {/* Cabeçalho + botão criar */}
          <div className="crud-header">
            <h1 className="crud-titulo">Lista de Treinos</h1>
            <button
              className="crud-criar-btn"
              onClick={() => {/* TODO: abrir modal de criação */}}
            >
              Criar novo treino
            </button>
          </div>

          {/* Tabela — desktop */}
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Nome do treino</th>
                  <th>Dia do treino</th>
                  <th>Última realização</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((t) => (
                  <tr key={t.id}>
                    <td>{t.nome}</td>
                    <td>{t.dia}</td>
                    <td>{t.ultima}</td>
                    <td className="crud-acoes">
                      <button
                        className="crud-acao-btn crud-acao-btn--edit"
                        aria-label="Editar treino"
                        onClick={() => {/* TODO: editar */}}
                      >
                        <IcEdit />
                      </button>
                      <button
                        className="crud-acao-btn crud-acao-btn--delete"
                        aria-label="Excluir treino"
                        onClick={() => handleDeletar(t.id)}
                      >
                        <IcTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {listaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan="4" className="crud-vazio">Nenhum treino encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="crud-cards">
            {listaFiltrada.map((t) => (
              <div key={t.id} className="crud-card">
                <div className="crud-card-info">
                  <span className="crud-card-nome">{t.nome}</span>
                  <span className="crud-card-data">{t.ultima}</span>
                </div>
                <div className="crud-acoes">
                  <button className="crud-acao-btn crud-acao-btn--edit" aria-label="Editar">
                    <IcEdit />
                  </button>
                  <button
                    className="crud-acao-btn crud-acao-btn--delete"
                    aria-label="Excluir"
                    onClick={() => handleDeletar(t.id)}
                  >
                    <IcTrash />
                  </button>
                </div>
              </div>
            ))}
            <button className="crud-criar-btn crud-criar-btn--mobile">
              Criar novo treino
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CrudTreino;

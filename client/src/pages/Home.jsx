import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />
      <main className="home-main" aria-label="Página inicial">
        <div className="home-content">
          <h1 className="home-title">
            Bem-vindo ao<br />
            <span>UNI Treino</span>
          </h1>
          <p className="home-subtitle">
            Seu novo assistente virtual que te auxiliará em seu treino
          </p>
          <button
            className="btn-start-chat"
            onClick={() => navigate('/novo-chat')}
            aria-label="Iniciar um novo chat"
          >
            Iniciar um novo chat
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;

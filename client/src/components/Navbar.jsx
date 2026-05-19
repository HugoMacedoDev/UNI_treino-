import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — sino removido daqui (fica só na sidebar).
 * Props:
 *   onMobileMenuClick {function}
 *   showVoltar        {boolean}
 */
function Navbar({ onMobileMenuClick, showVoltar = false }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-inner" aria-label="Navegação principal">

        <Link to="/" className="navbar-logo-link" aria-label="Início">
          <Logo size={30} />
        </Link>

        <div className="navbar-actions">
          {showVoltar ? (
            <button className="btn-logout" onClick={() => navigate(-1)}>Voltar</button>
          ) : isLoggedIn ? (
            <>
              <button className="btn-logout" onClick={handleLogout}>Log-out</button>

              {/* Hamburger — só mobile */}
              <button
                className="navbar-hamburger"
                onClick={onMobileMenuClick}
                aria-label="Abrir menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6"  x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/cadastro" className="navbar-link">Cadastre-se</Link>
              <Link to="/login" className="btn-login">Log-in</Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}

export default Navbar;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../../lib/api';

function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nome || !form.email || !form.senha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (form.senha.length < 12) {
      setErro('A senha deve ter no mínimo 12 caracteres.');
      return;
    }
    if (!aceitaTermos) {
      setErro('Você precisa aceitar os termos e políticas.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/v1/account/register', {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      });
      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={48} />
        </div>

        <h1 className="auth-title">Comece agora</h1>

        {sucesso ? (
          <div className="auth-sucesso">
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                className="auth-input"
                placeholder="Digite seu nome"
                value={form.nome}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="Digite seu e-mail"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="senha">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                className="auth-input"
                placeholder="Mínimo 12 caracteres"
                value={form.senha}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={aceitaTermos}
                onChange={(e) => setAceitaTermos(e.target.checked)}
              />
              <span>
                Concordo com os{' '}
                <Link to="/termos" className="auth-link-small">termos e políticas</Link>
              </span>
            </label>

            {erro && <p className="auth-erro">{erro}</p>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Cadastre-se'}
            </button>
          </form>
        )}

        <div className="auth-divider"><span>ou</span></div>

        <button className="auth-google-btn" type="button" disabled title="Em breve">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Cadastrar com Google
        </button>

        <p className="auth-footer-text">
          Já possui uma conta?{' '}
          <Link to="/login" className="auth-link">Log-In</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;

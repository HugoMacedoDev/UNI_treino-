import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../../lib/api';

function RecuperarSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ token: '', senha: '', confirmPassword: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro('');
  }

  async function handleEnviarCodigo(e) {
    e.preventDefault();
    if (!email) { setErro('Informe seu e-mail.'); return; }

    setLoading(true);
    try {
      await api.post('/v1/account/resetPassword/sendCode', { email });
      setEtapa(2);
      setErro('');
    } catch (err) {
      const mensagemErro = err.response?.data?.error || err.message || 'Não foi possível enviar o código.';
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedefinir(e) {
    e.preventDefault();
    
    if (!form.token || !form.senha || !form.confirmPassword) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (form.senha !== form.confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }

    const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regexSenha.test(form.senha)) {
      setErro('A senha deve conter pelo menos 8 caracteres, incluindo letras e números.');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post('/v1/account/resetPassword', {
        email,
        senha: form.senha,
        token: form.token,
      });

      if (resp.data.result.error) {
        throw new Error(resp.data.result.error);
      }

      navigate('/login', { state: { senhaRedefinida: true } });
    } catch (err) {
        console.log(err)
      setErro(err);
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

        {etapa === 1 && (
          <>
            <h1 className="auth-title">Recuperar senha</h1>
            <p className="auth-subtitle">
              Informe o e-mail da sua conta e enviaremos um código de recuperação.
            </p>

            <form className="auth-form" onSubmit={handleEnviarCodigo} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                  autoComplete="email"
                />
              </div>

              {erro && <p className="auth-erro">{erro}</p>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>

            <p className="auth-footer-text">
              Lembrou a senha?{' '}
              <Link to="/login" className="auth-link">Voltar ao login</Link>
            </p>
          </>
        )}

        {etapa === 2 && (
          <>
            <h1 className="auth-title">Redefinir senha</h1>
            <p className="auth-subtitle">
              Digite o código enviado para <strong>{email}</strong> e sua nova senha.
            </p>

            <form className="auth-form" onSubmit={handleRedefinir} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="token">Código de recuperação</label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  className="auth-input"
                  placeholder="Digite o código recebido"
                  value={form.token}
                  onChange={handleFormChange}
                  autoComplete="one-time-code"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="senha">Nova senha</label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  className="auth-input"
                  placeholder="Mínimo 8 caracteres (letras e números)"
                  value={form.senha}
                  onChange={handleFormChange}
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="confirmPassword">Confirmar nova senha</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="auth-input"
                  placeholder="Repita a nova senha"
                  value={form.confirmPassword}
                  onChange={handleFormChange}
                  autoComplete="new-password"
                />
              </div>

              {erro && <p className="auth-erro">{erro}</p>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </form>

            <p className="auth-footer-text">
              Não recebeu o código?{' '}
              <button
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => { setEtapa(1); setErro(''); }}
              >
                Reenviar
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default RecuperarSenha;
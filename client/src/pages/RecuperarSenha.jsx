import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../../lib/api';

/**
 * Recuperação de senha — 2 etapas:
 *
 * Etapa 1: usuário informa o e-mail → POST /v1/account/resetPassword/sendCode
 *          Backend envia o código para o e-mail.
 *
 * Etapa 2: usuário informa o código recebido + nova senha + confirmação
 *          → POST /v1/account/resetPassword
 *          Campos esperados pelo backend: { code, password, confirmPassword }
 *
 * NOTA BACKEND: o ResetCodeValidator ainda usa código fixo "123456".
 * Quando o banco de dados estiver integrado, isso será substituído
 * pelo token salvo em tokenRedefinicaoSenha.
 */
function RecuperarSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ code: '', password: '', confirmPassword: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro('');
  }

  // ── Etapa 1: enviar código ──────────────────────────────────────────────────
  async function handleEnviarCodigo(e) {
    e.preventDefault();
    if (!email) { setErro('Informe seu e-mail.'); return; }

    setLoading(true);
    try {
      await api.post('/v1/account/resetPassword/sendCode', { email });
      setEtapa(2);
      setErro('');
    } catch (err) {
      setErro(err.message || 'Não foi possível enviar o código. Verifique o e-mail e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ── Etapa 2: redefinir senha ────────────────────────────────────────────────
  async function handleRedefinir(e) {
    e.preventDefault();
    if (!form.code || !form.password || !form.confirmPassword) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 12) {
      setErro('A nova senha deve ter no mínimo 12 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/v1/account/resetPassword', {
        email,
        code: form.code,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate('/login', { state: { senhaRedefinida: true } });
    } catch (err) {
      setErro(err.message || 'Código inválido ou expirado. Tente novamente.');
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

        {/* ── Etapa 1 ── */}
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

        {/* ── Etapa 2 ── */}
        {etapa === 2 && (
          <>
            <h1 className="auth-title">Redefinir senha</h1>
            <p className="auth-subtitle">
              Digite o código enviado para <strong>{email}</strong> e sua nova senha.
            </p>

            <form className="auth-form" onSubmit={handleRedefinir} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="code">Código de recuperação</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  className="auth-input"
                  placeholder="Digite o código recebido"
                  value={form.code}
                  onChange={handleFormChange}
                  autoComplete="one-time-code"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password">Nova senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="auth-input"
                  placeholder="Mínimo 12 caracteres"
                  value={form.password}
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

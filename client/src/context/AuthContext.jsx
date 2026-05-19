import { createContext } from 'react';
import { useConfigStore } from '../../store/configStore';
import { api } from '../../lib/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const { hydrated, token, usuario, setToken, setUsuario, clearAll } = useConfigStore();

  /**
   * Login real — POST /v1/account/login
   *
   * O backend espera: { email, password }
   * Retorna: { result: { success: true, accessToken: "..." }, mensagem: { msg: "100..." } }
   *
   * NOTA BACKEND: getToken({}) gera JWT com payload vazio.
   * Quando o backend incluir { email, nome } no payload, podemos
   * decodificar o token aqui para extrair os dados do usuário.
   */
  async function login(email, senha) {
    const response = await api.post('/v1/account/login', {
      email,
      password: senha, // backend usa "password", não "senha"
    });

    const accessToken = response.data?.result?.accessToken;
    if (!accessToken) throw new Error('Token não recebido do servidor.');

    setToken(accessToken);
    localStorage.removeItem('unitreino_guest_message_count');

    // Salva dados básicos do usuário (email do form) enquanto o backend
    // não retorna os dados completos no token JWT
    setUsuario({ email, nome: email.split('@')[0] });

    return accessToken;
  }

  function loginWithToken(accessToken, usuarioGoogle) {
    if (!accessToken) throw new Error('Token nao recebido do servidor.');

    setToken(accessToken);
    setUsuario(usuarioGoogle);
    localStorage.removeItem('unitreino_guest_message_count');

    return accessToken;
  }

  function logout() {
    clearAll();
  }

  return {
    user: usuario,
    hydrated,
    isLoggedIn: !!token,
    token,
    login,
    loginWithToken,
    logout,
  };
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import Home          from './pages/Home';
import Login         from './pages/Login';
import Cadastro      from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import NovoChat      from './pages/NovoChat';
import Chat          from './pages/Chat';
import Perfil        from './pages/Perfil';
import CrudTreino    from './pages/CrudTreino';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/cadastro"        element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/novo-chat"       element={<NovoChat />} />
            <Route path="/chat/:id"        element={<Chat />} />
            <Route path="/perfil"          element={<Perfil />} />
            <Route path="/crud-treino"     element={<CrudTreino />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

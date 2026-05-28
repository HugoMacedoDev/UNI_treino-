import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

function CrudLesoes() {
  const [lesoes, setLesoes] = useState([]);
  const [novaLesao, setNovaLesao] = useState({ nome: '', gravidade: 'Leve', descricao: '' });

  // 1. Carregar as lesões do back-end ao abrir a tela
  useEffect(() => {
    const fetchLesoes = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3000/v1/account/lesoes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setLesoes(data.lesoes || []);
        }
      } catch (err) {
        console.error("Erro ao buscar lesões", err);
      }
    };
    
    fetchLesoes();
  }, []);

  const handleChange = (e) => {
    setNovaLesao({ ...novaLesao, [e.target.name]: e.target.value });
  };

  // 2. Adicionar lesão no back-end
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Formatando como uma string única para salvar no array do Model Account
    const lesaoFormatada = `${novaLesao.nome} (${novaLesao.gravidade}) - ${novaLesao.descricao}`;

    try {
      const res = await fetch('http://localhost:3000/v1/account/lesoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lesao: lesaoFormatada })
      });
      const data = await res.json();
      
      if(data.success){
          setLesoes(data.lesoes); // Atualiza a tela com o array do servidor
          setNovaLesao({ nome: '', gravidade: 'Leve', descricao: '' }); // Limpa form
      }
    } catch (err) {
       console.error("Erro ao salvar", err);
    }
  };

  // 3. Deletar lesão no back-end
  const handleDelete = async (index) => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://localhost:3000/v1/account/lesoes/${index}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if(data.success){
          setLesoes(data.lesoes);
      }
    } catch (err) {
      console.error("Erro ao deletar", err);
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <main className="home-main" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <div className="home-content" style={{ maxWidth: '600px', width: '100%' }}>
          <h2 className="home-title">Gerenciar <span>Lesões</span></h2>
          <p className="home-subtitle">Cadastre restrições físicas para a IA do UNI-Treino adaptar os exercícios com segurança.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', marginBottom: '40px', textAlign: 'left' }}>
            <input 
              type="text" 
              name="nome" 
              value={novaLesao.nome}
              onChange={handleChange}
              placeholder="Nome da lesão (Ex: Tendinite no Ombro)" 
              required
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontFamily: 'var(--font-sans)' }}
            />
            
            <select 
              name="gravidade" 
              value={novaLesao.gravidade}
              onChange={handleChange}
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontFamily: 'var(--font-sans)', background: 'var(--bg-white)' }}
            >
              <option value="Leve">Leve</option>
              <option value="Moderada">Moderada</option>
              <option value="Grave">Grave</option>
            </select>

            <textarea 
              name="descricao" 
              value={novaLesao.descricao}
              onChange={handleChange}
              placeholder="Descreva as restrições de movimento..." 
              required
              rows="3"
              style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
            />
            
            <button type="submit" className="btn-start-chat" style={{ width: '100%' }}>Cadastrar Lesão</button>
          </form>

          <div style={{ width: '100%', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '15px', fontWeight: '600' }}>Suas Lesões</h3>
            
            {lesoes.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma lesão cadastrada no seu perfil.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lesoes.map((lesaoString, index) => (
                  <li key={index} style={{ padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{lesaoString}</span>
                    <button onClick={() => handleDelete(index)} style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>Remover</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CrudLesoes;
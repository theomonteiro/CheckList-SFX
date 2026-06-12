'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, LogOut, ShieldCheck } from 'lucide-react';

export default function Painel() {
  const router = useRouter();
  const [nomeMedico, setNomeMedico] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Busca o nome do médico logado
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.sucesso && data.medico) {
          setNomeMedico(data.medico.nome);
        }
      })
      .catch(console.error);

    // Verifica se o usuário logado é Administrador
    fetch('/api/admin/verificar')
      .then(res => res.json())
      .then(data => {
        if (data.isAdmin) {
          setIsAdmin(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }
        .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER */}
      <header
        className="w-full shadow-md relative overflow-hidden"
        style={{
          backgroundColor: '#212b54',
          backgroundImage: 'radial-gradient(circle at 90% 220%, #3a4a8a 0%, transparent 55%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/IBK_LOGOTIPO_white.png" alt="Instituto Buko Kaesemodel" width={160} height={40} />
          </div>
          
          <nav className="flex items-center gap-6">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-white font-medium text-sm hover:text-blue-300 transition-colors duration-200"
              >
                <ShieldCheck size={16} /> Painel Admin
              </Link>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-white font-medium text-sm hover:text-red-300 transition-colors duration-200"
            >
              Sair do Sistema <LogOut size={16} />
            </button>
          </nav>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          
          <div className="text-center mb-12 fade-in-up">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
              Olá, <span style={{ color: '#212b54' }}>{nomeMedico || 'Doutor(a)'}</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium">O que você deseja fazer agora?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Botão 1: Adicionar Paciente */}
            <button
              onClick={() => router.push('/adicionar-paciente')}
              className="group bg-white border-2 border-transparent hover:border-blue-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: '#212b54' }}
              >
                <UserPlus size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Novo Paciente</h2>
                <p className="text-gray-500 font-medium">Iniciar uma nova triagem do zero</p>
              </div>
            </button>

            {/* Botão 2: Ver Pacientes */}
            <button
              onClick={() => router.push('/exibir-pacientes')}
              className="group bg-white border-2 border-transparent hover:border-blue-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: '#1e8fa8' }} // Azul mais claro do gradiente
              >
                <Users size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Meus Pacientes</h2>
                <p className="text-gray-500 font-medium">Acessar prontuários e históricos</p>
              </div>
            </button>

          </div>

        </div>
      </main>
    </div>
  );
}
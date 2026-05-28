'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function Home() {
  const [message, setMessage] = useState<string | null>(null);

  const handleAdicionarPaciente = () => {
    setMessage('Acessando tela de Adição de Paciente...');
  };

  const handleExibirPacientes = () => {
    setMessage('Acessando tela de Exibição de Pacientes...');
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes fadeInForward {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(16px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .fade-in-forward {
          opacity: 0;
          animation: fadeInForward 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .delay-0   { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.35s; }
        .delay-400 { animation-delay: 0.6s; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="w-full shadow-md" style={{ backgroundColor: '#212b54' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="w-40 h-10 flex items-center">
            <Link href="/" className="w-40 h-10 flex items-center">
              <Image
                src="/IBK_LOGOTIPO_white.png" alt="Instituto Buko Kaesemodel" width={160} height={40}/>
            </Link>
          </div>

          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <button
                  onClick={() => router.push('/')}
                  className="text-white font-medium text-sm hover:text-blue-200 transition-colors duration-200 cursor-pointer"
                >
                  Início
                </button>
              </li>
              <li>
                <button className="text-white font-medium text-sm hover:text-blue-200 transition-colors duration-200 cursor-pointer">
                  Sair
                </button>
              </li>
            </ul>
          </nav>

        </div>
      </header>

      {/* ── ÁREA CENTRAL ── */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6">

        {/* Saudação */}
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight fade-in-forward delay-0">
          Olá, Dr. David
        </h1>

        {/* Subtítulo */}
        <p className="text-gray-500 text-lg fade-in-forward delay-200">
          O que deseja fazer hoje?
        </p>

        {/* Botões principais */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl fade-in-forward delay-400">

          <Link href={"/adicionar-paciente"}
            onClick={handleAdicionarPaciente}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-white text-xl font-semibold py-10 px-8 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: '#212b54' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a2243')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212b54')}
          >
            {/* Olha como o ícone fica simples agora: */}
            <UserPlus size={48} />
            Adicionar Paciente
          </Link>

          <Link href={"/exibir-pacientes"}
            onClick={handleExibirPacientes}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-white text-xl font-semibold py-10 px-8 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: '#212b54' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a2243')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212b54')}
          >
            {/* E o outro ícone aqui: */}
            <Users size={48} />
            Exibir Pacientes
          </Link>

        </div>

        {/* Feedback de interatividade */}
        {message && (
          <p className="font-medium text-base animate-pulse" style={{ color: '#212b54' }}>
            {message}
          </p>
        )}

      </main>

    </div>
  );
}
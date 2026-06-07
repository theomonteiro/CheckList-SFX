'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok && data.sucesso) {
        toast.success('Bem-vindo(a)!');
        router.push('/painel');
      } else {
        toast.error(data.erro || 'Falha ao autenticar.');
        setCarregando(false);
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f0f2f8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      {/* Lado Esquerdo - Painel Decorativo */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#212b54' }}
      >
        {/* Círculos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400 opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 fade-in" style={{ animationDelay: '0.1s' }}>
          <Image 
            src="/IBK_LOGOTIPO_white.png" 
            alt="Instituto Buko Kaesemodel" 
            width={220} 
            height={55} 
            className="mb-12"
          />
          <h1 className="text-4xl font-extrabold text-white leading-tight mt-8 mb-6">
            Plataforma de<br/>Rastreamento Clínico
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed opacity-90">
            Sistema de apoio à decisão médica para triagem e acompanhamento longitudinal da Síndrome do X Frágil.
          </p>
        </div>

        <div className="relative z-10 text-blue-200 text-sm font-medium fade-in" style={{ animationDelay: '0.2s' }}>
          &copy; {new Date().getFullYear()} Instituto Buko Kaesemodel. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 fade-in" style={{ animationDelay: '0.3s' }}>
          
          {/* Logo Mobile (Só aparece em telas menores) */}
          <div className="lg:hidden flex justify-center mb-8 bg-[#212b54] py-4 rounded-2xl">
            <Image 
              src="/IBK_LOGOTIPO_white.png" 
              alt="Instituto Buko Kaesemodel" 
              width={160} 
              height={40} 
            />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Bem-vindo(a)</h2>
            <p className="text-gray-500 font-medium">Acesse a sua conta para continuar.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Campo E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">E-mail Profissional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr@buko.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': '#212b54' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-gray-700">Senha</label>
                <a href="#" className="text-xs font-semibold hover:underline" style={{ color: '#212b54' }}>
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': '#212b54' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg mt-4 disabled:opacity-80"
              style={{ backgroundColor: '#212b54' }}
              onMouseEnter={(e) => { if (!carregando) e.currentTarget.style.backgroundColor = '#1a2243'; }}
              onMouseLeave={(e) => { if (!carregando) e.currentTarget.style.backgroundColor = '#212b54'; }}
            >
              {carregando ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
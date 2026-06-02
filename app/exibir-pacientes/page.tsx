'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Relatorio {
  id: number;
  score_final: number;
  is_suspeito: boolean;
}

interface Paciente {
  id: number;
  nome_completo: string;
  idade: number;
  genero: string;
  responsavel: string | null;
  created_at: string;
  relatorios: Relatorio[];
}

export default function ExibirPacientes() {
  const router = useRouter();
  const [lista, setLista] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await fetch('/api/pacientes');
        const data = await res.json();

        if (!res.ok || !data.sucesso) {
          setErro('Não foi possível carregar os pacientes.');
          return;
        }

        setLista(data.pacientes);
      } catch {
        setErro('Erro de conexão com o servidor.');
      } finally {
        setCarregando(false);
      }
    };

    fetchPacientes();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <header className="w-full shadow-md" style={{ backgroundColor: '#212b54' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="w-40 h-10 flex items-center">
            <Image src="/IBK_LOGOTIPO_white.png" alt="Instituto Buko Kaesemodel" width={160} height={40} />
          </Link>
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <button onClick={() => router.push('/')} className="text-white font-medium text-sm hover:text-blue-200 transition-colors duration-200 cursor-pointer">
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

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-5xl">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users size={28} style={{ color: '#212b54' }} />
              <h1 className="text-3xl font-bold" style={{ color: '#212b54' }}>
                Pacientes Cadastrados
              </h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>

          {/* Contador */}
          {!carregando && !erro && (
            <p className="text-gray-400 text-sm mb-6">
              {lista.length} paciente{lista.length !== 1 ? 's' : ''} encontrado{lista.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Carregando */}
          {carregando && <p className="text-gray-400 text-sm">A carregar pacientes...</p>}

          {/* Erro */}
          {erro && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-red-400 font-medium">{erro}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Lista vazia */}
          {!carregando && !erro && lista.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Users size={48} style={{ color: '#e5e7eb' }} />
              <p className="text-gray-400 text-base font-medium">Nenhum paciente cadastrado ainda.</p>
              <button
                onClick={() => router.push('/adicionar-paciente')}
                className="mt-2 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: '#212b54' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2243')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212b54')}
              >
                Adicionar primeiro paciente
              </button>
            </div>
          )}

          {/* Tabela */}
          {!carregando && !erro && lista.length > 0 && (
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: '#212b54' }}>
                    <th className="text-left text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 w-12">#</th>
                    <th className="text-left text-white text-xs font-semibold uppercase tracking-wider px-4 py-3">Nome</th>
                    <th className="text-left text-white text-xs font-semibold uppercase tracking-wider px-4 py-3 w-28">Idade</th>
                    <th className="text-left text-white text-xs font-semibold uppercase tracking-wider px-4 py-3 w-32">Género</th>
                    <th className="text-left text-white text-xs font-semibold uppercase tracking-wider px-4 py-3 w-24">Score</th>
                    <th className="text-right text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 w-48">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item, index) => {
                    const ultimoRelatorio = item.relatorios?.[0];
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-gray-50"
                      >
                        {/* # */}
                        <td className="px-6 py-4 text-gray-400 text-sm font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </td>

                        {/* Nome */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ backgroundColor: index % 2 === 0 ? '#212b54' : '#3b4f8a' }}
                            >
                              {item.nome_completo.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-800 font-medium text-sm whitespace-nowrap">
                              {item.nome_completo}
                            </span>
                          </div>
                        </td>

                        {/* Idade */}
                        <td className="px-4 py-4 text-gray-500 text-sm whitespace-nowrap">
                          {item.idade} anos
                        </td>

                        {/* Género */}
                        <td className="px-4 py-4 text-gray-500 text-sm whitespace-nowrap">
                          {item.genero}
                        </td>

                        {/* Score */}
                        <td className="px-4 py-4">
                          {ultimoRelatorio ? (
                            <span
                              className="text-sm font-bold"
                              style={{ color: ultimoRelatorio.is_suspeito ? '#dc2626' : '#16a34a' }}
                            >
                              {ultimoRelatorio.score_final.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => alert('Em breve: Visualização de relatório histórico!')}
                              className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                              style={{ backgroundColor: '#212b54' }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2243')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212b54')}
                            >
                              <FileText size={15} />
                              Ver Relatório
                            </button>
                            <button
                              onClick={() => alert('Em breve: Remoção de paciente via API.')}
                              title="Apagar paciente"
                              className="flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 cursor-pointer flex-shrink-0"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
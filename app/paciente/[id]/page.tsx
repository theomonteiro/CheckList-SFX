'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Activity, Calendar, FileText, 
  PlusCircle, AlertTriangle, CheckCircle2 
} from 'lucide-react';

interface Relatorio {
  id: number;
  score_final: number;
  is_suspeito: boolean;
  created_at: string;
}

interface Paciente {
  id: number;
  nome_completo: string;
  idade: number;
  genero: string;
  responsavel: string | null;
  relatorios: Relatorio[];
}

export default function Prontuario() {
  const router = useRouter();
  const params = useParams();
  
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        if (!params.id) return;
        const res = await fetch(`/api/pacientes/${params.id}`);
        const data = await res.json();
        
        if (data.sucesso && data.paciente) {
          setPaciente(data.paciente);
        } else {
          setErro('Paciente não encontrado no banco de dados.');
        }
      } catch (error) {
        setErro('Erro de conexão com o servidor.');
      } finally {
        setCarregando(false);
      }
    };

    fetchPaciente();
  }, [params.id]);

  if (carregando) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 font-medium">Carregando prontuário...</p></div>;
  }

  if (erro || !paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold">{erro || 'Erro desconhecido.'}</p>
        <button onClick={() => router.push('/exibir-pacientes')} className="text-white px-6 py-3 rounded-xl font-semibold" style={{ backgroundColor: '#212b54' }}>
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f8', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }
        
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(15px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* HEADER */}
      <header className="w-full shadow-md" style={{ backgroundColor: '#212b54' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/IBK_LOGOTIPO_white.png" alt="Instituto Buko Kaesemodel" width={145} height={36} />
          </Link>
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <button onClick={() => router.push('/exibir-pacientes')} className="text-white font-medium text-sm hover:text-blue-200 transition-colors">
                  Pacientes
                </button>
              </li>
              <li>
                <button className="text-white font-medium text-sm hover:text-blue-200 transition-colors">
                  Sair
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Breadcrumb e Título */}
        <div className="fade-up">
          <button 
            onClick={() => router.push('/exibir-pacientes')}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Voltar para Pacientes
          </button>
          <h1 className="text-3xl font-extrabold" style={{ color: '#212b54' }}>Prontuário Clínico</h1>
        </div>

        {/* Card do Paciente */}
        <div className="fade-up bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0 shadow-md"
              style={{ backgroundColor: '#212b54' }}
            >
              {paciente.nome_completo.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-800">{paciente.nome_completo}</h2>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><User size={16}/> {paciente.genero}</span>
                <span className="flex items-center gap-1.5"><Calendar size={16}/> {paciente.idade} anos</span>
              </div>
              {paciente.responsavel && (
                <p className="text-sm font-medium text-gray-400 mt-1">Responsável: {paciente.responsavel}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => router.push(`/adicionar-paciente?pacienteId=${paciente.id}`)}
            className="flex items-center gap-2 text-white px-6 py-4 rounded-xl font-bold shadow-md transition-all hover:scale-105"
            style={{ backgroundColor: '#212b54' }}
          >
            <PlusCircle size={20} />
            Fazer Nova Avaliação
          </button>
        </div>

        {/* Histórico Longitudinal */}
        <div className="fade-up flex flex-col gap-5 mt-2" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#212b54' }}>
            <Activity size={22} /> Histórico de Avaliações ({paciente.relatorios.length})
          </h3>

          {paciente.relatorios.length === 0 ? (
            <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
              <FileText size={48} className="text-gray-300" />
              <p className="text-gray-500 font-medium max-w-md">
                Este paciente ainda não possui nenhum relatório cadastrado. Clique no botão acima para iniciar a primeira avaliação.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paciente.relatorios.map((relatorio, index) => {
                const dataFormatada = new Date(relatorio.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div key={relatorio.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5">
                    <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data da Avaliação</p>
                        <p className="text-gray-800 font-semibold">{dataFormatada}</p>
                      </div>
                      
                      {/* Badge Visual */}
                      <div 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ 
                          backgroundColor: relatorio.is_suspeito ? '#fee2e2' : '#dcfce7',
                          color: relatorio.is_suspeito ? '#dc2626' : '#16a34a'
                        }}
                      >
                        {relatorio.is_suspeito ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
                        {relatorio.is_suspeito ? 'Risco Elevado' : 'Risco Baixo'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</span>
                        <span className="text-2xl font-extrabold" style={{ color: '#212b54' }}>
                          {relatorio.score_final.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => router.push(`/relatorio/${relatorio.id}`)}
                        className="flex items-center gap-2 border-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                        style={{ borderColor: '#212b54', color: '#212b54' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eef0f8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        Ver Gráficos
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
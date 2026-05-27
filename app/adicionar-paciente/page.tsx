'use client';

import { useState } from 'react';
import Image from 'next/image';

const SINTOMAS = [
  'Deficiência intelectual',
  'Face alongada/orelhas',
  'Macroorquidismo',
  'Hipermobilidade articular',
  'Dificuldades de aprendizagem',
  'Déficit de atenção',
  'Mov. repetitivos',
  'Atraso na fala',
  'Hiperatividade',
  'Evita contato visual',
  'Evita contato físico',
  'Agressividade',
];

type Respostas = Record<string, 'sim' | 'nao' | null>;

export default function AdicionarPaciente() {
  const [step, setStep] = useState<1 | 2>(1);

  // Passo 1 — dados básicos
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState('');
  const [responsavel, setResponsavel] = useState('');

  // Passo 2 — questionário
  const [respostas, setRespostas] = useState<Respostas>(
    Object.fromEntries(SINTOMAS.map((s) => [s, null]))
  );
  const [observacoes, setObservacoes] = useState('');

  const handleIrParaQuestionario = () => {
    if (!nome || !idade || !genero || !responsavel) {
      alert('Por favor, preencha todos os campos antes de continuar.');
      return;
    }
    setStep(2);
  };

  const handleResposta = (sintoma: string, valor: 'sim' | 'nao') => {
    setRespostas((prev) => ({ ...prev, [sintoma]: valor }));
  };

  const handleSalvar = () => {
    const dados = {
      paciente: { nome, idade: Number(idade), genero, responsavel },
      questionario: respostas,
      observacoes,
    };
    console.log('Relatório do Paciente:', dados);
    alert('Relatório Salvo no Console!');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className="w-full shadow-md" style={{ backgroundColor: '#212b54' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-40 h-10 flex items-center">
            <Image
              src="/IBK_LOGOTIPO_white.png"
              alt="Instituto Buko Kaesemodel"
              width={160}
              height={40}
            />
          </div>
          <nav>
            <ul className="flex items-center gap-6">
              {['Início', 'Sair'].map((item) => (
                <li key={item}>
                  <button className="text-white font-medium text-sm hover:text-blue-200 transition-colors duration-200 cursor-pointer">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-2xl">

          {/* Indicador de passo */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    backgroundColor: step >= n ? '#212b54' : '#e5e7eb',
                    color: step >= n ? '#fff' : '#9ca3af',
                  }}
                >
                  {n}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: step >= n ? '#212b54' : '#9ca3af' }}
                >
                  {n === 1 ? 'Dados Básicos' : 'Questionário'}
                </span>
                {n < 2 && (
                  <div
                    className="w-12 h-0.5 rounded transition-all duration-300"
                    style={{ backgroundColor: step > n ? '#212b54' : '#e5e7eb' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── PASSO 1: Dados Básicos ── */}
          {step === 1 && (
            <div className="fade-in-up bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
              <h2 className="text-2xl font-bold" style={{ color: '#212b54' }}>
                Dados do Paciente
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 transition"
                  style={{ '--tw-ring-color': '#212b54' } as React.CSSProperties}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Idade</label>
                <input
                  type="number"
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  placeholder="Ex: 8"
                  min={0}
                  max={120}
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none transition"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Gênero</label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none transition bg-white"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                >
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Responsável</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none transition"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>

              <button
                onClick={handleIrParaQuestionario}
                className="w-full text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer mt-2 text-lg"
                style={{ backgroundColor: '#212b54' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2243')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212b54')}
              >
                Ir para Questionário →
              </button>
            </div>
          )}

          {/* ── PASSO 2: Questionário ── */}
          {step === 2 && (
            <div className="fade-in-up flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: '#212b54' }}>
                  Questionário de Sintomas
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  ← Voltar
                </button>
              </div>

              <p className="text-gray-500 text-sm -mt-3">
                Paciente: <span className="font-semibold text-gray-700">{nome}</span> · {idade} anos
              </p>

              {/* Lista de sintomas */}
              <div className="flex flex-col gap-3">
                {SINTOMAS.map((sintoma, index) => (
                  <div
                    key={sintoma}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <span className="text-gray-700 font-medium text-sm">{sintoma}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResposta(sintoma, 'sim')}
                        className="w-16 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 cursor-pointer"
                        style={{
                          backgroundColor: respostas[sintoma] === 'sim' ? '#212b54' : 'transparent',
                          borderColor: '#212b54',
                          color: respostas[sintoma] === 'sim' ? '#fff' : '#212b54',
                        }}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => handleResposta(sintoma, 'nao')}
                        className="w-16 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 cursor-pointer"
                        style={{
                          backgroundColor: respostas[sintoma] === 'nao' ? '#6b7280' : 'transparent',
                          borderColor: '#6b7280',
                          color: respostas[sintoma] === 'nao' ? '#fff' : '#6b7280',
                        }}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Observações */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva observações adicionais sobre o paciente..."
                  rows={5}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 outline-none transition resize-none"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>

              {/* Botão salvar */}
              <button
                onClick={handleSalvar}
                className="w-full text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer text-lg mb-4"
                style={{ backgroundColor: '#212b54' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2243')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212b54')}
              >
                Salvar Relatório do Paciente
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
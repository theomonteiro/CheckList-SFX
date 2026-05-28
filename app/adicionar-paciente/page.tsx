'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Tipos ──────────────────────────────────────────────────────────────────
type Genero = 'Masculino' | 'Feminino';
type Resposta = 'sim' | 'nao' | null;
type Respostas = Record<string, Resposta>;

// ── Pesos por sintoma e género ─────────────────────────────────────────────
const PESOS: Record<string, { Masculino: number; Feminino: number }> = {
  'Deficiência intelectual':      { Masculino: 0.32, Feminino: 0.20 },
  'Face alongada/orelhas':        { Masculino: 0.29, Feminino: 0.09 },
  'Macroorquidismo':              { Masculino: 0.26, Feminino: 0.00 },
  'Hipermobilidade articular':    { Masculino: 0.19, Feminino: 0.04 },
  'Dificuldades de aprendizagem': { Masculino: 0.18, Feminino: 0.28 },
  'Déficit de atenção':           { Masculino: 0.17, Feminino: 0.12 },
  'Mov. repetitivos':             { Masculino: 0.17, Feminino: 0.05 },
  'Atraso na fala':               { Masculino: 0.14, Feminino: 0.01 },
  'Hiperatividade':               { Masculino: 0.12, Feminino: 0.04 },
  'Evita contato visual':         { Masculino: 0.06, Feminino: 0.08 },
  'Evita contato físico':         { Masculino: 0.04, Feminino: 0.07 },
  'Agressividade':                { Masculino: 0.01, Feminino: 0.02 },
};

const LIMITES: Record<Genero, number> = { Masculino: 0.56, Feminino: 0.55 };

const sintomasVisiveis = (genero: Genero) =>
  Object.keys(PESOS).filter(
    (s) => !(s === 'Macroorquidismo' && genero === 'Feminino')
  );

export default function AdicionarPaciente() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState<Genero | ''>('');
  const [responsavel, setResponsavel] = useState('');
  const [respostas, setRespostas] = useState<Respostas>({});
  const [observacoes, setObservacoes] = useState('');

  // Pré-preenche se vier do relatório
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pacienteAtual');
      if (!raw) return;
      const dados = JSON.parse(raw);
      if (dados?.paciente?.nome) {
        setNome(dados.paciente.nome);
        setIdade(String(dados.paciente.idade));
        setGenero(dados.paciente.genero);
        setResponsavel(dados.paciente.responsavel);
        setStep(2);
      }
    } catch { /* ignora */ }
  }, []);

  // Reinicia respostas ao mudar género
  useEffect(() => {
    if (!genero) return;
    const init: Respostas = {};
    sintomasVisiveis(genero as Genero).forEach((s) => { init[s] = null; });
    setRespostas(init);
  }, [genero]);

  const handleAvancar = () => {
    if (!nome.trim() || !idade || !genero || !responsavel.trim()) {
      alert('Por favor, preencha todos os campos antes de continuar.');
      return;
    }
    setStep(2);
  };

  const handleResposta = (sintoma: string, valor: Resposta) => {
    setRespostas((prev) => ({ ...prev, [sintoma]: valor }));
  };

  const handleConcluir = () => {
    const g = genero as Genero;
    const sintomas = sintomasVisiveis(g);

    const semResposta = sintomas.filter((s) => respostas[s] === null);
    if (semResposta.length > 0) {
      alert(`Responda todos os sintomas antes de concluir.\nFaltam: ${semResposta.join(', ')}`);
      return;
    }

    const score = sintomas.reduce((acc, s) => {
      return respostas[s] === 'sim' ? acc + PESOS[s][g] : acc;
    }, 0);

    const isSuspeito = score >= LIMITES[g];

    const payload = {
      paciente: {
        nome: nome.trim(),
        idade: Number(idade),
        genero: g,
        responsavel: responsavel.trim(),
      },
      questionario: respostas,
      observacoes,
      score: parseFloat(score.toFixed(4)),
      isSuspeito,
    };

    try {
      localStorage.setItem('pacienteAtual', JSON.stringify(payload));
    } catch {
      alert('Não foi possível salvar os dados.');
      return;
    }

    router.push('/relatorio');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* HEADER */}
      <header className="w-full shadow-md" style={{ backgroundColor: '#212b54' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="w-40 h-10 flex items-center">
            <Image src="/IBK_LOGOTIPO_white.png" alt="Instituto Buko Kaesemodel" width={160} height={40} />
          </Link>
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <Link href="/" className="text-white font-medium text-sm hover:text-blue-200 transition-colors duration-200">
                  Início
                </Link>
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

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-2xl">

          {/* Indicador de passos */}
          <div className="flex items-center gap-3 mb-8">
            {([1, 2] as const).map((n) => (
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
                <span className="text-sm font-medium" style={{ color: step >= n ? '#212b54' : '#9ca3af' }}>
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

          {/* PASSO 1 */}
          {step === 1 && (
            <div className="fade-in-up bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
              <h2 className="text-2xl font-bold" style={{ color: '#212b54' }}>
                Dados do Paciente
              </h2>

              {([
                { label: 'Nome Completo', value: nome, setter: setNome, type: 'text', placeholder: 'Ex: João da Silva' },
                { label: 'Idade', value: idade, setter: (v: string) => setIdade(v), type: 'number', placeholder: 'Ex: 8' },
                { label: 'Responsável', value: responsavel, setter: setResponsavel, type: 'text', placeholder: 'Ex: Maria da Silva' },
              ] as { label: string; value: string; setter: (v: string) => void; type: string; placeholder: string }[]).map(
                ({ label, value, setter, type, placeholder }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      min={type === 'number' ? 0 : undefined}
                      max={type === 'number' ? 120 : undefined}
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none transition"
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                    />
                  </div>
                )
              )}

              {/* Género */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Género</label>
                <div className="flex gap-3">
                  {(['Masculino', 'Feminino'] as Genero[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenero(g)}
                      className="flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: genero === g ? '#212b54' : 'transparent',
                        borderColor: '#212b54',
                        color: genero === g ? '#fff' : '#212b54',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAvancar}
                className="w-full text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer mt-2 text-lg"
                style={{ backgroundColor: '#212b54' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2243')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212b54')}
              >
                Ir para Questionário →
              </button>
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && genero && (
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
                Paciente: <span className="font-semibold text-gray-700">{nome}</span> · {idade} anos · {genero}
              </p>

              <div className="flex flex-col gap-3">
                {sintomasVisiveis(genero as Genero).map((sintoma) => (
                  <div
                    key={sintoma}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
                  >
                    <span className="text-gray-700 font-medium text-sm">{sintoma}</span>
                    <div className="flex gap-2">
                      {(['sim', 'nao'] as const).map((val) => (
                        <button
                          key={val}
                          onClick={() => handleResposta(sintoma, val)}
                          className="w-16 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 cursor-pointer"
                          style={{
                            backgroundColor:
                              respostas[sintoma] === val
                                ? val === 'sim' ? '#212b54' : '#6b7280'
                                : 'transparent',
                            borderColor: val === 'sim' ? '#212b54' : '#6b7280',
                            color:
                              respostas[sintoma] === val
                                ? '#fff'
                                : val === 'sim' ? '#212b54' : '#6b7280',
                          }}
                        >
                          {val === 'sim' ? 'Sim' : 'Não'}
                        </button>
                      ))}
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
                  rows={4}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 outline-none transition resize-none"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#212b54')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>

              <button
                onClick={handleConcluir}
                className="w-full text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer text-lg mb-4"
                style={{ backgroundColor: '#212b54' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2243')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212b54')}
              >
                Concluir Questionário →
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
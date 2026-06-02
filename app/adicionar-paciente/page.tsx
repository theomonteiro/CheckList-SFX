'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Genero = 'Masculino' | 'Feminino';
type Resposta = 'sim' | 'nao' | null;
type Respostas = Record<string, Resposta>;

const SINTOMAS_MASC = [
  'Deficiência intelectual', 'Face alongada/orelhas', 'Macroorquidismo',
  'Hipermobilidade articular', 'Dificuldades de aprendizagem', 'Déficit de atenção',
  'Mov. repetitivos', 'Atraso na fala', 'Hiperatividade',
  'Evita contato visual', 'Evita contato físico', 'Agressividade',
];
const SINTOMAS_FEM = SINTOMAS_MASC.filter((s) => s !== 'Macroorquidismo');

const sintomasVisiveis = (genero: Genero) =>
  genero === 'Masculino' ? SINTOMAS_MASC : SINTOMAS_FEM;

function FormularioPaciente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteIdUrl = searchParams.get('pacienteId');

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [isPacienteExistente, setIsPacienteExistente] = useState(false);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState<Genero | ''>('');
  const [responsavel, setResponsavel] = useState('');
  const [respostas, setRespostas] = useState<Respostas>({});
  const [observacoes, setObservacoes] = useState('');

  // Busca os dados se o paciente já existir
  useEffect(() => {
    if (pacienteIdUrl) {
      fetch(`/api/pacientes/${pacienteIdUrl}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.sucesso && data.paciente) {
            setNome(data.paciente.nome_completo);
            setIdade(String(data.paciente.idade));
            setGenero(data.paciente.genero as Genero);
            setResponsavel(data.paciente.responsavel || '');
            setIsPacienteExistente(true);
          }
        })
        .catch(console.error);
    }
  }, [pacienteIdUrl]);

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

  const handleConcluir = async () => {
    const g = genero as Genero;
    const sintomas = sintomasVisiveis(g);

    const semResposta = sintomas.filter((s) => respostas[s] === null);
    if (semResposta.length > 0) {
      alert(`Responda todos os sintomas antes de concluir.\nFaltam: ${semResposta.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/calcular-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: isPacienteExistente ? pacienteIdUrl : undefined,
          paciente: {
            nome: nome.trim(),
            idade: Number(idade),
            genero: g,
            responsavel: responsavel.trim(),
          },
          questionario: respostas,
          observacoes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        alert('Erro ao salvar os dados. Tente novamente.');
        setLoading(false);
        return;
      }

      router.push('/relatorio/' + data.relatorioId);

    } catch {
      alert('Erro de conexão com o servidor.');
      setLoading(false);
    }
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
              
              {isPacienteExistente && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-xl font-medium">
                  Informação: Adicionando um novo relatório para o histórico de <strong>{nome}</strong>.
                </div>
              )}

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
                      readOnly={isPacienteExistente}
                      min={type === 'number' ? 0 : undefined}
                      max={type === 'number' ? 120 : undefined}
                      className={`border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none transition ${isPacienteExistente ? 'bg-gray-100 opacity-80 cursor-not-allowed' : ''}`}
                      onFocus={(e) => { if (!isPacienteExistente) e.currentTarget.style.borderColor = '#212b54'; }}
                      onBlur={(e) => { if (!isPacienteExistente) e.currentTarget.style.borderColor = '#d1d5db'; }}
                    />
                  </div>
                )
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Género</label>
                <div className="flex gap-3">
                  {(['Masculino', 'Feminino'] as Genero[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => !isPacienteExistente && setGenero(g)}
                      disabled={isPacienteExistente}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all duration-150 ${isPacienteExistente ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                      style={{
                        backgroundColor: genero === g ? '#212b54' : (isPacienteExistente ? '#f3f4f6' : 'transparent'),
                        borderColor: genero === g ? '#212b54' : '#e5e7eb',
                        color: genero === g ? '#fff' : '#6b7280',
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
                <h2 className="text-2xl font-bold" style={{ color: '#212b54' }}>Questionário de Sintomas</h2>
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
                disabled={loading}
                className="w-full text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer text-lg mb-4 flex items-center justify-center gap-3 disabled:opacity-70"
                style={{ backgroundColor: '#212b54' }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1a2243'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#212b54'; }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Concluir Questionário →'
                )}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// O Next.js requer Suspense no boundary quando utilizamos o hook useSearchParams
export default function AdicionarPaciente() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Carregando...</p></div>}>
      <FormularioPaciente />
    </Suspense>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, RotateCcw, Save, LogOut, Printer
} from 'lucide-react';
import toast from 'react-hot-toast'; 

type Genero = 'Masculino' | 'Feminino';
type Resposta = 'sim' | 'nao' | null;

interface DadosPaciente {
  pacienteId: number;
  paciente: { nome: string; idade: number; genero: Genero; responsavel: string };
  questionario: Record<string, Resposta>;
  observacoes: string;
  score: number;
  isSuspeito: boolean;
}

// ── Pesos (para o gráfico de pizza) ──────────────────────────────────────
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

// Paleta de cores para as fatias do gráfico
const PALETTE = [
  '#212b54','#2e3f78','#3b509a','#1a6b8a','#1e8fa8','#22b0c8',
  '#26c9e0','#4dd4ec','#80e3f2','#aaedf7','#c8f4fb','#e0fafd',
];

// ── Componente SVG Donut (gauge do score) ────────────────────────────────
function ScoreGauge({ score, isSuspeito, limiar }: { score: number; isSuspeito: boolean; limiar: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const strokeW = 16;
  const maxScore = 1.5;
  const pct = Math.min(score / maxScore, 1);
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - (animated ? pct : 0));
  const color = isSuspeito ? '#dc2626' : '#16a34a';
  const trackColor = isSuspeito ? '#fee2e2' : '#dcfce7';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeW} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 32, fontWeight: 800, fill: color, fontFamily: 'Sora, sans-serif' }}>
        {score.toFixed(2)}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle"
        style={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'Sora, sans-serif', fontWeight: 500 }}>
        limiar {limiar.toFixed(2)}
      </text>
    </svg>
  );
}

// ── Componente SVG Pie Chart ─────────────────────────────────────────────
function PieChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 82;
  const innerR = 48;

  let cumAngle = -Math.PI / 2;
  const paths = slices.map((sl) => {
    const angle = (sl.value / total) * 2 * Math.PI * (animated ? 1 : 0);
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const ix1 = cx + innerR * Math.cos(cumAngle);
    const iy1 = cy + innerR * Math.sin(cumAngle);
    const ix2 = cx + innerR * Math.cos(cumAngle + angle);
    const iy2 = cy + innerR * Math.sin(cumAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    const slice = { ...sl, d };
    cumAngle += (sl.value / total) * 2 * Math.PI;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transition: 'all 0.6s', overflow: 'hidden' }}>
      {paths.map((sl, i) => (
        <path key={i} d={sl.d} fill={sl.color}
          style={{ transition: `all 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s` }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle"
        style={{ fontSize: 13, fontWeight: 700, fill: '#212b54', fontFamily: 'Sora, sans-serif' }}>
        Sintomas
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle"
        style={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'Sora, sans-serif' }}>
        positivos
      </text>
    </svg>
  );
}

// ── Página Principal ─────────────────────────────────────────────────────
export default function Relatorio() {
  const router = useRouter();
  const params = useParams(); 
  
  const [dados, setDados] = useState<DadosPaciente | null>(null);
  const [mostrarRespostas, setMostrarRespostas] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    toast.success('Você saiu do sistema.');
    router.push('/');
  };

  useEffect(() => {
    const fetchDadosDoBanco = async () => {
      try {
        if (!params.id) return;
        
        const res = await fetch(`/api/relatorios/${params.id}`);
        const data = await res.json();
        
        if (data.sucesso && data.relatorio) {
          const r = data.relatorio;
          
          const questionarioFormatado: Record<string, Resposta> = {};
          r.respostas.forEach((resp: any) => {
             questionarioFormatado[resp.sintoma_nome] = resp.resposta ? 'sim' : 'nao';
          });

          setDados({
            pacienteId: r.paciente.id,
            paciente: {
              nome: r.paciente.nome_completo,
              idade: r.paciente.idade,
              genero: r.paciente.genero as Genero,
              responsavel: r.paciente.responsavel || ''
            },
            questionario: questionarioFormatado,
            observacoes: r.observacoes || '',
            score: r.score_final,
            isSuspeito: r.is_suspeito
          });
        }
      } catch (error) {
        toast.error('Erro ao buscar dados do servidor');
      } finally {
        setCarregando(false);
      }
    };

    fetchDadosDoBanco();
  }, [params.id]);

  if (carregando) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">A carregar dados do banco...</p></div>;
  }
  if (!dados) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Nenhum relatório encontrado.</p>
        <button onClick={() => router.push('/painel')} className="text-white px-6 py-3 rounded-xl font-semibold" style={{ backgroundColor: '#212b54' }}>
          Voltar ao Painel
        </button>
      </div>
    );
  }

  const { paciente, questionario, observacoes, score, isSuspeito } = dados;
  const limiar = paciente.genero === 'Masculino' ? 0.56 : 0.55;

  const slices = Object.entries(questionario)
    .filter(([, v]) => v === 'sim')
    .map(([sintoma], i) => ({
      label: sintoma,
      value: PESOS[sintoma]?.[paciente.genero] ?? 0,
      color: PALETTE[i % PALETTE.length],
    }))
    .filter((s) => s.value > 0);

  const sintomas = Object.keys(questionario);
  const simCount = Object.values(questionario).filter((v) => v === 'sim').length;

  return (
    <div className="print-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f0f2f8', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .rel { font-family: 'Sora', sans-serif; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .d1{animation-delay:.05s} .d2{animation-delay:.12s} .d3{animation-delay:.2s}
        .d4{animation-delay:.28s} .d5{animation-delay:.36s} .d6{animation-delay:.44s}

        .card {
          background:#fff;
          border-radius:20px;
          box-shadow:0 1px 3px rgba(33,43,84,.05), 0 6px 20px rgba(33,43,84,.07);
        }
        .section-label {
          font-size:10px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:#9ca3af; margin-bottom:14px;
          font-family:'Sora',sans-serif;
        }
        .meta-label { font-size:11px; color:#9ca3af; font-weight:500; margin:0 0 2px; }
        .meta-value { font-size:15px; color:#1f2937; font-weight:600; margin:0; }

        .pill-sim { display:inline-block; background:#212b54; color:#fff; font-size:11px; font-weight:700; padding:3px 12px; border-radius:999px; }
        .pill-nao { display:inline-block; background:#e9eaf0; color:#6b7280; font-size:11px; font-weight:700; padding:3px 12px; border-radius:999px; }

        .expand-btn {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:16px 24px; background:#fff; border:none; cursor:pointer;
          border-radius:20px;
          box-shadow:0 1px 3px rgba(33,43,84,.05), 0 6px 20px rgba(33,43,84,.07);
          transition:background .15s; font-family:'Sora',sans-serif;
        }
        .expand-btn:hover { background:#f8f9fd; }
        .expand-btn.open  { border-radius:20px 20px 0 0; }

        .resp-panel {
          background:#fff; border-radius:0 0 20px 20px; overflow:hidden;
          box-shadow:0 6px 20px rgba(33,43,84,.07); border-top:1px solid #f3f4f6;
        }
        .resp-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:11px 24px; border-bottom:1px solid #f3f4f6; font-size:14px; color:#374151;
          font-family:'Sora',sans-serif;
        }
        .resp-row:last-child { border-bottom:none; }
        .resp-row:nth-child(even) { background:#fafbfc; }

        .btn-solid {
          display:flex; align-items:center; justify-content:center; gap:10px;
          padding:15px 24px; border-radius:14px; border:none; cursor:pointer;
          font-size:15px; font-weight:600; color:#fff; font-family:'Sora',sans-serif;
          background:#212b54; transition:background .15s, transform .1s;
          box-shadow:0 2px 8px rgba(33,43,84,.2);
        }
        .btn-solid:hover  { background:#1a2243; }
        .btn-solid:active { transform:scale(.98); }

        .btn-outline {
          display:flex; align-items:center; justify-content:center; gap:10px;
          padding:15px 24px; border-radius:14px; cursor:pointer;
          font-size:15px; font-weight:600; color:#212b54; font-family:'Sora',sans-serif;
          background:transparent; border:2px solid #212b54;
          transition:background .15s, transform .1s;
        }
        .btn-outline:hover  { background:#eef0f8; }
        .btn-outline:active { transform:scale(.98); }

        .legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }

        @media (max-width: 768px) {
          .responsive-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          main.rel {
            padding: 24px 16px 40px !important;
          }
        }

        /* --- LAYOUT DE IMPRESSÃO DEDICADO --- */
        .print-document { display: none; }

        @media print {
          @page { size: A4 portrait; margin: 14mm 16mm 14mm 16mm; }

          /* Oculta todo o conteúdo de tela */
          .screen-content,
          header.no-print,
          .print-header-old { display: none !important; }

          /* Mostra apenas o documento de impressão */
          .print-wrapper { background: #fff !important; min-height: auto !important; }
          .print-document {
            display: block !important;
            font-family: 'Sora', 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            color: #1a1a1a;
            line-height: 1.5;
          }

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;

          /* Tipografia do documento */
          .pd-h1 { font-size: 20pt; font-weight: 800; color: #212b54; margin: 0; }
          .pd-h2 { font-size: 7.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px; }
          .pd-label { font-size: 8pt; color: #9ca3af; font-weight: 500; margin: 0 0 2px; }
          .pd-value { font-size: 10pt; color: #1f2937; font-weight: 600; margin: 0; }

          /* Seções do documento */
          .pd-section { margin-bottom: 14px; page-break-inside: avoid; break-inside: avoid; }
          .pd-divider { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }

          /* Tabela de sintomas */
          .pd-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
          .pd-table th { 
            background: #212b54; color: #fff; padding: 5px 10px; 
            text-align: left; font-weight: 600; font-size: 8pt;
          }
          .pd-table td { padding: 5px 10px; border-bottom: 1px solid #f3f4f6; }
          .pd-table tr:nth-child(even) td { background: #f9fafb; }

          /* Badge sim/nao */
          .pd-sim { background: #212b54; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: 700; }
          .pd-nao { background: #e9eaf0; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: 700; }

          /* Alerta diagnóstico */
          .pd-alert-high { background: #fff4f2; border: 1.5px solid #fca5a5; border-radius: 6px; padding: 10px 14px; }
          .pd-alert-low  { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 10px 14px; }

          /* Barra de score CSS */
          .pd-score-track { background: #e5e7eb; border-radius: 4px; height: 8px; width: 100%; }
          .pd-score-fill  { height: 8px; border-radius: 4px; }

          /* Grid de 2 colunas */
          .pd-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .pd-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

          /* Caixa de campo */
          .pd-field { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
          .pd-field:last-child { border-bottom: none; }

          /* Rodapé */
          .pd-footer { 
            margin-top: 16px; padding-top: 8px; 
            border-top: 1px solid #e5e7eb;
            display: flex; justify-content: space-between;
            font-size: 8pt; color: #9ca3af;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          DOCUMENTO DE IMPRESSÃO (oculto na tela)
          ══════════════════════════════════════════ */}
      <div className="print-document">

        {/* Cabeçalho */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom:10, borderBottom:'2.5px solid #212b54', marginBottom:16 }}>
          <div>
            <p style={{ margin:'0 0 2px', fontSize:'8pt', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#9ca3af' }}>Instituto Buko Kaesemodel</p>
            <p className="pd-h1">Relatório Clínico</p>
            <p style={{ margin:'4px 0 0', fontSize:'8.5pt', color:'#6b7280' }}>Rastreamento — Síndrome do X Frágil</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ margin:0, fontSize:'8pt', color:'#9ca3af' }}>Data de emissão</p>
            <p style={{ margin:0, fontSize:'10pt', fontWeight:600, color:'#212b54' }}>
              {new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
            </p>
          </div>
        </div>

        {/* Seção 1 — Dados do Paciente + Score */}
        <div className="pd-section pd-grid-2">

          {/* Paciente */}
          <div style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'12px 14px' }}>
            <p className="pd-h2">Dados do Paciente</p>
            <div className="pd-field">
              <p className="pd-label">Nome completo</p>
              <p className="pd-value">{paciente.nome}</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div className="pd-field">
                <p className="pd-label">Idade</p>
                <p className="pd-value">{paciente.idade} anos</p>
              </div>
              <div className="pd-field">
                <p className="pd-label">Género</p>
                <p className="pd-value">{paciente.genero}</p>
              </div>
            </div>
            <div className="pd-field">
              <p className="pd-label">Responsável</p>
              <p className="pd-value">{paciente.responsavel || '—'}</p>
            </div>
            {observacoes.trim() && (
              <div className="pd-field">
                <p className="pd-label">Observações</p>
                <p style={{ margin:0, fontSize:'9pt', color:'#374151', lineHeight:1.5 }}>{observacoes}</p>
              </div>
            )}
          </div>

          {/* Score */}
          <div style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            <p className="pd-h2">Score de Risco</p>

            {/* Número grande */}
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span style={{ fontSize:'32pt', fontWeight:800, lineHeight:1, color: isSuspeito ? '#dc2626' : '#16a34a' }}>
                {score.toFixed(2)}
              </span>
              <span style={{ fontSize:'9pt', color:'#9ca3af' }}>/ 1.50</span>
            </div>

            {/* Barra de progresso */}
            <div>
              <div className="pd-score-track">
                <div className="pd-score-fill" style={{ width:`${Math.min((score/1.5)*100,100)}%`, backgroundColor: isSuspeito ? '#dc2626' : '#16a34a' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                <span style={{ fontSize:'7.5pt', color:'#9ca3af' }}>0.00</span>
                <span style={{ fontSize:'7.5pt', color:'#9ca3af' }}>Limiar: {limiar.toFixed(2)}</span>
                <span style={{ fontSize:'7.5pt', color:'#9ca3af' }}>1.50</span>
              </div>
            </div>

            {/* Status */}
            <p style={{ margin:0, fontSize:'9.5pt', fontWeight:700, color: isSuspeito ? '#dc2626' : '#16a34a' }}>
              {isSuspeito ? '⚠ Score acima do limiar' : '✓ Score abaixo do limiar'}
            </p>
            <p style={{ margin:0, fontSize:'8.5pt', color:'#6b7280' }}>
              {simCount} de {sintomas.length} sintomas positivos
            </p>
          </div>
        </div>

        {/* Seção 2 — Diagnóstico */}
        <div className="pd-section">
          <p className="pd-h2">Conclusão Diagnóstica</p>
          <div className={isSuspeito ? 'pd-alert-high' : 'pd-alert-low'}>
            <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:'10pt', color: isSuspeito ? '#991b1b' : '#15803d' }}>
              {isSuspeito ? 'Risco Elevado — Recomendado Teste Genético' : 'Baixa Probabilidade de Síndrome do X Frágil'}
            </p>
            <p style={{ margin:0, fontSize:'9pt', color: isSuspeito ? '#b91c1c' : '#166534', lineHeight:1.5 }}>
              {isSuspeito
                ? 'O score calculado sugere alta probabilidade da síndrome. Recomenda-se encaminhamento para avaliação genética especializada.'
                : 'O score calculado está abaixo do limiar de suspeita clínica para este género. Acompanhamento de rotina recomendado.'}
            </p>
          </div>
        </div>

        {/* Seção 3 — Questionário completo + Contribuições */}
        <div className="pd-section pd-grid-2" style={{ alignItems:'start' }}>

          {/* Tabela de sintomas */}
          <div>
            <p className="pd-h2">Questionário de Sintomas</p>
            <table className="pd-table">
              <thead>
                <tr>
                  <th style={{ width:'75%' }}>Sintoma</th>
                  <th style={{ textAlign:'center' }}>Resposta</th>
                </tr>
              </thead>
              <tbody>
                {sintomas.map((s) => (
                  <tr key={s}>
                    <td>{s}</td>
                    <td style={{ textAlign:'center' }}>
                      <span className={questionario[s] === 'sim' ? 'pd-sim' : 'pd-nao'}>
                        {questionario[s] === 'sim' ? 'Sim' : 'Não'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contribuições dos positivos */}
          <div>
            <p className="pd-h2">Contribuição dos Sintomas Positivos</p>
            {slices.length === 0 ? (
              <p style={{ fontSize:'9pt', color:'#9ca3af' }}>Nenhum sintoma positivo registado.</p>
            ) : (
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>Sintoma</th>
                    <th style={{ textAlign:'right' }}>Contribuição</th>
                  </tr>
                </thead>
                <tbody>
                  {slices.map((sl, i) => {
                    const total = slices.reduce((s, x) => s + x.value, 0);
                    const pct = total > 0 ? ((sl.value / total) * 100).toFixed(1) : '0';
                    return (
                      <tr key={i}>
                        <td style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:8, height:8, borderRadius:2, backgroundColor:sl.color, display:'inline-block', flexShrink:0 }} />
                          {sl.label}
                        </td>
                        <td style={{ textAlign:'right', fontWeight:700, color:'#212b54' }}>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="pd-footer">
          <span>Instituto Buko Kaesemodel — Sistema IBK de Rastreamento</span>
          <span>Documento gerado automaticamente. Não substitui avaliação clínica especializada.</span>
        </div>

      </div>
      {/* ══ FIM DO DOCUMENTO DE IMPRESSÃO ══ */}

      {/* Conteúdo de tela (oculto na impressão) */}
      <div className="screen-content" style={{ display:'contents' }}>

      {/* HEADER - Com no-print */}
      <header className="rel no-print" style={{ backgroundColor:'#212b54', boxShadow:'0 2px 16px rgba(33,43,84,.25)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 32px', display:'flex', alignItems:'center', justifyItems:'center', justifyContent:'space-between' }}>
          <Link href="/painel" style={{ display:'flex', alignItems:'center' }}>
            <Image src="/IBK_LOGOTIPO_white.png" alt="Instituto Buko Kaesemodel" width={145} height={36} />
          </Link>
          <nav style={{ display:'flex', gap:28 }}>
            <Link href="/painel" style={{ color:'#fff', fontSize:13, fontWeight:500, textDecoration:'none', opacity:.85 }}>Painel</Link>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', color:'#fff', fontSize:13, fontWeight:500, background:'none', border:'none', cursor:'pointer', opacity:.85, fontFamily:'Sora,sans-serif' }}>
              <LogOut size={14}/> Sair
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="rel" style={{ flex:1, padding:'36px 32px 56px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Título */}
          <div className="fu d1">
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#9ca3af', margin:'0 0 4px', fontFamily:'Sora,sans-serif' }}>
              Síndrome do X Frágil
            </p>
            <h1 style={{ fontSize:32, fontWeight:800, color:'#212b54', margin:0, fontFamily:'Sora,sans-serif' }}>
              Relatório Clínico
            </h1>
          </div>

          {/* ── LINHA 1: Paciente (esq) + Score (dir) ── */}
          <div className="fu d2 responsive-grid grid-print" style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>

            {/* Paciente */}
            <div className="card" style={{ padding:28 }}>
              <p className="section-label">Informações do Paciente</p>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:22 }}>
                <div style={{ width:60, height:60, borderRadius:16, backgroundColor:'#212b54', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {paciente.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:20, fontWeight:700, color:'#1f2937', margin:'0 0 3px', fontFamily:'Sora,sans-serif' }}>{paciente.nome}</p>
                  <p style={{ fontSize:13, color:'#9ca3af', margin:0, fontFamily:'Sora,sans-serif' }}>{paciente.genero} · {paciente.idade} anos</p>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px 32px' }}>
                <div>
                  <p className="meta-label">Responsável</p>
                  <p className="meta-value">{paciente.responsavel}</p>
                </div>
              </div>

              {observacoes.trim() && (
                <>
                  <div style={{ borderTop:'1px solid #f3f4f6', margin:'20px 0 16px' }} />
                  <p className="meta-label">Observações</p>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.6, margin:0, fontFamily:'Sora,sans-serif', whiteSpace:'pre-wrap' }}>{observacoes}</p>
                </>
              )}
            </div>

            {/* Score */}
            <div className="card" style={{ padding:28, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
              <p className="section-label" style={{ alignSelf:'flex-start' }}>Score de Risco</p>
              <ScoreGauge score={score} isSuspeito={isSuspeito} limiar={limiar} />
              <p style={{ fontSize:13, fontWeight:700, color: isSuspeito ? '#dc2626' : '#16a34a', margin:'4px 0 0', textAlign:'center', fontFamily:'Sora,sans-serif' }}>
                {isSuspeito ? '⚠ Score acima do limiar' : '✓ Score abaixo do limiar'}
              </p>
              <p style={{ fontSize:12, color:'#9ca3af', margin:0, fontFamily:'Sora,sans-serif' }}>
                {simCount} de {sintomas.length} sintomas positivos
              </p>
            </div>
          </div>

          {/* ── LINHA 2: Gráfico de Pizza (esq) + Alerta (dir) ── */}
          <div className="fu d3 responsive-grid grid-print" style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>

            {/* Gráfico de pizza */}
            <div className="card" style={{ padding:28 }}>
              <p className="section-label">Contribuição dos Sintomas Positivos</p>
              {slices.length === 0 ? (
                <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'Sora,sans-serif' }}>Nenhum sintoma positivo registado.</p>
              ) : (
                /* Adicionada a classe pie-flex-print aqui para soltar a legenda no PDF */
                <div className="pie-flex-print" style={{ display:'flex', alignItems:'center', gap:24 }}>
                  <div style={{ flexShrink:0, display: 'flex', justifyContent: 'center' }}>
                    <PieChart slices={slices} />
                  </div>
                  <div className="scroll-print-fix" style={{ flex:1, display:'flex', flexDirection:'column', gap:8, overflowY:'auto', maxHeight:220 }}>
                    {slices.map((sl, i) => {
                      const total = slices.reduce((s, x) => s + x.value, 0);
                      const pct = total > 0 ? ((sl.value / total) * 100).toFixed(1) : '0';
                      return (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="legend-dot" style={{ backgroundColor: sl.color }} />
                          <span style={{ fontSize:12, color:'#374151', fontFamily:'Sora,sans-serif', flex:1, lineHeight:1.3 }}>{sl.label}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:'#212b54', fontFamily:'Sora,sans-serif', flexShrink:0 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Alerta */}
            <div style={{ borderRadius:20, padding:'24px 22px', display:'flex', flexDirection:'column', gap:12, backgroundColor: isSuspeito ? '#fff4f2' : '#f0fdf4', border:`2px solid ${isSuspeito ? '#fca5a5' : '#86efac'}`, boxShadow:`0 4px 16px ${isSuspeito ? 'rgba(220,38,38,.08)' : 'rgba(22,163,74,.08)'}` }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                {isSuspeito ? <AlertTriangle size={26} style={{ color:'#dc2626', flexShrink:0, marginTop:2 }} /> : <CheckCircle2 size={26} style={{ color:'#16a34a', flexShrink:0, marginTop:2 }} />}
                <p style={{ fontWeight:700, fontSize:15, color: isSuspeito ? '#991b1b' : '#15803d', margin:0, fontFamily:'Sora,sans-serif' }}>
                  {isSuspeito ? 'Risco Elevado — Recomendado Teste Genético' : 'Baixa Probabilidade de Síndrome do X Frágil'}
                </p>
              </div>
              <p style={{ fontSize:13, color: isSuspeito ? '#b91c1c' : '#166534', margin:0, lineHeight:1.6, fontFamily:'Sora,sans-serif' }}>
                {isSuspeito ? 'O score calculado sugere alta probabilidade da síndrome. Recomenda-se encaminhamento para avaliação genética especializada.' : 'O score está abaixo do limiar de suspeita clínica para este género. Acompanhamento de rotina recomendado.'}
              </p>
            </div>
          </div>

          {/* ── Respostas expansíveis ── */}
          <div className="fu d4 no-print">
            <button onClick={() => setMostrarRespostas(v => !v)} className={`expand-btn${mostrarRespostas ? ' open' : ''}`}>
              <span style={{ fontSize:14, fontWeight:600, color:'#212b54' }}>Ver Respostas do Questionário</span>
              <div style={{ width:28, height:28, borderRadius:'50%', backgroundColor:'#eef0f8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {mostrarRespostas ? <ChevronUp size={14} style={{ color:'#212b54' }} /> : <ChevronDown size={14} style={{ color:'#212b54' }} />}
              </div>
            </button>
            {mostrarRespostas && (
              <div className="resp-panel">
                {sintomas.map((sintoma) => (
                  <div key={sintoma} className="resp-row">
                    <span>{sintoma}</span>
                    <span className={questionario[sintoma] === 'sim' ? 'pill-sim' : 'pill-nao'}>
                      {questionario[sintoma] === 'sim' ? 'Sim' : questionario[sintoma] === 'nao' ? 'Não' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Botões ── */}
          <div className="fu d5 responsive-grid no-print" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <button className="btn-outline" onClick={() => router.push('/adicionar-paciente?pacienteId=' + dados.pacienteId)}>
              <RotateCcw size={17} /> Fazer Novo Questionário
            </button>
            <button className="btn-solid" onClick={() => router.push('/paciente/' + dados.pacienteId)}>
              <Save size={17} /> Ver Prontuário
            </button>
            <button
              onClick={() => window.print()}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                padding:'15px 24px', borderRadius:14, border:'none', cursor:'pointer',
                fontSize:15, fontWeight:600, color:'#fff', fontFamily:'Sora,sans-serif',
                background:'#10b981', transition:'background .15s, transform .1s',
                boxShadow:'0 2px 8px rgba(16,185,129,.25)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
              onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(.98)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Printer size={17} /> Salvar PDF
            </button>
          </div>

        </div>
      </main>
      </div>{/* fim screen-content */}
    </div>
  );
}
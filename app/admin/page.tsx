'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users, FileText, Search, Plus, Pencil, Trash2,
  LogOut, X, Loader2, ShieldCheck, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Relatorio {
  id: number;
  created_at: string;
  score_final: number;
  is_suspeito: boolean;
  paciente: { nome_completo: string };
  medico:   { nome: string };
}

interface Medico {
  id: number;
  nome: string;
  email: string;
  role: string;
  created_at: string;
}

type Aba = 'relatorios' | 'medicos';

// ── Componente Principal ──────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('relatorios');
  const [verificando, setVerificando] = useState(true);

  // Relatórios
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [filtroData, setFiltroData] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [carregandoRel, setCarregandoRel] = useState(false);

  // Médicos
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [carregandoMed, setCarregandoMed] = useState(false);

  // Modal cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [medicoEditando, setMedicoEditando] = useState<Medico | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formRole, setFormRole] = useState('MEDICO');
  const [salvando, setSalvando] = useState(false);

  // ── Verificação de admin ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/verificar')
      .then(r => r.json())
      .then(data => {
        if (!data.isAdmin) {
          toast.error('Acesso restrito a administradores.');
          router.push('/painel');
        } else {
          setVerificando(false);
          fetchRelatorios();
          fetchMedicos();
        }
      })
      .catch(() => router.push('/painel'));
  }, []);

  // ── Fetch de dados ────────────────────────────────────────────────────
  const fetchRelatorios = async () => {
    setCarregandoRel(true);
    try {
      const params = new URLSearchParams();
      if (filtroData)   params.append('data',   filtroData);
      if (filtroMedico) params.append('medico', filtroMedico);
      const res  = await fetch('/api/admin/relatorios?' + params.toString());
      const data = await res.json();
      if (data.sucesso) setRelatorios(data.relatorios);
    } catch { toast.error('Erro ao carregar relatórios.'); }
    finally  { setCarregandoRel(false); }
  };

  const fetchMedicos = async () => {
    setCarregandoMed(true);
    try {
      const res  = await fetch('/api/admin/medicos');
      const data = await res.json();
      if (data.sucesso) setMedicos(data.medicos);
    } catch { toast.error('Erro ao carregar médicos.'); }
    finally  { setCarregandoMed(false); }
  };

  // Refaz busca ao mudar filtros
  useEffect(() => { if (!verificando) fetchRelatorios(); }, [filtroData, filtroMedico]);

  // ── Helpers do modal ──────────────────────────────────────────────────
  const abrirModalCadastro = () => {
    setMedicoEditando(null);
    setFormNome(''); setFormEmail(''); setFormSenha(''); setFormRole('MEDICO');
    setModalAberto(true);
  };

  const abrirModalEdicao = (m: Medico) => {
    setMedicoEditando(m);
    setFormNome(m.nome); setFormEmail(m.email); setFormSenha(''); setFormRole(m.role);
    setModalAberto(true);
  };

  const fecharModal = () => { setModalAberto(false); setMedicoEditando(null); };

  const salvarMedico = async () => {
    if (!formNome.trim() || !formEmail.trim()) {
      toast.error('Nome e e-mail são obrigatórios.'); return;
    }
    if (!medicoEditando && !formSenha.trim()) {
      toast.error('Senha obrigatória para novo médico.'); return;
    }
    setSalvando(true);
    try {
      const method = medicoEditando ? 'PUT' : 'POST';
      const url    = medicoEditando
        ? `/api/admin/medicos/${medicoEditando.id}`
        : '/api/admin/medicos';

      const body: Record<string, string> = { nome: formNome, email: formEmail, role: formRole };
      if (formSenha.trim()) body.senha = formSenha;

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();

      if (data.sucesso) {
        toast.success(medicoEditando ? 'Médico atualizado!' : 'Médico cadastrado!');
        fecharModal();
        fetchMedicos();
      } else {
        toast.error(data.erro || 'Erro ao salvar.');
      }
    } catch { toast.error('Erro de conexão.'); }
    finally { setSalvando(false); }
  };

  const excluirMedico = async (id: number, nome: string) => {
    if (!confirm(`Excluir o médico "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res  = await fetch(`/api/admin/medicos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.sucesso) { toast.success('Médico excluído.'); fetchMedicos(); }
      else toast.error(data.erro || 'Erro ao excluir.');
    } catch { toast.error('Erro de conexão.'); }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  // ── Loading inicial ───────────────────────────────────────────────────
  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f2f8' }}>
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 14 }}>Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f8', display: 'flex', flexDirection: 'column', fontFamily: 'Sora, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        input, select, textarea { font-family: 'Sora', sans-serif; }

        .tab-btn {
          padding: 10px 20px; border: none; cursor: pointer; font-weight: 600;
          font-size: 14px; border-radius: 10px; transition: all .15s;
          display: flex; align-items: center; gap: 8px;
        }
        .tab-btn.active   { background: #212b54; color: #fff; }
        .tab-btn.inactive { background: transparent; color: #6b7280; }
        .tab-btn.inactive:hover { background: #e9eaf0; color: #374151; }

        .card { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(33,43,84,.05), 0 6px 20px rgba(33,43,84,.07); }

        .table-header { background: #212b54; }
        .table-header th { color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; padding: 12px 16px; text-align: left; }
        .table-body  td { padding: 12px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
        .table-body tr:last-child td { border-bottom: none; }
        .table-body tr:hover td { background: #f8f9fd; }

        .badge-suspeito { background: #fee2e2; color: #dc2626; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .badge-ok       { background: #dcfce7; color: #16a34a; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .badge-admin    { background: #ede9fe; color: #7c3aed; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .badge-medico   { background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }

        .input-field {
          border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px;
          font-size: 14px; color: #1f2937; outline: none; width: 100%; transition: border .15s;
        }
        .input-field:focus { border-color: #212b54; }

        .btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
          font-weight: 600; font-size: 14px; color: #fff; background: #212b54;
          transition: background .15s;
        }
        .btn-primary:hover { background: #1a2243; }
        .btn-primary:disabled { opacity: .6; cursor: default; }

        .btn-ghost-red {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px; border: 1.5px solid #fca5a5;
          cursor: pointer; font-size: 12px; font-weight: 600; color: #dc2626;
          background: transparent; transition: background .15s;
        }
        .btn-ghost-red:hover { background: #fee2e2; }

        .btn-ghost-blue {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px; border: 1.5px solid #93c5fd;
          cursor: pointer; font-size: 12px; font-weight: 600; color: #2563eb;
          background: transparent; transition: background .15s;
        }
        .btn-ghost-blue:hover { background: #eff6ff; }

        /* Modal overlay */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          display: flex; align-items: center; justify-content: center; z-index: 50;
        }
        .modal-box {
          background: #fff; border-radius: 20px; padding: 32px;
          width: 100%; max-width: 480px;
          box-shadow: 0 20px 60px rgba(33,43,84,.2);
        }
      `}</style>

      {/* HEADER */}
      <header style={{ backgroundColor: '#212b54', boxShadow: '0 2px 16px rgba(33,43,84,.25)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/painel" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/IBK_LOGOTIPO_white.png" alt="IBK" width={140} height={36} />
            </Link>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#fff" style={{ opacity: .8 }} />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, opacity: .9 }}>Painel Administrativo</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Link href="/painel" style={{ color: '#fff', fontSize: 13, fontWeight: 500, textDecoration: 'none', opacity: .8 }}>Painel</Link>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', opacity: .8 }}>
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '36px 32px', width: '100%' }}>

        {/* Título */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 4px' }}>Sistema IBK</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#212b54', margin: 0 }}>Painel Administrativo</h1>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#e9eaf0', padding: 6, borderRadius: 14, width: 'fit-content' }}>
          <button className={`tab-btn ${abaAtiva === 'relatorios' ? 'active' : 'inactive'}`} onClick={() => setAbaAtiva('relatorios')}>
            <FileText size={16} /> Relatórios
          </button>
          <button className={`tab-btn ${abaAtiva === 'medicos' ? 'active' : 'inactive'}`} onClick={() => setAbaAtiva('medicos')}>
            <Users size={16} /> Médicos
          </button>
        </div>

        {/* ── ABA 1: RELATÓRIOS ── */}
        {abaAtiva === 'relatorios' && (
          <div>
            {/* Filtros */}
            <div className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Filtrar por Data
                </label>
                <input type="date" className="input-field" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  <Search size={12} style={{ display: 'inline', marginRight: 4 }} />Filtrar por Médico
                </label>
                <input type="text" className="input-field" placeholder="Nome do médico..." value={filtroMedico} onChange={e => setFiltroMedico(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={fetchRelatorios} disabled={carregandoRel} style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
                {carregandoRel ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Buscar
              </button>
            </div>

            {/* Tabela */}
            <div className="card" style={{ overflow: 'hidden' }}>
              {carregandoRel ? (
                <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: '#212b54' }} />
                </div>
              ) : relatorios.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Nenhum relatório encontrado.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead className="table-header">
                    <tr>
                      <th>#</th>
                      <th>Data</th>
                      <th>Paciente</th>
                      <th>Médico Responsável</th>
                      <th>Score</th>
                      <th>Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {relatorios.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>{String(i + 1).padStart(2, '0')}</td>
                        <td>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                        <td style={{ fontWeight: 600 }}>{r.paciente.nome_completo}</td>
                        <td>{r.medico.nome}</td>
                        <td style={{ fontWeight: 700, color: r.is_suspeito ? '#dc2626' : '#16a34a' }}>{r.score_final.toFixed(2)}</td>
                        <td>
                          <span className={r.is_suspeito ? 'badge-suspeito' : 'badge-ok'}>
                            {r.is_suspeito ? 'Risco Elevado' : 'Baixo Risco'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
              {relatorios.length} relatório{relatorios.length !== 1 ? 's' : ''} encontrado{relatorios.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ── ABA 2: MÉDICOS ── */}
        {abaAtiva === 'medicos' && (
          <div>
            {/* Header da aba */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                {medicos.length} médico{medicos.length !== 1 ? 's' : ''} cadastrado{medicos.length !== 1 ? 's' : ''}
              </p>
              <button className="btn-primary" onClick={abrirModalCadastro}>
                <Plus size={16} /> Cadastrar Novo Médico
              </button>
            </div>

            {/* Tabela */}
            <div className="card" style={{ overflow: 'hidden' }}>
              {carregandoMed ? (
                <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: '#212b54' }} />
                </div>
              ) : medicos.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Nenhum médico cadastrado.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead className="table-header">
                    <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Perfil</th>
                      <th>Cadastrado em</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {medicos.map((m, i) => (
                      <tr key={m.id}>
                        <td style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>{String(i + 1).padStart(2, '0')}</td>
                        <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#212b54', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                            {m.nome.charAt(0).toUpperCase()}
                          </div>
                          {m.nome}
                        </td>
                        <td style={{ color: '#6b7280' }}>{m.email}</td>
                        <td>
                          <span className={m.role === 'ADMIN' ? 'badge-admin' : 'badge-medico'}>{m.role}</span>
                        </td>
                        <td style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn-ghost-blue" onClick={() => abrirModalEdicao(m)}>
                              <Pencil size={13} /> Editar
                            </button>
                            <button className="btn-ghost-red" onClick={() => excluirMedico(m.id, m.nome)}>
                              <Trash2 size={13} /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL CADASTRO / EDIÇÃO ── */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#212b54', margin: 0 }}>
                {medicoEditando ? 'Editar Médico' : 'Cadastrar Novo Médico'}
              </h2>
              <button onClick={fecharModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Nome completo</label>
                <input className="input-field" type="text" placeholder="Dr. João Silva" value={formNome} onChange={e => setFormNome(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>E-mail</label>
                <input className="input-field" type="email" placeholder="email@exemplo.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  {medicoEditando ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input className="input-field" type="password" placeholder="••••••••" value={formSenha} onChange={e => setFormSenha(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Perfil de Acesso</label>
                <select className="input-field" value={formRole} onChange={e => setFormRole(e.target.value)} style={{ backgroundColor: '#fff' }}>
                  <option value="MEDICO">MEDICO</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button onClick={fecharModal} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#6b7280' }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={salvarMedico} disabled={salvando} style={{ flex: 2 }}>
                {salvando ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : medicoEditando ? 'Salvar Alterações' : 'Cadastrar Médico'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

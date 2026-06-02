import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pesosSintomas = {
  'Deficiência intelectual': { Masculino: 0.32, Feminino: 0.20 },
  'Face alongada/orelhas': { Masculino: 0.29, Feminino: 0.09 },
  'Macroorquidismo': { Masculino: 0.26, Feminino: 0.00 },
  'Hipermobilidade articular': { Masculino: 0.19, Feminino: 0.04 },
  'Dificuldades de aprendizagem': { Masculino: 0.18, Feminino: 0.28 },
  'Déficit de atenção': { Masculino: 0.17, Feminino: 0.12 },
  'Mov. repetitivos': { Masculino: 0.17, Feminino: 0.05 },
  'Atraso na fala': { Masculino: 0.14, Feminino: 0.01 },
  'Hiperatividade': { Masculino: 0.12, Feminino: 0.04 },
  'Evita contato visual': { Masculino: 0.06, Feminino: 0.08 },
  'Evita contato físico': { Masculino: 0.04, Feminino: 0.07 },
  'Agressividade': { Masculino: 0.01, Feminino: 0.02 },
};

export async function POST(request: NextRequest) {
  try {
    // 1. LÊ O CRACHÁ DE QUEM ESTÁ LOGADO
    const token = request.cookies.get('medico_token')?.value;
    if (!token) {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado.' }, { status: 401 });
    }
    const medicoLogadoId = Number(token);

    const body = await request.json();
    const { paciente, questionario, observacoes, pacienteId } = body;

    let scoreFinal = 0;
    const genero = paciente.genero;
    const respostasParaSalvar = [];

    for (const [sintoma, resposta] of Object.entries(questionario)) {
      const marcouSim = resposta === 'sim';
      respostasParaSalvar.push({ sintoma_nome: sintoma, resposta: marcouSim });
      if (marcouSim && pesosSintomas[sintoma as keyof typeof pesosSintomas]) {
        scoreFinal += pesosSintomas[sintoma as keyof typeof pesosSintomas][genero as 'Masculino' | 'Feminino'];
      }
    }

    scoreFinal = Math.round(scoreFinal * 100) / 100;
    const limiar = genero === 'Masculino' ? 0.56 : 0.55;
    const isSuspeito = scoreFinal >= limiar;

    // 2. SE FOR ADICIONAR RELATÓRIO A UM PACIENTE EXISTENTE
    if (pacienteId) {
      // Bloqueio de segurança: garante que o paciente pertence a quem está logado
      const pacientePertenceAoMedico = await prisma.paciente.findFirst({
        where: { id: Number(pacienteId), medico_id: medicoLogadoId }
      });

      if (!pacientePertenceAoMedico) {
        return NextResponse.json({ sucesso: false, erro: 'Acesso negado a este paciente.' }, { status: 403 });
      }

      const novoRelatorio = await prisma.relatorio.create({
        data: {
          score_final: scoreFinal,
          is_suspeito: isSuspeito,
          observacoes: observacoes || null,
          paciente_id: Number(pacienteId),
          respostas: { create: respostasParaSalvar }
        }
      });

      return NextResponse.json({
        sucesso: true,
        mensagem: 'Novo relatório adicionado ao histórico!',
        scoreGerado: scoreFinal,
        isSuspeito: isSuspeito,
        pacienteId: Number(pacienteId),
        relatorioId: novoRelatorio.id
      });
    }

    // 3. SE FOR UM PACIENTE TOTALMENTE NOVO
    const novoRegistro = await prisma.paciente.create({
      data: {
        nome_completo: paciente.nome,
        idade: Number(paciente.idade),
        genero: paciente.genero,
        responsavel: paciente.responsavel || null,
        medico_id: medicoLogadoId, // <-- SALVA EXATAMENTE PARA O MÉDICO QUE FEZ LOGIN
        relatorios: {
          create: {
            score_final: scoreFinal,
            is_suspeito: isSuspeito,
            observacoes: observacoes || null,
            respostas: { create: respostasParaSalvar }
          }
        }
      },
      include: { relatorios: true }
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Novo paciente criado!',
      scoreGerado: scoreFinal,
      isSuspeito: isSuspeito,
      pacienteId: novoRegistro.id,
      relatorioId: novoRegistro.relatorios[0].id
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ sucesso: false, erro: 'Falha interna.' }, { status: 500 });
  }
}
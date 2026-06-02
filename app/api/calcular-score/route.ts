import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dicionário de pesos blindado no Back-end (baseado no artigo científico)
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paciente, questionario, observacoes, pacienteId } = body;

    let scoreFinal = 0;
    const genero = paciente.genero; // Espera "Masculino" ou "Feminino"
    const respostasParaSalvar = [];

    // Cruzamento de dados e Cálculo do Score
    for (const [sintoma, resposta] of Object.entries(questionario)) {
      const marcouSim = resposta === 'sim';
      
      respostasParaSalvar.push({
        sintoma_nome: sintoma,
        resposta: marcouSim
      });

      if (marcouSim && pesosSintomas[sintoma as keyof typeof pesosSintomas]) {
        scoreFinal += pesosSintomas[sintoma as keyof typeof pesosSintomas][genero as 'Masculino' | 'Feminino'];
      }
    }

    scoreFinal = Math.round(scoreFinal * 100) / 100;

    const limiar = genero === 'Masculino' ? 0.56 : 0.55;
    const isSuspeito = scoreFinal >= limiar;

    // --- NOVA LÓGICA: SE O PACIENTE JÁ EXISTE ---
    if (pacienteId) {
      const novoRelatorio = await prisma.relatorio.create({
        data: {
          score_final: scoreFinal,
          is_suspeito: isSuspeito,
          observacoes: observacoes || null,
          paciente_id: Number(pacienteId), // Amarramos ao paciente existente
          respostas: {
            create: respostasParaSalvar
          }
        }
      });

      return NextResponse.json({
        sucesso: true,
        mensagem: 'Novo relatório adicionado ao histórico do paciente!',
        scoreGerado: scoreFinal,
        isSuspeito: isSuspeito,
        pacienteId: Number(pacienteId),
        relatorioId: novoRelatorio.id
      });
    }

    // --- LÓGICA ANTIGA: SE É UM PACIENTE NOVO ---
    let medico = await prisma.medico.findFirst();
    if (!medico) {
      medico = await prisma.medico.create({
        data: { nome: 'Dr. David', email: 'dr@buko.com', senha_hash: 'temporaria123' }
      });
    }

    const novoRegistro = await prisma.paciente.create({
      data: {
        nome_completo: paciente.nome,
        idade: Number(paciente.idade),
        genero: paciente.genero,
        responsavel: paciente.responsavel || null,
        medico_id: medico.id,
        relatorios: {
          create: {
            score_final: scoreFinal,
            is_suspeito: isSuspeito,
            observacoes: observacoes || null,
            respostas: {
              create: respostasParaSalvar
            }
          }
        }
      },
      include: { relatorios: true }
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Novo paciente e relatório criados!',
      scoreGerado: scoreFinal,
      isSuspeito: isSuspeito,
      pacienteId: novoRegistro.id,
      relatorioId: novoRegistro.relatorios[0].id
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Falha interna no servidor ao calcular score.' }, 
      { status: 500 }
    );
  }
}
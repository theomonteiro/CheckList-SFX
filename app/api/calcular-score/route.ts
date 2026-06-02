import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pesosSintomas = {
  'Deficiência intelectual': { Masculino: 0.32, Feminino: 0.20 },
  'Face alongada/orelhas': { Masculino: 0.29, Feminino: 0.09 },
  'Macroorquidismo': { Masculino: 0.26, Feminino: 0.00 }, // Apenas masculino
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
    // 1. Recebe os dados brutos do Front-end
    const body = await request.json();
    const { paciente, questionario, observacoes } = body;

    let scoreFinal = 0;
    const genero = paciente.genero; // Espera "Masculino" ou "Feminino"
    const respostasParaSalvar = [];

    // 2. Cruzamento de dados e Cálculo do Score
    for (const [sintoma, resposta] of Object.entries(questionario)) {
      const marcouSim = resposta === 'sim';
      
      // Guarda a resposta para registrar no histórico do banco
      respostasParaSalvar.push({
        sintoma_nome: sintoma,
        resposta: marcouSim
      });

      // Se marcou "Sim", adiciona o peso do gênero correspondente à nota
      if (marcouSim && pesosSintomas[sintoma as keyof typeof pesosSintomas]) {
        scoreFinal += pesosSintomas[sintoma as keyof typeof pesosSintomas][genero as 'Masculino' | 'Feminino'];
      }
    }

    // Arredonda para 2 casas decimais (ex: 0.54) para evitar erros do JavaScript
    scoreFinal = Math.round(scoreFinal * 100) / 100;

    // 3. Verifica o Risco (Limiar por Gênero)
    const limiar = genero === 'Masculino' ? 0.56 : 0.55;
    const isSuspeito = scoreFinal >= limiar;

    // --- TRUQUE DO MVP PARA A CHAVE ESTRANGEIRA ---
    // Como a tabela Paciente exige o ID de um Médico, e ainda não temos login,
    // garantimos que o "Dr. Buko" seja criado automaticamente no banco.
    let medico = await prisma.medico.findFirst();
    if (!medico) {
      medico = await prisma.medico.create({
        data: { nome: 'Dr. David', email: 'dr@buko.com', senha_hash: 'temporaria123' }
      });
    }
    // ----------------------------------------------

    // 4. Salva no MySQL: O Paciente, o Relatório e as 12 Respostas de uma vez só!
    const novoRegistro = await prisma.paciente.create({
      data: {
        nome_completo: paciente.nome,
        idade: Number(paciente.idade),
        genero: paciente.genero,
        responsavel: paciente.responsavel || null,
        medico_id: medico.id, // O crachá do médico amarrando o paciente
        relatorios: {
          create: {
            score_final: scoreFinal,
            is_suspeito: isSuspeito,
            observacoes: observacoes || null,
            respostas: {
              create: respostasParaSalvar // Salva as 12 linhas filhas do relatório
            }
          }
        }
      },
      include: { relatorios: true } // Pede para o Prisma devolver o ID do relatório criado
    });

    // 5. Retorna o resultado limpo e processado para o Front-end
    return NextResponse.json({
      sucesso: true,
      mensagem: 'Cálculo realizado e dados salvos no MySQL!',
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
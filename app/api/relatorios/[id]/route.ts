import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Mudamos a tipagem aqui para evitar erros do TypeScript com a versão nova
export async function GET(
  request: Request,
  context: any 
) {
  try {
    // 2. A MÁGICA ACONTECE AQUI: Adicionamos o "await" antes de ler o params
    const params = await context.params;
    const relatorioId = Number(params.id);

    const relatorio = await prisma.relatorio.findUnique({
      where: { id: relatorioId },
      include: {
        paciente: true,
        respostas: true,
      },
    });

    if (!relatorio) {
      return NextResponse.json(
        { sucesso: false, erro: 'Relatório não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true, relatorio });
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Falha interna ao buscar o relatório.' },
      { status: 500 }
    );
  }
}
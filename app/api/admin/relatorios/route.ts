import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const medicoToken = cookieStore.get('medico_token')?.value;
    const user = await prisma.medico.findUnique({ where: { id: Number(medicoToken) } });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dataFiltro = searchParams.get('data');
    const medicoFiltro = searchParams.get('medico');

    let whereClause: any = {};

    if (dataFiltro) {
      const start = new Date(`${dataFiltro}T00:00:00.000Z`);
      const end = new Date(`${dataFiltro}T23:59:59.999Z`);
      whereClause.created_at = { gte: start, lte: end };
    }

    if (medicoFiltro) {
      whereClause.paciente = {
        medico: { nome: { contains: medicoFiltro } }
      };
    }

    const relatoriosDB = await prisma.relatorio.findMany({
      where: whereClause,
      include: {
        paciente: {
          include: { medico: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const relatorios = relatoriosDB.map(r => ({
      id: r.id,
      created_at: r.created_at,
      score_final: r.score_final,
      is_suspeito: r.is_suspeito,
      paciente: { nome_completo: r.paciente.nome_completo },
      medico: { nome: r.paciente.medico.nome }
    }));

    return NextResponse.json({ sucesso: true, relatorios });
  } catch (error) {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao buscar relatórios' }, { status: 500 });
  }
}
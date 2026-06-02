import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('medico_token')?.value;
    if (!token) {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado.' }, { status: 401 });
    }
    const medicoLogadoId = Number(token);

    const pacientes = await prisma.paciente.findMany({
      where: { medico_id: medicoLogadoId }, // <-- ISOLAMENTO DE DADOS AQUI
      orderBy: { created_at: 'desc' },
      include: {
        relatorios: {
          orderBy: { created_at: 'desc' } 
        },
      },
    });

    return NextResponse.json({ sucesso: true, pacientes });

  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Falha ao buscar pacientes no banco de dados.' },
      { status: 500 }
    );
  }
}
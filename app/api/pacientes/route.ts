import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        relatorios: {
          orderBy: { created_at: 'desc' } // Garante que o relatorios[0] será o mais recente
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
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: any 
) {
  try {
    const params = await context.params;
    const pacienteId = Number(params.id);

    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: {
        relatorios: {
          orderBy: { created_at: 'desc' } // Organiza o histórico temporal
        }
      }
    });

    if (!paciente) {
      return NextResponse.json(
        { sucesso: false, erro: 'Paciente não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true, paciente });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Falha interna ao buscar o paciente.' },
      { status: 500 }
    );
  }
}
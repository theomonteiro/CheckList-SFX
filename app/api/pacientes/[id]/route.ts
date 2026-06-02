import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: any 
) {
  try {
    const token = request.cookies.get('medico_token')?.value;
    if (!token) {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado.' }, { status: 401 });
    }
    const medicoLogadoId = Number(token);

    const params = await context.params;
    const pacienteId = Number(params.id);

    // Mudou para findFirst para podermos passar duas condições (ID do paciente e ID do médico)
    const paciente = await prisma.paciente.findFirst({
      where: { 
        id: pacienteId,
        medico_id: medicoLogadoId // <-- BLINDAGEM DE ROTA
      },
      include: {
        relatorios: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!paciente) {
      return NextResponse.json(
        { sucesso: false, erro: 'Paciente não encontrado ou não pertence a você.' },
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
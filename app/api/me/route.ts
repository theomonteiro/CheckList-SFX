import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('medico_token')?.value;

    if (!token) {
      return NextResponse.json({ sucesso: false, erro: 'Não autenticado' }, { status: 401 });
    }

    const medico = await prisma.medico.findUnique({
      where: { id: Number(token) },
      select: { nome: true } // Trazemos apenas o nome por segurança
    });

    if (!medico) {
      return NextResponse.json({ sucesso: false, erro: 'Médico não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ sucesso: true, medico });
  } catch (error) {
    return NextResponse.json({ sucesso: false, erro: 'Erro no servidor' }, { status: 500 });
  }
}
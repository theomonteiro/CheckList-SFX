import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const medicoToken = cookieStore.get('medico_token')?.value;
    const user = await prisma.medico.findUnique({ where: { id: Number(medicoToken) } });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado' }, { status: 403 });
    }

    const medicos = await prisma.medico.findMany({
      select: { id: true, nome: true, email: true, role: true, created_at: true },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ sucesso: true, medicos });
  } catch (error) {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao buscar médicos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const medicoToken = cookieStore.get('medico_token')?.value;
    const user = await prisma.medico.findUnique({ where: { id: Number(medicoToken) } });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado' }, { status: 403 });
    }

    const { nome, email, senha, role } = await request.json();

    const emailExiste = await prisma.medico.findUnique({ where: { email } });
    if (emailExiste) {
      return NextResponse.json({ sucesso: false, erro: 'Este e-mail já está em uso.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    await prisma.medico.create({
      data: { nome, email, senha_hash, role }
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao cadastrar médico' }, { status: 500 });
  }
}
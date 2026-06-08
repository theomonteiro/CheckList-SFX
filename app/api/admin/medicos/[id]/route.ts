import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('medico_token')?.value;
    const adminUser = await prisma.medico.findUnique({ where: { id: Number(adminToken) } });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado' }, { status: 403 });
    }

    const { nome, email, senha, role } = await request.json();
    let dadosAtualizados: any = { nome, email, role };

    if (senha) {
      const salt = await bcrypt.genSalt(10);
      dadosAtualizados.senha_hash = await bcrypt.hash(senha, salt);
    }

    await prisma.medico.update({
      where: { id: Number(id) }, // Usando o ID extraído
      data: dadosAtualizados
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao atualizar médico' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('medico_token')?.value;
    const adminUser = await prisma.medico.findUnique({ where: { id: Number(adminToken) } });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ sucesso: false, erro: 'Não autorizado' }, { status: 403 });
    }

    if (Number(id) === Number(adminToken)) {
        return NextResponse.json({ sucesso: false, erro: 'Você não pode excluir a si mesmo.' }, { status: 400 });
    }

    const medico = await prisma.medico.findUnique({
      where: { id: Number(id) }, // Usando o ID extraído
      include: { pacientes: true }
    });

    if (medico && medico.pacientes.length > 0) {
      return NextResponse.json({ sucesso: false, erro: 'Não é possível excluir um médico que possui pacientes cadastrados.' }, { status: 400 });
    }

    await prisma.medico.delete({ where: { id: Number(id) } });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao excluir médico' }, { status: 500 });
  }
}

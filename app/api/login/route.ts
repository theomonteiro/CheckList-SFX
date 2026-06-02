import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    // 1. Busca o médico APENAS pelo e-mail
    const medico = await prisma.medico.findFirst({
      where: { email: email }
    });

    // Se não achar o e-mail
    if (!medico) {
      return NextResponse.json(
        { sucesso: false, erro: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    // 2. Compara a senha digitada no form com o HASH guardado no banco
    const senhaValida = await bcrypt.compare(senha, medico.senha_hash);

    // Se a matemática do hash não bater
    if (!senhaValida) {
      return NextResponse.json(
        { sucesso: false, erro: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    // 3. Login com sucesso! (Gera o Cookie)
    const response = NextResponse.json({ sucesso: true, medicoId: medico.id });

    response.cookies.set('medico_token', String(medico.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Falha interna no servidor.' },
      { status: 500 }
    );
  }
}
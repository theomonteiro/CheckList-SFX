import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const medicoToken = cookieStore.get('medico_token')?.value;
    
    if (!medicoToken) {
      return NextResponse.json({ isAdmin: false });
    }

    const user = await prisma.medico.findUnique({ 
      where: { id: Number(medicoToken) } 
    });

    return NextResponse.json({ isAdmin: user?.role === 'ADMIN' });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
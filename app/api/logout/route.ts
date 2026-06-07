import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ sucesso: true, mensagem: 'Logout realizado' });
  
  // Apaga o crachá de acesso
  response.cookies.delete('medico_token');
  
  return response;
}
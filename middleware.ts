import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Tenta encontrar o crachá do médico no navegador
  const token = request.cookies.get('medico_token')?.value;
  const urlAtual = request.nextUrl.pathname;

  // Lista de rotas que exigem que o médico esteja logado
  const rotasProtegidas = [
    '/exibir-pacientes', 
    '/adicionar-paciente', 
    '/relatorio', 
    '/paciente',
    '/painel'
  ];

  // Verifica se o utilizador está a tentar entrar numa rota protegida
  const tentandoAcessarRotaProtegida = rotasProtegidas.some(rota => urlAtual.startsWith(rota));

  // CENA 1: Tentar entrar sem crachá -> Expulsa para o Login
  if (tentandoAcessarRotaProtegida && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // CENA 2: Já está logado e tentou abrir a página de Login de novo -> Manda para o Painel
  if (urlAtual === '/' && token) {
    return NextResponse.redirect(new URL('/painel', request.url));
  }

  return NextResponse.next();
}

// Configuração para dizer ao vigia quais as pastas que ele deve ficar a olhar
export const config = {
  matcher: [
    '/', 
    '/exibir-pacientes', 
    '/adicionar-paciente', 
    '/relatorio/:path*', 
    '/paciente/:path*',
    '/painel'
  ],
};
```markdown
# Documento Técnico de Implantação e Arquitetura

## 1. Visão Geral e Arquitetura do Sistema
O sistema foi desenvolvido utilizando uma **Arquitetura Web de 3 camadas**, unificadas dentro do framework Next.js:
* **Front-end (Apresentação):** Desenvolvido em React.js com TypeScript e Tailwind CSS para interfaces responsivas.
* **Back-end (Lógica de Negócios):** Utiliza as *Route Handlers* (APIs) do Next.js rodando em Node.js.
* **Banco de Dados (Persistência):** Banco de dados MySQL gerenciado através do ORM Prisma.

## 2. Tecnologias e Dependências Utilizadas
* **Framework Principal:** Next.js (App Router).
* **Estilização e Ícones:** Tailwind CSS e Lucide-react.
* **Banco de Dados:** MySQL e Prisma Client (`@prisma/client`).
* **Segurança:** `bcrypt` para hash de senhas.
* **Ambiente de Execução:** Node.js (versão 18+ recomendada).

## 3. Estrutura de Banco de Dados (Modelagem Lógica)
* `Medico`: Armazena credenciais e nível de acesso (`role`: `MEDICO` ou `ADMIN`).
* `Paciente`: Armazena dados demográficos amarrados a um `medico_id`.
* `Relatorio`: Armazena o `score_final` e a flag `is_suspeito`.
* `RespostaSintoma`: Armazena as respostas booleanas para os 12 sintomas avaliados.

## 4. Lógica de Autenticação e Segurança (RBAC)
O sistema implementa o **Controle de Acesso Baseado em Cargos (RBAC)**. 
Ao realizar o login, a senha é validada (bcrypt) e um cookie de sessão (`medico_token`) é gerado. Todas as rotas de API sensíveis verificam no banco de dados, em tempo real, qual é a *role* do detentor do token, garantindo que usuários comuns vejam apenas seus próprios pacientes, enquanto o Administrador possui acesso irrestrito ao painel gerencial.

## 5. Implementação das Regras de Negócio
O cálculo de triagem é processado no Back-end aplicando a fórmula ponderada dos sintomas. O valor obtido é validado contra os limiares rigorosos de corte com base no gênero anatômico:
* **Masculino:** Limiar de suspeita clínica > 0.56
* **Feminino:** Limiar de suspeita clínica > 0.55

## 6. Módulo de Impressão (PDF)
A renderização do PDF é feita através de media queries CSS (`@media print`), que removem os painéis de navegação, ajustam o grid de leitura e forçam os gráficos SVG para exibição e impressão de alta qualidade com um único clique.

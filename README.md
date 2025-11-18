# Ponto Orgânico

Sistema web para gerenciamento de pontos de compostagem, entregas de materiais orgânicos e programa de recompensas. Aplicação desenvolvida com React, TypeScript e Supabase.

## Sobre o Projeto

O Ponto Orgânico é uma plataforma que incentiva a compostagem e o descarte correto de materiais orgânicos através de um sistema de gamificação. Os usuários podem:

- Registrar entregas de materiais orgânicos em pontos de coleta
- Ganhar pontos e subir de nível
- Resgatar recompensas com os pontos acumulados
- Visualizar certificados e conquistas
- Acompanhar o ranking de participantes
- Encontrar locais de compostagem próximos

## Funcionalidades

### Usuário
- Autenticação: Login e registro de usuários
- Perfil: Ver e editar dados pessoais
- Entregas: Registrar entregas de materiais orgânicos com foto
- Pontos e Níveis: Sistema de gamificação com 6 níveis
  - Eco Iniciante (0-99 pontos)
  - Eco Amador (100-499 pontos)
  - Eco Intermediário (500-999 pontos)
  - Eco Avançado (1000-2499 pontos)
  - Eco Expert (2500-4999 pontos)
  - Eco Mestre (5000+ pontos)
- Recompensas: Catálogo de recompensas que podem ser resgatadas com pontos
- Resgatados: Histórico de recompensas que já foram resgatadas
- Certificados: Ver certificados e conquistas
- Ranking: Ver classificação de usuários por pontos
- Locais: Mapa interativo com pontos de compostagem
- Calculadora: Calcular pontos e benefícios

### Vendedor
- Gerenciar suas próprias recompensas
- Ver resgates relacionados às suas recompensas

### Administrador
- Painel administrativo completo
- Gerenciar entregas
- Validar entregas pendentes
- Ver estatísticas e relatórios

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior) - Se não tiver, baixe em [nodejs.org](https://nodejs.org/)
- **npm** - Vem junto com o Node.js
- **Conta no Supabase** - É gratuito, crie em [supabase.com](https://supabase.com)

Se você não sabe o que é Node.js ou npm, não se preocupe! Node.js é um programa que permite rodar JavaScript no seu computador, e npm é uma ferramenta que instala as bibliotecas que o projeto precisa.

## Instalação

1. Abra o terminal (ou PowerShell no Windows) e navegue até a pasta do projeto:
```bash
cd "PONTO ORGÂNICO"
```

2. Instale as dependências (as bibliotecas que o projeto precisa):
```bash
npm install
```

Isso pode demorar alguns minutos na primeira vez. O npm vai baixar todas as bibliotecas necessárias.

**Dica**: Se der algum erro, tente rodar `npm install` de novo. Às vezes é só um problema de conexão.

## Como Rodar o Projeto

Depois de instalar as dependências, você pode rodar o projeto:

### `npm run dev`
Inicia o servidor de desenvolvimento. Isso vai abrir o projeto no seu navegador.

Depois de rodar esse comando, acesse [http://localhost:8080](http://localhost:8080) no navegador.

**Dica**: Deixe esse comando rodando enquanto trabalha no projeto. Se você fechar o terminal, o servidor para.

## Tipos de Usuário

O projeto tem três tipos de usuários:

1. **Usuário comum** - Pode registrar entregas, resgatar recompensas, ver ranking, etc.
2. **Vendedor** - Pode fazer tudo que usuário faz, mais gerenciar suas próprias recompensas
3. **Administrador** - Pode fazer tudo, mais gerenciar entregas e ver estatísticas

## Colocar o Projeto no Ar

Quando o projeto estiver pronto, rode `npm run build` para gerar os arquivos de produção. Depois, você pode fazer o deploy em serviços como Vercel ou Netlify.

## Considerações Finais

O Ponto Orgânico foi desenvolvido com o objetivo de incentivar práticas sustentáveis através da gamificação. Ao facilitar o registro de entregas de materiais orgânicos e oferecer um sistema de recompensas, esperamos contribuir para um futuro mais sustentável e consciente.

Se tiver dúvidas ou precisar de ajuda, consulte a documentação do Supabase ou o guia de API do projeto.


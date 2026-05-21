# La Casa Burger | Sistema de Gestão e Pedidos

## Sobre o Sistema
Este é um sistema completo e moderno para gestão de pedidos e cardápio, desenvolvido para otimizar as operações do **La Casa Burger**. O projeto contempla uma frente de loja (interface do cliente) para realização de pedidos via "Delivery" ou "Retirada", e um painel de administração blindado para a equipe do restaurante acompanhar o faturamento, produção, e catálogo.

**Principais Funcionalidades:**
- **PWA (Progressive Web App)**: Instalável em Android, iOS e Windows direto pelo navegador com prompt personalizado e experiência nativa. Suporta atualizações transparentes.
- **Integração com WhatsApp**: Na finalização de pedidos, mensagens estilizadas são geradas automaticamente para facilitar o fluxo de atendimento. O Admin possui botões de WhatsApp de 1-click para alertar a preparação, entrega, e retirada.
- **Consulta de CEP Automática**: Integração com a API do ViaCEP para autocompletar endereços no momento do Checkout.
- **Painel Administrativo**: Protegido por sistema de login moderno. Contempla Dashboard financeiro, gestor de Categorias e Produtos (com suporte a upload de imagens), Gestor de Mesas (QR Code) e acompanhamento em Real-Time dos status dos pedidos (Pendente, Preparo, Pronto e Entregue).
- **Integração Real-Time**: O Supabase fornece a flexibilidade e sincronização na comunicação em tempo real e armazena os dados do cliente de forma persistente.
- **Deploy Otimizado e Contínuo**: Configurações flexíveis preparadas apontadas para o Netlify com hooks de deploy via Github.

## Tecnologias Usadas

O sistema foi estruturado adotando o melhor do ecossistema Web moderno:

- **Frontend**: 
  - **React 18** com **TypeScript** e build orquestrado através do **Vite**.
  - **Tailwind CSS**: Estilização baseada em utilitários providenciando responsividade nativa, garantindo visualização otimizada para Desktop, Tablets e dispositivos Mobile (Mobile-first).
  - **Motion (Framer Motion)**: Biblioteca responsável pelas microinterações (como a animação de "Pedido Sucesso", menus de navegação, progressbar do PWA e modais).
  - **Lucide-React**: Coleção flexível de ícones no padrão visual.

- **Backend & Serviços Online**:
  - **Supabase**: Backend (BaaS) operando como o coração inteligente do app. Responsável por serviços essenciais de banco de dados baseado em Postgres, Auth, e integração com autenticações de terceiros como Google OAuth.
  - **ViaCEP**: Utilizado a nível de API para validações e preenchimento de endereços fluído para delivery brasileiro.

- **DevOps, Tooling & Distribuição**:
  - **Netlify**: Hospedagem robusta para distribuição de aplicações Node.js / Serverless front-ends configurada através de `netlify.toml`.
  - **vite-plugin-pwa**: Motor responsável por gerar manifestos e workers (Service Workers) que constroem e gerenciam comportamentos de tela inicial (Add to Homescreen) e atualização da plataforma PWA.

---

## Contato e Suporte

Caso você tenha alguma dúvida a respeito desta infraestrutura ou precise escalar para novas funcionalidades da lanchonete, pode entrar em contato:

📩 **Email para contato técnico e manutenções:** [sousasandro419@gmail.com](mailto:sousasandro419@gmail.com)

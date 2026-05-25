# La Casa Burguer | Sistema de Gestão e Pedidos

## Sobre o Sistema
Este é um sistema completo e moderno para gestão de pedidos e cardápio, desenvolvido para otimizar as operações do **La Casa Burguer**. O projeto contempla uma frente de loja (interface do cliente) para realização de pedidos via "Delivery" ou "Retirada", e um painel de administração blindado para a equipe do restaurante acompanhar o faturamento, controle de produção e gerenciar o catálogo.

**Principais Funcionalidades:**
- **Frente de Loja (PWA - Progressive Web App)**: Instalável em aparelhos Android, iOS e Desktop diretamente pelo navegador, assegurando uma experiência fluida de aplicativo nativo off-line e com atualizações em background.
- **Integração com WhatsApp**: Geração automática de mensagens estilizadas ao finalizar pedidos para facilitar o fluxo de atendimento da lanchonete, incluindo alertas de suporte e direcionamento no cardápio de 1-click.
- **Verificação Inteligente de Comprovante PIX (via IA)**: O back-end incorpora inteligência artificial utilizando modelos visuais do **Google Gemini (3.5 Flash)** para escanear, processar a imagem (OCR e Análise) do recibo PIX e validar se o valor confere exatamente com a cobrança final. 
- **Consulta de CEP Automática (ViaCEP)**: Formulários de delivery auto-completados a partir do CEP inserido pelo conforto do cliente.
- **Painel Administrativo e Real-Time**: Interface do dono para analisar vendas, gerenciar mesas, editar e subir novos produtos no cardápio. Possibilita mudar o status do pedido para "Preparo" e "Entregue" - sendo sincronizado na nuvem.
- **Design de Alta Qualidade**: Estilizado primariamente pensando na experiência Mobile, trazendo micro-interações responsivas, paletas de cores modernas, drawers fluídos e componentes que incentivam usabilidade elegante (mobile-first UI).

## Tecnologias Usadas

Este software Full-stack une o máximo de usabilidade moderna e integração de inteligência artificial de ponta:

- **Frontend**: 
  - **React 19** com forte tipagem de **TypeScript**, orquestrado pelo compilador ágil **Vite**.
  - **Tailwind CSS (v4)**: Framework de estilização via utilitários focado em interfaces escaláveis, fluidas e com alta responsividade sem arquivos de CSS gigantes.
  - **Motion (Framer)**: Framework declarativo responsável por todas as animações robustas (carrinho/sacola flutuante, notificações coloridas, entradas de modais, fade-ins).
  - **Lucide-React**: Set premium, customizável e adaptativo de ícones limpos no padrão UI.

- **Backend, Banco de Dados & Infra IA**:
  - **Node.js + Express Server**: Custom backend executado em Node (`server.ts`) encarregado de injetar segurança, servir requisições assíncronas do checkout e empacotar a aplicação final.
  - **Google Gemini API**: Utiliza a mais nova SDK oficial `@google/genai`. Analisa, classifica fotos submetidas nos formulários de confirmação e extrai metadados valiosos operando o motor visionário em nuvem de modo seguro.
  - **Supabase**: Base de dados Postgres flexível funcionando em formato BaaS (Backend-as-a-service) - fornece Auth protegido por JWT e gerenciamento das tabelas dos menus e dos pedidos feitos através do Front.

- **DevOps, Tooling & Distribuição**:
  - **vite-plugin-pwa**: Auxiliar automático e gerador dos manifests WebManifest e do Service Worker. Garante o funcionamento de caixas promts como "Adicionar a Tela Inicial".
  - **esbuild**: Compilador (escrito em Go) executado durando o build para compilar com velocidade absurda os arquivos TS Node garantindo output puro em `dist/server.cjs`.

---

## Contato e Desenvolvimento

Caso precise gerenciar este sistema de software, re-escalar opções técnicas de banco de dados ou requisitar manutenções pontuais:

📩 **Email para suporte:** [sousasandro419@gmail.com](mailto:sousasandro419@gmail.com)
(Sandro Dev)

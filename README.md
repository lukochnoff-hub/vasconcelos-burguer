# 🍔 Vasconcelos Burguer

Cardápio digital completo com sistema de pedidos via WhatsApp para a Vasconcelos Burguer.

## Funcionalidades

### Cliente
- Cardápio online com filtro por categorias e banner da loja
- Modal de escolha de recheio para pastéis e bebidas
- Modal de adicionais para hambúrgueres com controle de quantidade e soma automática no preço
- Carrinho de compras com resumo detalhado
- Confirmação do pedido antes de enviar
- Entrega na vila, retirada ou entrega em fazendas com taxa automática
- Programa de fidelidade — a cada 9 pedidos o 10° ganha um lanche grátis de até R$25
- Pedido enviado via WhatsApp Business com resumo completo, adicionais e contador de fidelidade
- Aviso automático de loja fechada com horários de funcionamento

### Painel Admin
- Gerenciamento de produtos — adicionar, editar, remover e ocultar itens
- Gerenciamento de categorias
- Gerenciamento de adicionais com nome e preço
- Controle de pedidos com status (pendente → em preparo → em entrega → finalizado)
- Som de notificação ao receber pedido novo
- Programa de fidelidade por cliente com edição manual
- Faturamento por dia, semana e mês
- Abrir/fechar loja manualmente

## Tecnologias

**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Python Flask + Gunicorn  
**Deploy:** Vercel (frontend) + Render (backend)

## Estrutura
vasconcelos-burguer/

├── frontend/        # React + Vite + Tailwind

│   └── src/

│       ├── components/   # CardProduto, Carrinho, AdminPainel

│       ├── context/      # CarrinhoContext

│       ├── data/         # api.js, config.js

│       └── pages/        # Cardapio, FinalizarPedido, Admin

├── backend/         # Flask API

│   └── routes/      # produtos, pedidos, categorias, fidelidade, adicionais, funcionamento

├── vercel.json

└── render.yaml

## Acesso admin

A proprietária acessa o painel clicando 5x na logo, com senha exclusiva.

## Desenvolvido por

Projeto desenvolvido por Maria Luiza Kochnoff da Matta — [github.com/lukochnoff-hub](https://github.com/lukochnoff-hub)
# 🍔 Vasconcelos Burguer

Cardápio digital com sistema de pedidos via WhatsApp para a Vasconcelos Burguer.

## Funcionalidades

- Cardápio online com filtro por categorias
- Carrinho de compras
- Pedido via WhatsApp Business com resumo formatado
- Entrega na vila, retirada ou entrega em fazendas com taxa automática
- Programa de fidelidade — a cada 9 pedidos o 10° ganha um lanche grátis de até R$25
- Painel admin protegido por senha para gerenciar produtos e categorias

## Tecnologias

**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Python Flask + Gunicorn  
**Deploy:** Vercel (frontend) + Render (backend)

## Estrutura
vasconcelos-burguer/

├── frontend/        # React + Vite + Tailwind

├── backend/         # Flask API

├── vercel.json      # Configuração de rotas para o Vercel

└── render.yaml      # Configuração de deploy para o Render

## Acesso admin

A proprietária acessa o painel de gerenciamento em `/admin` com senha exclusiva.

## Desenvolvido por

Projeto desenvolvido por Maria Luiza Kochnoff da Matta — [github.com/lukochnoff-hub](https://github.com/lukochnoff-hub)
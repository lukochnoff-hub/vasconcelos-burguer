from flask import Blueprint, request, jsonify
import json
import os

produtos_bp = Blueprint("produtos", __name__)

ARQUIVO_PRODUTOS = os.path.join(os.path.dirname(__file__), "../dados_produtos.json")
ARQUIVO_CATEGORIAS = os.path.join(os.path.dirname(__file__), "../dados_categorias.json")

CATEGORIAS_INICIAIS = ["Hambúrgueres", "Pastéis", "Bebidas", "Porções", "Snacks"]

PRODUTOS_INICIAIS = [
    {"id": 1, "categoria": "Hambúrgueres", "nome": "X-Burguer", "preco": 14, "descricao": "Hambúrguer artesanal", "disponivel": True},
    {"id": 2, "categoria": "Hambúrgueres", "nome": "X-Salada", "preco": 17, "descricao": "Hambúrguer artesanal com salada", "disponivel": True},
    {"id": 3, "categoria": "Hambúrgueres", "nome": "X-Calabresa", "preco": 23, "descricao": "Hambúrguer artesanal com calabresa", "disponivel": True},
    {"id": 4, "categoria": "Hambúrgueres", "nome": "X-Eguee", "preco": 19, "descricao": "Hambúrguer artesanal", "disponivel": True},
    {"id": 5, "categoria": "Hambúrgueres", "nome": "X-Bacon", "preco": 23, "descricao": "Hambúrguer artesanal com bacon", "disponivel": True},
    {"id": 6, "categoria": "Hambúrgueres", "nome": "X-Salsicha", "preco": 20, "descricao": "Hambúrguer artesanal com salsicha", "disponivel": True},
    {"id": 7, "categoria": "Hambúrgueres", "nome": "X-Frango", "preco": 25, "descricao": "Hambúrguer artesanal com frango", "disponivel": True},
    {"id": 8, "categoria": "Hambúrgueres", "nome": "X-Franbacon", "preco": 27, "descricao": "Hambúrguer artesanal com frango e bacon", "disponivel": True},
    {"id": 9, "categoria": "Hambúrgueres", "nome": "X-Calabacon", "preco": 26, "descricao": "Hambúrguer artesanal com calabresa e bacon", "disponivel": True},
    {"id": 10, "categoria": "Hambúrgueres", "nome": "X-Tudo", "preco": 31, "descricao": "Hambúrguer artesanal completo", "disponivel": True},
    {"id": 11, "categoria": "Hambúrgueres", "nome": "X-Tudo Duplo", "preco": 40, "descricao": "Hambúrguer artesanal completo duplo", "disponivel": True},
    {"id": 12, "categoria": "Pastéis", "nome": "Pastel Simples", "preco": 13, "descricao": "Carne, Frango, Queijo ou Presunto", "disponivel": True},
    {"id": 13, "categoria": "Pastéis", "nome": "Pastel com Queijo", "preco": 15, "descricao": "Carne e queijo, Presunto e queijo, Frango e queijo ou Pizza", "disponivel": True},
    {"id": 14, "categoria": "Pastéis", "nome": "Pastelão", "preco": 25, "descricao": "Pastel grande", "disponivel": True},
    {"id": 15, "categoria": "Pastéis", "nome": "Pastel Unidade", "preco": 22, "descricao": "Pastel unidade", "disponivel": True},
]

def carregar_produtos():
    if not os.path.exists(ARQUIVO_PRODUTOS):
        salvar_produtos(PRODUTOS_INICIAIS)
        return PRODUTOS_INICIAIS
    with open(ARQUIVO_PRODUTOS, "r") as f:
        return json.load(f)

def salvar_produtos(dados):
    with open(ARQUIVO_PRODUTOS, "w") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

def carregar_categorias():
    if not os.path.exists(ARQUIVO_CATEGORIAS):
        salvar_categorias(CATEGORIAS_INICIAIS)
        return CATEGORIAS_INICIAIS
    with open(ARQUIVO_CATEGORIAS, "r") as f:
        return json.load(f)

def salvar_categorias(dados):
    with open(ARQUIVO_CATEGORIAS, "w") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

# Rotas de categorias
@produtos_bp.route("/categorias", methods=["GET"])
def listar_categorias():
    return jsonify(carregar_categorias())

@produtos_bp.route("/categorias", methods=["POST"])
def adicionar_categoria():
    dados = carregar_categorias()
    nova = request.get_json().get("nome")
    if not nova or nova in dados:
        return jsonify({"erro": "Categoria inválida ou já existe"}), 400
    dados.append(nova)
    salvar_categorias(dados)
    return jsonify(dados), 201

@produtos_bp.route("/categorias/<nome>", methods=["DELETE"])
def deletar_categoria(nome):
    categorias = carregar_categorias()
    if nome not in categorias:
        return jsonify({"erro": "Categoria não encontrada"}), 404
    categorias = [c for c in categorias if c != nome]
    salvar_categorias(categorias)
    # Remove produtos da categoria deletada
    produtos = carregar_produtos()
    produtos = [p for p in produtos if p["categoria"] != nome]
    salvar_produtos(produtos)
    return jsonify({"ok": True})

# Rotas de produtos
@produtos_bp.route("/produtos", methods=["GET"])
def listar():
    return jsonify(carregar_produtos())

@produtos_bp.route("/produtos", methods=["POST"])
def adicionar():
    dados = carregar_produtos()
    novo = request.get_json()
    novo["id"] = max([p["id"] for p in dados], default=0) + 1
    novo["disponivel"] = True
    dados.append(novo)
    salvar_produtos(dados)
    return jsonify(novo), 201

@produtos_bp.route("/produtos/<int:id>", methods=["PUT"])
def atualizar(id):
    dados = carregar_produtos()
    for i, p in enumerate(dados):
        if p["id"] == id:
            dados[i].update(request.get_json())
            salvar_produtos(dados)
            return jsonify(dados[i])
    return jsonify({"erro": "Produto não encontrado"}), 404

@produtos_bp.route("/produtos/<int:id>", methods=["DELETE"])
def deletar(id):
    dados = carregar_produtos()
    dados = [p for p in dados if p["id"] != id]
    salvar_produtos(dados)
    return jsonify({"ok": True})
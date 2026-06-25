from flask import Blueprint, request, jsonify
import json
import os

produtos_bp = Blueprint("produtos", __name__)

ARQUIVO = os.path.join(os.path.dirname(__file__), "../dados_produtos.json")

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

def carregar_dados():
    if not os.path.exists(ARQUIVO):
        salvar_dados(PRODUTOS_INICIAIS)
        return PRODUTOS_INICIAIS
    with open(ARQUIVO, "r") as f:
        return json.load(f)

def salvar_dados(dados):
    with open(ARQUIVO, "w") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

@produtos_bp.route("/produtos", methods=["GET"])
def listar():
    return jsonify(carregar_dados())

@produtos_bp.route("/produtos", methods=["POST"])
def adicionar():
    dados = carregar_dados()
    novo = request.get_json()
    novo["id"] = max([p["id"] for p in dados], default=0) + 1
    novo["disponivel"] = True
    dados.append(novo)
    salvar_dados(dados)
    return jsonify(novo), 201

@produtos_bp.route("/produtos/<int:id>", methods=["PUT"])
def atualizar(id):
    dados = carregar_dados()
    for i, p in enumerate(dados):
        if p["id"] == id:
            dados[i].update(request.get_json())
            salvar_dados(dados)
            return jsonify(dados[i])
    return jsonify({"erro": "Produto não encontrado"}), 404

@produtos_bp.route("/produtos/<int:id>", methods=["DELETE"])
def deletar(id):
    dados = carregar_dados()
    dados = [p for p in dados if p["id"] != id]
    salvar_dados(dados)
    return jsonify({"ok": True})
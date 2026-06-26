from flask import Blueprint, request, jsonify
import json
import os

adicionais_bp = Blueprint("adicionais", __name__)

ARQUIVO_ADICIONAIS = os.path.join(os.path.dirname(__file__), "../dados_adicionais.json")

ADICIONAIS_INICIAIS = [
    {"id": 1, "nome": "Hambúrguer extra", "preco": 8},
    {"id": 2, "nome": "Queijo extra", "preco": 2},
    {"id": 3, "nome": "Bacon extra", "preco": 2},
    {"id": 4, "nome": "Ovo", "preco": 2},
    {"id": 5, "nome": "Calabresa extra", "preco": 2},
    {"id": 6, "nome": "Presunto extra", "preco": 2},
    {"id": 7, "nome": "Salsicha extra", "preco": 2},
]

def carregar_adicionais():
    if not os.path.exists(ARQUIVO_ADICIONAIS):
        salvar_adicionais(ADICIONAIS_INICIAIS)
        return ADICIONAIS_INICIAIS
    with open(ARQUIVO_ADICIONAIS, "r") as f:
        return json.load(f)

def salvar_adicionais(dados):
    with open(ARQUIVO_ADICIONAIS, "w") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

@adicionais_bp.route("/adicionais", methods=["GET"])
def listar():
    return jsonify(carregar_adicionais())

@adicionais_bp.route("/adicionais", methods=["POST"])
def adicionar():
    dados = carregar_adicionais()
    novo = request.get_json()
    novo["id"] = max([a["id"] for a in dados], default=0) + 1
    dados.append(novo)
    salvar_adicionais(dados)
    return jsonify(novo), 201

@adicionais_bp.route("/adicionais/<int:id>", methods=["PUT"])
def atualizar(id):
    dados = carregar_adicionais()
    for i, a in enumerate(dados):
        if a["id"] == id:
            dados[i].update(request.get_json())
            salvar_adicionais(dados)
            return jsonify(dados[i])
    return jsonify({"erro": "Adicional não encontrado"}), 404

@adicionais_bp.route("/adicionais/<int:id>", methods=["DELETE"])
def deletar(id):
    dados = carregar_adicionais()
    dados = [a for a in dados if a["id"] != id]
    salvar_adicionais(dados)
    return jsonify({"ok": True})
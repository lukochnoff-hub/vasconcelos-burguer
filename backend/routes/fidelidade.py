from flask import Blueprint, request, jsonify
import json
import os

fidelidade_bp = Blueprint("fidelidade", __name__)

ARQUIVO = os.path.join(os.path.dirname(__file__), "../dados_fidelidade.json")

def carregar_dados():
    if not os.path.exists(ARQUIVO):
        return {}
    with open(ARQUIVO, "r") as f:
        return json.load(f)

def salvar_dados(dados):
    with open(ARQUIVO, "w") as f:
        json.dump(dados, f, indent=2)

@fidelidade_bp.route("/fidelidade/<telefone>", methods=["GET"])
def consultar(telefone):
    dados = carregar_dados()
    pedidos = dados.get(telefone, 0)
    faltam = max(0, 9 - (pedidos % 9)) if pedidos % 9 != 0 else 9
    ganhou = pedidos > 0 and pedidos % 10 == 0
    return jsonify({
        "telefone": telefone,
        "pedidos": pedidos,
        "faltam": faltam,
        "ganhou": ganhou
    })

@fidelidade_bp.route("/fidelidade/<telefone>", methods=["POST"])
def registrar(telefone):
    dados = carregar_dados()
    dados[telefone] = dados.get(telefone, 0) + 1
    salvar_dados(dados)
    pedidos = dados[telefone]
    faltam = max(0, 9 - (pedidos % 9)) if pedidos % 9 != 0 else 9
    ganhou = pedidos % 10 == 0
    return jsonify({
        "telefone": telefone,
        "pedidos": pedidos,
        "faltam": faltam,
        "ganhou": ganhou
    })
    
@fidelidade_bp.route("/fidelidade", methods=["GET"]) 
def listar_todos():
    dados = carregar_dados()
    resultado = []
    for telefone, pedidos in dados.items():
        faltam = max(0, 9 - (pedidos % 9)) if pedidos % 9 != 0 else 9
        ganhou = pedidos > 0 and pedidos % 10 == 0
        resultado.append({
            "telefone": telefone,
            "pedidos": pedidos,
            "faltam": faltam,
            "ganhou": ganhou
        })
    return jsonify(resultado)

@fidelidade_bp.route("/fidelidade/<telefone>", methods=["PUT"])
def editar(telefone):
    dados = carregar_dados()
    novo_total = request.get_json().get("pedidos", 0)
    dados[telefone] = novo_total
    salvar_dados(dados)
    return jsonify({"telefone": telefone, "pedidos": novo_total})
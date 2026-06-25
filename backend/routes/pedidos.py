from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime

pedidos_bp = Blueprint("pedidos", __name__)

ARQUIVO = os.path.join(os.path.dirname(__file__), "../dados_pedidos.json")

def carregar_dados():
    if not os.path.exists(ARQUIVO):
        return []
    with open(ARQUIVO, "r") as f:
        return json.load(f)

def salvar_dados(dados):
    with open(ARQUIVO, "w") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

@pedidos_bp.route("/pedidos", methods=["GET"])
def listar():
    return jsonify(carregar_dados())

@pedidos_bp.route("/pedidos", methods=["POST"])
def registrar():
    dados = carregar_dados()
    pedido = request.get_json()
    pedido["id"] = len(dados) + 1
    pedido["data"] = datetime.now().strftime("%d/%m/%Y %H:%M")
    pedido["status"] = "pendente"
    dados.append(pedido)
    salvar_dados(dados)
    return jsonify(pedido), 201
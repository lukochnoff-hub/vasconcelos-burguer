from flask import Blueprint, jsonify, request
import json
import os
from datetime import datetime

pedidos_bp = Blueprint("pedidos", __name__)

ARQUIVO = os.path.join(os.path.dirname(__file__), "../dados_pedidos.json")

def carregar():
    if not os.path.exists(ARQUIVO):
        return []
    with open(ARQUIVO, "r") as f:
        return json.load(f)

def salvar(dados):
    with open(ARQUIVO, "w") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

@pedidos_bp.route("/pedidos", methods=["GET"])
def listar():
    return jsonify(carregar())

@pedidos_bp.route("/pedidos", methods=["POST"])
def registrar():
    dados = carregar()
    pedido = request.get_json()
    agora = datetime.now()
    pedido["id"] = len(dados) + 1
    pedido["data"] = agora.strftime("%d/%m/%Y %H:%M")
    pedido["dia"] = agora.strftime("%d/%m/%Y")
    pedido["semana"] = agora.strftime("%Y-W%W")
    pedido["mes"] = agora.strftime("%m/%Y")
    pedido["status"] = "pendente"
    pedido["fidelidade_contada"] = False
    dados.append(pedido)
    salvar(dados)
    return jsonify(pedido), 201

@pedidos_bp.route("/pedidos/<int:id>/status", methods=["PUT"])
def atualizar_status(id):
    dados = carregar()
    for pedido in dados:
        if pedido["id"] == id:
            novo_status = request.get_json().get("status")
            pedido["status"] = novo_status
            salvar(dados)
            return jsonify(pedido)
    return jsonify({"erro": "Pedido não encontrado"}), 404

@pedidos_bp.route("/pedidos/<int:id>/confirmar-fidelidade", methods=["POST"])
def confirmar_fidelidade(id):
    from routes.fidelidade import carregar_dados, salvar_dados
    dados = carregar()
    for pedido in dados:
        if pedido["id"] == id and not pedido.get("fidelidade_contada"):
            # Conta ponto de fidelidade
            fidelidade = carregar_dados()
            tel = pedido.get("telefone", "")
            fidelidade[tel] = fidelidade.get(tel, 0) + 1
            salvar_dados(fidelidade)
            pedido["fidelidade_contada"] = True
            salvar(dados)
            return jsonify({"ok": True, "pedidos": fidelidade[tel]})
    return jsonify({"erro": "Pedido não encontrado ou fidelidade já contada"}), 400
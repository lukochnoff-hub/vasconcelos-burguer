from flask import Blueprint, jsonify
import json
import os
from datetime import datetime

funcionamento_bp = Blueprint("funcionamento", __name__)

ARQUIVO = os.path.join(os.path.dirname(__file__), "../dados_funcionamento.json")

def carregar():
    if not os.path.exists(ARQUIVO):
        return {"aberto": False, "manual": False}
    with open(ARQUIVO, "r") as f:
        return json.load(f)

def salvar(dados):
    with open(ARQUIVO, "w") as f:
        json.dump(dados, f)

@funcionamento_bp.route("/funcionamento", methods=["GET"])
def status():
    return jsonify(carregar())

@funcionamento_bp.route("/funcionamento/abrir", methods=["POST"])
def abrir():
    salvar({"aberto": True, "manual": True})
    return jsonify({"aberto": True, "manual": True})

@funcionamento_bp.route("/funcionamento/fechar", methods=["POST"])
def fechar():
    salvar({"aberto": False, "manual": True})
    return jsonify({"aberto": False, "manual": True})
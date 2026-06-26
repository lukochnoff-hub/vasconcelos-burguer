from flask import Blueprint, request, jsonify
from supabase_client import supabase

adicionais_bp = Blueprint("adicionais", __name__)

@adicionais_bp.route("/adicionais", methods=["GET"])
def listar():
    res = supabase.table("adicionais").select("*").execute()
    return jsonify(res.data)

@adicionais_bp.route("/adicionais", methods=["POST"])
def adicionar():
    novo = request.get_json()
    res = supabase.table("adicionais").insert(novo).execute()
    return jsonify(res.data[0]), 201

@adicionais_bp.route("/adicionais/<int:id>", methods=["PUT"])
def atualizar(id):
    dados = request.get_json()
    res = supabase.table("adicionais").update(dados).eq("id", id).execute()
    return jsonify(res.data[0])

@adicionais_bp.route("/adicionais/<int:id>", methods=["DELETE"])
def deletar(id):
    supabase.table("adicionais").delete().eq("id", id).execute()
    return jsonify({"ok": True})
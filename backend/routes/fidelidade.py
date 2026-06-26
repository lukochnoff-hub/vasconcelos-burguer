from flask import Blueprint, request, jsonify
from supabase_client import supabase

fidelidade_bp = Blueprint("fidelidade", __name__)

@fidelidade_bp.route("/fidelidade", methods=["GET"])
def listar():
    res = supabase.table("fidelidade").select("*").execute()
    return jsonify(res.data)

@fidelidade_bp.route("/fidelidade/<telefone>", methods=["GET"])
def consultar(telefone):
    res = supabase.table("fidelidade").select("*").eq("telefone", telefone).execute()
    if not res.data:
        return jsonify({"pedidos": 0, "faltam": 9, "ganhou": False})
    total = res.data[0]["pedidos"]
    ganhou = total > 0 and total % 10 == 0
    faltam = 9 - (total % 10) if not ganhou else 0
    return jsonify({"pedidos": total, "faltam": faltam, "ganhou": ganhou})

@fidelidade_bp.route("/fidelidade/<telefone>", methods=["POST"])
def registrar(telefone):
    res = supabase.table("fidelidade").select("*").eq("telefone", telefone).execute()
    if res.data:
        total = res.data[0]["pedidos"] + 1
        supabase.table("fidelidade").update({"pedidos": total}).eq("telefone", telefone).execute()
    else:
        total = 1
        supabase.table("fidelidade").insert({"telefone": telefone, "pedidos": total}).execute()
    return jsonify({"pedidos": total})

@fidelidade_bp.route("/fidelidade/<telefone>", methods=["PUT"])
def editar(telefone):
    pedidos = request.get_json().get("pedidos", 0)
    res = supabase.table("fidelidade").select("*").eq("telefone", telefone).execute()
    if res.data:
        supabase.table("fidelidade").update({"pedidos": pedidos}).eq("telefone", telefone).execute()
    else:
        supabase.table("fidelidade").insert({"telefone": telefone, "pedidos": pedidos}).execute()
    return jsonify({"ok": True})
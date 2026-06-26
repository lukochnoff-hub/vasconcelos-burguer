from flask import Blueprint, jsonify
from supabase_client import supabase

funcionamento_bp = Blueprint("funcionamento", __name__)

@funcionamento_bp.route("/funcionamento", methods=["GET"])
def consultar():
    res = supabase.table("funcionamento").select("*").eq("id", 1).execute()
    if not res.data:
        return jsonify({"aberto": False})
    return jsonify(res.data[0])

@funcionamento_bp.route("/funcionamento/abrir", methods=["POST"])
def abrir():
    supabase.table("funcionamento").update({"aberto": True, "manual": True}).eq("id", 1).execute()
    return jsonify({"aberto": True})

@funcionamento_bp.route("/funcionamento/fechar", methods=["POST"])
def fechar():
    supabase.table("funcionamento").update({"aberto": False, "manual": True}).eq("id", 1).execute()
    return jsonify({"aberto": False})
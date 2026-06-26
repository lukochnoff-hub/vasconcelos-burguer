from flask import Blueprint, request, jsonify
from supabase_client import supabase

produtos_bp = Blueprint("produtos", __name__)

# Rotas de categorias
@produtos_bp.route("/categorias", methods=["GET"])
def listar_categorias():
    res = supabase.table("categorias").select("nome").execute()
    return jsonify([r["nome"] for r in res.data])

@produtos_bp.route("/categorias", methods=["POST"])
def adicionar_categoria():
    nome = request.get_json().get("nome")
    if not nome:
        return jsonify({"erro": "Nome inválido"}), 400
    supabase.table("categorias").insert({"nome": nome}).execute()
    res = supabase.table("categorias").select("nome").execute()
    return jsonify([r["nome"] for r in res.data]), 201

@produtos_bp.route("/categorias/<nome>", methods=["DELETE"])
def deletar_categoria(nome):
    supabase.table("categorias").delete().eq("nome", nome).execute()
    supabase.table("produtos").delete().eq("categoria", nome).execute()
    return jsonify({"ok": True})

# Rotas de produtos
@produtos_bp.route("/produtos", methods=["GET"])
def listar():
    res = supabase.table("produtos").select("*").execute()
    return jsonify(res.data)

@produtos_bp.route("/produtos", methods=["POST"])
def adicionar():
    novo = request.get_json()
    novo["disponivel"] = True
    res = supabase.table("produtos").insert(novo).execute()
    return jsonify(res.data[0]), 201

@produtos_bp.route("/produtos/<int:id>", methods=["PUT"])
def atualizar(id):
    dados = request.get_json()
    res = supabase.table("produtos").update(dados).eq("id", id).execute()
    return jsonify(res.data[0])

@produtos_bp.route("/produtos/<int:id>", methods=["DELETE"])
def deletar(id):
    supabase.table("produtos").delete().eq("id", id).execute()
    return jsonify({"ok": True})
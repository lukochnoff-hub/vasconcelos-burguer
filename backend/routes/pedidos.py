from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime

pedidos_bp = Blueprint("pedidos", __name__)

@pedidos_bp.route("/pedidos", methods=["GET"])
def listar():
    res = supabase.table("pedidos").select("*").execute()
    return jsonify(res.data)

@pedidos_bp.route("/pedidos", methods=["POST"])
def registrar():
    pedido = request.get_json()
    agora = datetime.now()
    pedido["data"] = agora.strftime("%d/%m/%Y %H:%M")
    pedido["dia"] = agora.strftime("%d/%m/%Y")
    pedido["semana"] = agora.strftime("%Y-W%W")
    pedido["mes"] = agora.strftime("%m/%Y")
    pedido["status"] = "pendente"
    pedido["fidelidade_contada"] = False

    # renomear campos pra bater com o banco
    pedido["tipo_entrega"] = pedido.pop("tipoEntrega", "")
    pedido["taxa_entrega"] = pedido.pop("taxaEntrega", 0)

    res = supabase.table("pedidos").insert(pedido).execute()
    return jsonify(res.data[0]), 201

@pedidos_bp.route("/pedidos/<int:id>/status", methods=["PUT"])
def atualizar_status(id):
    novo_status = request.get_json().get("status")
    res = supabase.table("pedidos").update({"status": novo_status}).eq("id", id).execute()
    return jsonify(res.data[0])

@pedidos_bp.route("/pedidos/<int:id>/confirmar-fidelidade", methods=["POST"])
def confirmar_fidelidade(id):
    res = supabase.table("pedidos").select("*").eq("id", id).execute()
    if not res.data:
        return jsonify({"erro": "Pedido não encontrado"}), 404

    pedido = res.data[0]
    if pedido.get("fidelidade_contada"):
        return jsonify({"erro": "Fidelidade já contada"}), 400

    tel = pedido.get("telefone", "")

    fid = supabase.table("fidelidade").select("*").eq("telefone", tel).execute()
    if fid.data:
        total = fid.data[0]["pedidos"] + 1
        supabase.table("fidelidade").update({"pedidos": total}).eq("telefone", tel).execute()
    else:
        total = 1
        supabase.table("fidelidade").insert({"telefone": tel, "pedidos": total}).execute()

    supabase.table("pedidos").update({"fidelidade_contada": True}).eq("id", id).execute()
    return jsonify({"ok": True, "pedidos": total})

    @pedidos_bp.route("/pedidos/<int:id>", methods=["DELETE"])
    def deletar(id):
        dados = carregar_dados()
        dados = [p for p in dados if p["id"] != id]
        salvar_dados(dados)
        return jsonify({"ok": True})
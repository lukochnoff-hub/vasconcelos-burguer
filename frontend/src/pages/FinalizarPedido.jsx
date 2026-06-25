import { useState } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { fazendas, pixConfig } from "../data/config";
import { registrarPedido, registrarFidelidade } from "../data/api";

function FinalizarPedido({ onVoltar }) {
  const { itens, total, limparCarrinho } = useCarrinho();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("retirada");
  const [fazendaSelecionada, setFazendaSelecionada] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("pix");

  const fazenda = fazendas.find((f) => f.nome === fazendaSelecionada);
  const taxaEntrega = tipoEntrega === "fazenda" && fazenda ? fazenda.taxa : 0;
  const totalComEntrega = total + taxaEntrega;

  const pedidoMinimo = fazenda?.pedidoMinimo || 0;
  const abaixoDoMinimo = tipoEntrega === "fazenda" && fazenda && total < pedidoMinimo;

  async function handleEnviar() {
    if (!nome || !telefone) {
      alert("Preencha seu nome e telefone!");
      return;
    }
    if ((tipoEntrega === "vila" || tipoEntrega === "fazenda") && !endereco) {
      alert("Preencha o endereço de entrega!");
      return;
    }
    if (tipoEntrega === "fazenda" && !fazendaSelecionada) {
      alert("Selecione a fazenda de entrega!");
      return;
    }
    if (abaixoDoMinimo) {
      alert(`Pedido mínimo para ${fazendaSelecionada} é R$ ${pedidoMinimo},00`);
      return;
    }

    // Registra pedido e fidelidade no backend
    const fidelidade = await registrarFidelidade(telefone);
    await registrarPedido({
      nome,
      telefone,
      itens,
      tipoEntrega,
      fazenda: fazendaSelecionada,
      endereco,
      pagamento,
      taxaEntrega,
      total: totalComEntrega,
    });

    // Monta mensagem fidelidade
    const fidelidadeTxt = fidelidade.ganhou
      ? `🎉 *PARABÉNS! Você ganhou um lanche grátis de até R$25!*`
      : `⭐ Fidelidade: ${fidelidade.pedidos}/9 — faltam ${fidelidade.faltam} pedido(s) para ganhar um lanche grátis!`;

    const itensTxt = itens
      .map((i) => `• ${i.quantidade}x ${i.nome} — R$ ${(i.preco * i.quantidade).toFixed(2).replace(".", ",")}`)
      .join("%0A");

    const entregaTxt =
      tipoEntrega === "retirada"
        ? `🏠 Retirada no local`
        : tipoEntrega === "vila"
        ? `🏘️ Entrega na vila — ${endereco}`
        : `🛵 Entrega em fazenda: ${fazendaSelecionada} — ${endereco}%0ATaxa de entrega: R$ ${taxaEntrega.toFixed(2).replace(".", ",")}`;

    const pagamentoTxt =
      pagamento === "pix"
        ? `💳 Pagamento: Pix (${pixConfig.chave})`
        : `💳 Pagamento: Cartão na retirada`;

    const mensagem =
      `🍔 *Novo Pedido — Vasconcelos Burguer*%0A%0A` +
      `👤 *Cliente:* ${nome}%0A` +
      `📱 *Telefone:* ${telefone}%0A%0A` +
      `*Itens do pedido:*%0A${itensTxt}%0A%0A` +
      `${entregaTxt}%0A${pagamentoTxt}%0A%0A` +
      `💰 *Total: R$ ${totalComEntrega.toFixed(2).replace(".", ",")}*%0A%0A` +
      `${fidelidadeTxt}`;

    window.open(`https://wa.me/55${pixConfig.chave}?text=${mensagem}`, "_blank");
    limparCarrinho();
    onVoltar();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-10">
      <button
        onClick={onVoltar}
        className="text-zinc-400 hover:text-white mb-6 flex items-center gap-2"
      >
        ← Voltar ao cardápio
      </button>

      <h2 className="text-yellow-400 text-2xl font-bold mb-6">Finalizar Pedido</h2>

      {/* Resumo */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6">
        <h3 className="text-white font-bold mb-3">Resumo do pedido</h3>
        {itens.map((item) => (
          <div key={item.id} className="flex justify-between text-zinc-300 text-sm py-1">
            <span>{item.quantidade}x {item.nome}</span>
            <span>R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
        {taxaEntrega > 0 && (
          <div className="flex justify-between text-zinc-400 text-sm py-1 border-t border-zinc-700 mt-2 pt-2">
            <span>Taxa de entrega</span>
            <span>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
        <div className="flex justify-between text-yellow-400 font-bold mt-3 border-t border-zinc-700 pt-3">
          <span>Total</span>
          <span>R$ {totalComEntrega.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
        />
        <input
          type="tel"
          placeholder="Seu telefone (WhatsApp)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
        />

        {/* Tipo de entrega */}
        <div className="flex gap-3">
        <button
            onClick={() => { setTipoEntrega("retirada"); setFazendaSelecionada(""); }}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
            tipoEntrega === "retirada"
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
        >
            🏠 Retirada
        </button>
        <button
            onClick={() => { setTipoEntrega("vila"); setFazendaSelecionada(""); }}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
            tipoEntrega === "vila"
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
        >
            🏘️ Vila
        </button>
        <button
            onClick={() => { setTipoEntrega("fazenda"); setFazendaSelecionada(""); }}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
            tipoEntrega === "fazenda"
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
        >
            🛵 Fazenda
        </button>
        </div>

        {/* Campos de entrega vila */}
        {tipoEntrega === "vila" && (
        <input
            type="text"
            placeholder="Endereço completo"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
        />
        )}

        {/* Campos de entrega fazenda */}
        {tipoEntrega === "fazenda" && (
        <>
            <select
            value={fazendaSelecionada}
            onChange={(e) => setFazendaSelecionada(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
            >
            <option value="">Selecione a fazenda</option>
            {fazendas.map((f) => (
                <option key={f.nome} value={f.nome}>
                {f.nome} — Taxa: R$ {f.taxa.toFixed(2).replace(".", ",")}
                {f.pedidoMinimo > 0 ? ` (mín. R$ ${f.pedidoMinimo})` : ""}
                </option>
            ))}
            </select>

            {abaixoDoMinimo && (
            <p className="text-red-400 text-sm">
                ⚠️ Pedido mínimo para {fazendaSelecionada} é R$ {pedidoMinimo},00
            </p>
            )}

            <input
            type="text"
            placeholder="Endereço completo"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
            />
        </>
        )}

        {/* Pagamento */}
        <div className="flex gap-3">
          <button
            onClick={() => setPagamento("pix")}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              pagamento === "pix"
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            💸 Pix
          </button>
          <button
            onClick={() => setPagamento("cartao")}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              pagamento === "cartao"
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            💳 Cartão
          </button>
        </div>

        <button
          onClick={handleEnviar}
          className="w-full bg-yellow-400 text-black font-bold py-4 rounded-xl hover:bg-yellow-300 transition text-lg mt-2"
        >
          Enviar pedido pelo WhatsApp 📲
        </button>
      </div>
    </div>
  );
}

export default FinalizarPedido;
import { useState, useEffect } from "react";
import {
  listarCategorias, listarProdutos, adicionarCategoria, deletarCategoria,
  adicionarProduto, atualizarProduto, deletarProduto,
  listarPedidos, atualizarStatusPedido, confirmarFidelidade,
  consultarFuncionamento, abrirLoja, fecharLoja,
} from "../data/api";

const STATUS_ORDEM = ["pendente", "em preparo", "em entrega", "finalizado"];
const STATUS_COR = {
  pendente: "bg-zinc-700 text-zinc-300",
  "em preparo": "bg-blue-900 text-blue-300",
  "em entrega": "bg-yellow-900 text-yellow-300",
  finalizado: "bg-green-900 text-green-400",
};

function AdminPainel({ onSair }) {
  const [aba, setAba] = useState("pedidos");
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [funcionamento, setFuncionamento] = useState({ aberto: false });
  const [carregando, setCarregando] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState("dia");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoProduto, setNovoProduto] = useState({ nome: "", preco: "", descricao: "", categoria: "" });
  const [editando, setEditando] = useState(null);

  useEffect(() => { carregarTudo(); }, []);

  async function carregarTudo() {
    setCarregando(true);
    const [cats, prods, peds, func] = await Promise.all([
      listarCategorias(), listarProdutos(), listarPedidos(), consultarFuncionamento()
    ]);
    setCategorias(cats);
    setProdutos(prods);
    setPedidos(peds);
    setFuncionamento(func);
    setNovoProduto((p) => ({ ...p, categoria: cats[0] || "" }));
    setCarregando(false);
  }

  // Funcionamento
  async function handleToggleLoja() {
    if (funcionamento.aberto) {
      await fecharLoja();
      setFuncionamento({ aberto: false });
    } else {
      await abrirLoja();
      setFuncionamento({ aberto: true });
    }
  }

  // Pedidos
  async function handleStatus(pedido, novoStatus) {
    await atualizarStatusPedido(pedido.id, novoStatus);
    if (novoStatus === "finalizado" && !pedido.fidelidade_contada) {
      await confirmarFidelidade(pedido.id);
    }
    carregarTudo();
  }

  function pedidosFiltrados() {
    const agora = new Date();
    return pedidos.filter((p) => {
      if (!p.dia) return false;
      const [dia, mes, ano] = p.dia.split("/");
      const dataPedido = new Date(`${ano}-${mes}-${dia}`);
      if (filtroPeriodo === "dia") {
        return p.dia === agora.toLocaleDateString("pt-BR");
      }
      if (filtroPeriodo === "semana") {
        const diff = (agora - dataPedido) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (filtroPeriodo === "mes") {
        return (
          dataPedido.getMonth() === agora.getMonth() &&
          dataPedido.getFullYear() === agora.getFullYear()
        );
      }
      return true;
    });
  }

  function faturamento(lista) {
    return lista
      .filter((p) => p.status === "finalizado")
      .reduce((acc, p) => acc + (p.total || 0), 0);
  }

  // Categorias
  async function handleAdicionarCategoria() {
    if (!novaCategoria.trim()) return;
    await adicionarCategoria(novaCategoria.trim());
    setNovaCategoria("");
    carregarTudo();
  }

  async function handleDeletarCategoria(nome) {
    if (!window.confirm(`Apagar categoria "${nome}"? Todos os produtos dela serão removidos!`)) return;
    await deletarCategoria(nome);
    carregarTudo();
  }

  // Produtos
  async function handleAdicionarProduto() {
    if (!novoProduto.nome || !novoProduto.preco || !novoProduto.categoria) return;
    await adicionarProduto({ ...novoProduto, preco: parseFloat(novoProduto.preco) });
    setNovoProduto({ nome: "", preco: "", descricao: "", categoria: categorias[0] || "" });
    carregarTudo();
  }

  async function handleToggleDisponivel(produto) {
    await atualizarProduto(produto.id, { ...produto, disponivel: !produto.disponivel });
    carregarTudo();
  }

  async function handleDeletarProduto(id) {
    if (!window.confirm("Apagar este produto?")) return;
    await deletarProduto(id);
    carregarTudo();
  }

  async function handleSalvarEdicao(produto) {
    await atualizarProduto(produto.id, {
      ...produto,
      nome: editando.nome,
      preco: parseFloat(editando.preco),
      descricao: editando.descricao,
    });
    setEditando(null);
    carregarTudo();
  }

  if (carregando) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-yellow-400 text-xl">Carregando...</p>
    </div>
  );

  const listaPedidos = pedidosFiltrados();
  const totalFaturado = faturamento(listaPedidos);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-4 flex items-center justify-between">
        <h1 className="text-yellow-400 font-bold text-xl">⚙️ Painel Admin</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleLoja}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${
              funcionamento.aberto
                ? "bg-green-500 text-black hover:bg-green-400"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {funcionamento.aberto ? "🟢 Aberta" : "🔴 Fechada"}
          </button>
          <button onClick={onSair} className="text-zinc-400 hover:text-white text-sm transition">
            Sair
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "pedidos", label: "📋 Pedidos" },
          { id: "produtos", label: "🍔 Produtos" },
          { id: "categorias", label: "📂 Categorias" },
        ].map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex-1 py-3 font-bold text-sm transition ${
              aba === a.id
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ABA PEDIDOS */}
        {aba === "pedidos" && (
          <div className="flex flex-col gap-4">
            {/* Filtro período */}
            <div className="flex gap-2">
              {["dia", "semana", "mes"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFiltroPeriodo(p)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${
                    filtroPeriodo === p
                      ? "bg-yellow-400 text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {p === "dia" ? "Hoje" : p === "semana" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>

            {/* Faturamento */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-zinc-400 text-sm">Faturamento ({filtroPeriodo === "dia" ? "hoje" : filtroPeriodo === "semana" ? "essa semana" : "esse mês"})</p>
                <p className="text-yellow-400 font-bold text-2xl">
                  R$ {totalFaturado.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 text-sm">Pedidos</p>
                <p className="text-white font-bold text-2xl">{listaPedidos.length}</p>
              </div>
            </div>

            {/* Lista de pedidos */}
            {listaPedidos.length === 0 ? (
              <p className="text-zinc-400 text-center py-10">Nenhum pedido nesse período.</p>
            ) : (
              [...listaPedidos].reverse().map((pedido) => (
                <div key={pedido.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">#{pedido.id} — {pedido.nome}</p>
                      <p className="text-zinc-400 text-sm">{pedido.data}</p>
                      <p className="text-zinc-400 text-sm">📱 {pedido.telefone}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_COR[pedido.status]}`}>
                      {pedido.status}
                    </span>
                  </div>

                  {/* Itens */}
                  <div className="border-t border-zinc-800 pt-2 flex flex-col gap-1">
                    {pedido.itens?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-zinc-300">
                        <span>{item.quantidade}x {item.nome}</span>
                        <span>R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Entrega e pagamento */}
                  <div className="text-sm text-zinc-400 border-t border-zinc-800 pt-2">
                    <p>📍 {pedido.tipoEntrega === "retirada" ? "Retirada" : pedido.tipoEntrega === "vila" ? `Vila — ${pedido.endereco}` : `Fazenda: ${pedido.fazenda} — ${pedido.endereco}`}</p>
                    <p>💳 {pedido.pagamento === "pix" ? "Pix" : "Cartão"}</p>
                    {pedido.taxaEntrega > 0 && <p>🛵 Taxa: R$ {pedido.taxaEntrega?.toFixed(2).replace(".", ",")}</p>}
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-800 pt-2">
                    <p className="text-yellow-400 font-bold">
                      Total: R$ {pedido.total?.toFixed(2).replace(".", ",")}
                    </p>
                    {pedido.fidelidade_contada && (
                      <span className="text-xs text-green-400">⭐ Fidelidade contada</span>
                    )}
                  </div>

                  {/* Botões de status */}
                  {pedido.status !== "finalizado" && (
                    <div className="flex gap-2">
                      {STATUS_ORDEM.filter((s) => s !== pedido.status && STATUS_ORDEM.indexOf(s) > STATUS_ORDEM.indexOf(pedido.status)).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatus(pedido, s)}
                          className="flex-1 py-2 rounded-lg text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition capitalize"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA CATEGORIAS */}
        {aba === "categorias" && (
          <div className="flex flex-col gap-6">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-yellow-400 font-bold">Nova Categoria</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdicionarCategoria()}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
                />
                <button
                  onClick={handleAdicionarCategoria}
                  className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
                >
                  + Criar
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {categorias.map((cat) => (
                <div key={cat} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="font-semibold">{cat}</span>
                  <button onClick={() => handleDeletarCategoria(cat)} className="text-red-400 hover:text-red-300 text-sm transition">
                    🗑 Apagar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA PRODUTOS */}
        {aba === "produtos" && (
          <div className="flex flex-col gap-6">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-yellow-400 font-bold">Novo Produto</h2>
              <select
                value={novoProduto.categoria}
                onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
              >
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Nome do produto" value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <input type="text" placeholder="Descrição (opcional)" value={novoProduto.descricao}
                onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <input type="number" placeholder="Preço (ex: 25)" value={novoProduto.preco}
                onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <button onClick={handleAdicionarProduto}
                className="bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
              >
                + Adicionar Produto
              </button>
            </div>

            {categorias.map((cat) => {
              const prods = produtos.filter((p) => p.categoria === cat);
              if (prods.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-yellow-400 font-bold mb-2">{cat}</h3>
                  <div className="flex flex-col gap-2">
                    {prods.map((prod) => (
                      <div key={prod.id} className={`bg-zinc-900 border rounded-xl p-4 flex flex-col gap-2 transition ${prod.disponivel ? "border-zinc-700" : "border-zinc-800 opacity-50"}`}>
                        {editando?.id === prod.id ? (
                          <div className="flex flex-col gap-2">
                            <input value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                              className="bg-zinc-800 border border-yellow-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                            />
                            <input value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                              className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none" placeholder="Descrição"
                            />
                            <input type="number" value={editando.preco} onChange={(e) => setEditando({ ...editando, preco: e.target.value })}
                              className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleSalvarEdicao(prod)} className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition">Salvar</button>
                              <button onClick={() => setEditando(null)} className="flex-1 bg-zinc-700 text-white py-2 rounded-lg hover:bg-zinc-600 transition">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{prod.nome}</p>
                              {prod.descricao && <p className="text-zinc-400 text-sm">{prod.descricao}</p>}
                              <p className="text-yellow-400 font-bold">R$ {prod.preco.toFixed(2).replace(".", ",")}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button onClick={() => handleToggleDisponivel(prod)}
                                className={`text-xs px-3 py-1 rounded-full font-bold transition ${prod.disponivel ? "bg-green-900 text-green-400 hover:bg-green-800" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                              >
                                {prod.disponivel ? "✓ Disponível" : "✗ Indisponível"}
                              </button>
                              <button onClick={() => setEditando({ id: prod.id, nome: prod.nome, preco: prod.preco, descricao: prod.descricao || "" })}
                                className="text-zinc-400 hover:text-yellow-400 transition text-sm"
                              >✏️</button>
                              <button onClick={() => handleDeletarProduto(prod.id)} className="text-zinc-400 hover:text-red-400 transition text-sm">🗑</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPainel;
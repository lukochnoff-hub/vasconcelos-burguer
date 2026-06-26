import { useState, useEffect, useRef } from "react";
import {
  listarCategorias, listarProdutos, adicionarCategoria, deletarCategoria,
  adicionarProduto, atualizarProduto, deletarProduto,
  listarPedidos, atualizarStatusPedido, confirmarFidelidade,
  consultarFuncionamento, abrirLoja, fecharLoja, listarFidelidade, editarFidelidade,
  listarAdicionais, adicionarAdicional, atualizarAdicional, deletarAdicional,
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
  const [filtroMesSelecionado, setFiltroMesSelecionado] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoProduto, setNovoProduto] = useState({ nome: "", preco: "", descricao: "", categoria: "", opcoes: "" });
  const [editando, setEditando] = useState(null);
  const [fidelidade, setFidelidade] = useState([]);
  const [editandoFidelidade, setEditandoFidelidade] = useState(null);
  const [novoContador, setNovoContador] = useState("");
  const [filtroCatProdutos, setFiltroCatProdutos] = useState("todas");
  const [adicionais, setAdicionais] = useState([]);
  const [novoAdicional, setNovoAdicional] = useState({ nome: "", preco: "" });
  const [editandoAdicional, setEditandoAdicional] = useState(null);

  const pedidosIdsRef = useRef(new Set());

  function tocarSom() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log("Som não disponível:", e);
    }
  }

  useEffect(() => { carregarTudo(); }, []);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      const peds = await listarPedidos();
      const novos = peds.filter(
        (p) => p.status === "pendente" && !pedidosIdsRef.current.has(p.id)
      );
      if (novos.length > 0) {
        tocarSom();
        setPedidos(peds);
        novos.forEach((p) => pedidosIdsRef.current.add(p.id));
      }
    }, 15000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    const [cats, prods, peds, func, fidel, adics] = await Promise.all([
      listarCategorias(), listarProdutos(), listarPedidos(), consultarFuncionamento(), listarFidelidade(), listarAdicionais()
    ]);
    setCategorias(cats);
    setProdutos(prods);
    setPedidos(peds);
    setFuncionamento(func);
    setFidelidade(fidel);
    setAdicionais(adics);
    setNovoProduto((p) => ({ ...p, categoria: cats[0] || "" }));
    peds.forEach((p) => pedidosIdsRef.current.add(p.id));
    setCarregando(false);
  }

  async function handleToggleLoja() {
    if (funcionamento.aberto) {
      await fecharLoja();
      setFuncionamento({ aberto: false });
    } else {
      await abrirLoja();
      setFuncionamento({ aberto: true });
    }
  }

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
      if (filtroPeriodo === "dia") return p.dia === agora.toLocaleDateString("pt-BR");
      if (filtroPeriodo === "semana") {
        const diff = (agora - dataPedido) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (filtroPeriodo === "mes") {
        return dataPedido.getMonth() === agora.getMonth() &&
          dataPedido.getFullYear() === agora.getFullYear();
      }
      if (filtroPeriodo === "mesSelecionado" && filtroMesSelecionado) {
        return p.mes === filtroMesSelecionado;
      }
      return true;
    });
  }

  function faturamento(lista) {
    return lista
      .filter((p) => p.status === "finalizado")
      .reduce((acc, p) => acc + (p.total || 0), 0);
  }

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

  async function handleAdicionarProduto() {
    if (!novoProduto.nome || !novoProduto.preco || !novoProduto.categoria) return;
    const opcoes = novoProduto.opcoes
      ? novoProduto.opcoes.split(",").map((o) => o.trim()).filter(Boolean)
      : [];
    await adicionarProduto({ ...novoProduto, preco: parseFloat(novoProduto.preco), opcoes });
    setNovoProduto({ nome: "", preco: "", descricao: "", categoria: categorias[0] || "", opcoes: "" });
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
    const opcoes = editando.opcoes
      ? editando.opcoes.split(",").map((o) => o.trim()).filter(Boolean)
      : [];
    await atualizarProduto(produto.id, {
      ...produto,
      nome: editando.nome,
      preco: parseFloat(editando.preco),
      descricao: editando.descricao,
      opcoes,
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
  const totalPendentes = pedidos.filter((p) => p.status === "pendente").length;
  const produtosFiltradosAdmin = filtroCatProdutos === "todas"
    ? produtos
    : produtos.filter((p) => p.categoria === filtroCatProdutos);
  const categoriasFiltradas = filtroCatProdutos === "todas"
    ? categorias
    : categorias.filter((c) => c === filtroCatProdutos);

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
          { id: "pedidos", label: "Pedidos" },
          { id: "produtos", label: "Produtos" },
          { id: "categorias", label: "Categorias" },
          { id: "fidelidade", label: "Fidelidade" },
          { id: "adicionais", label: "Adicionais" },
        ].map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex-1 py-3 font-bold text-sm transition relative ${
              aba === a.id
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {a.label}
            {a.id === "pedidos" && totalPendentes > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalPendentes}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ABA PEDIDOS */}
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
          <button
            onClick={() => setFiltroPeriodo("mesSelecionado")}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${
              filtroPeriodo === "mesSelecionado"
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            📅
          </button>
        </div>

        {filtroPeriodo === "mesSelecionado" && (
          <input
            type="month"
            onChange={(e) => {
              const [ano, mes] = e.target.value.split("-");
              setFiltroMesSelecionado(`${mes}/${ano}`);
            }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
          />
        )}

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

                  <div className="border-t border-zinc-800 pt-2 flex flex-col gap-1">
                    {pedido.itens?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-zinc-300">
                        <span>{item.quantidade}x {item.nome}{item.opcao ? ` (${item.opcao})` : ""}</span>
                        <span>R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                  </div>

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
              <input type="text" placeholder="Opções separadas por vírgula (ex: Carne, Frango, Queijo)"
                value={novoProduto.opcoes}
                onChange={(e) => setNovoProduto({ ...novoProduto, opcoes: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <button onClick={handleAdicionarProduto}
                className="bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
              >
                + Adicionar Produto
              </button>
            </div>

            {/* Filtro de categoria */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltroCatProdutos("todas")}
                className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                  filtroCatProdutos === "todas"
                    ? "bg-yellow-400 text-black"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCatProdutos(cat)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                    filtroCatProdutos === cat
                      ? "bg-yellow-400 text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {categoriasFiltradas.map((cat) => {
              const prods = produtosFiltradosAdmin.filter((p) => p.categoria === cat);
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
                            <input type="text"
                              value={editando.opcoes}
                              onChange={(e) => setEditando({ ...editando, opcoes: e.target.value })}
                              placeholder="Opções separadas por vírgula (ex: Carne, Frango)"
                              className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none placeholder-zinc-500"
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
                              {prod.opcoes?.length > 0 && (
                                <p className="text-zinc-500 text-xs mt-1">Opções: {prod.opcoes.join(", ")}</p>
                              )}
                              <p className="text-yellow-400 font-bold">R$ {prod.preco.toFixed(2).replace(".", ",")}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button onClick={() => handleToggleDisponivel(prod)}
                                className={`text-xs px-3 py-1 rounded-full font-bold transition ${prod.disponivel ? "bg-green-900 text-green-400 hover:bg-green-800" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                              >
                                {prod.disponivel ? "✓ Disponível" : "✗ Indisponível"}
                              </button>
                              <button onClick={() => setEditando({
                                id: prod.id,
                                nome: prod.nome,
                                preco: prod.preco,
                                descricao: prod.descricao || "",
                                opcoes: prod.opcoes?.join(", ") || "",
                              })}
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

        {/* ABA FIDELIDADE */}
        {aba === "fidelidade" && (
          <div className="flex flex-col gap-3">
            {fidelidade.length === 0 ? (
              <p className="text-zinc-400 text-center py-10">Nenhum cliente com pedidos ainda.</p>
            ) : (
              fidelidade.map((f) => (
                <div key={f.telefone} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">📱 {f.telefone}</p>
                      <p className="text-zinc-400 text-sm">{f.pedidos} pedido(s) no total</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold text-lg">{f.pedidos % 10}/9</span>
                      <button
                        onClick={() => { setEditandoFidelidade(f.telefone); setNovoContador(String(f.pedidos)); }}
                        className="text-zinc-400 hover:text-yellow-400 transition text-sm"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                  {editandoFidelidade === f.telefone && (
                    <div className="flex gap-2 items-center border-t border-zinc-800 pt-3">
                      <input
                        type="number"
                        value={novoContador}
                        onChange={(e) => setNovoContador(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-yellow-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                        placeholder="Total de pedidos"
                      />
                      <button
                        onClick={async () => {
                          await editarFidelidade(f.telefone, parseInt(novoContador));
                          setEditandoFidelidade(null);
                          carregarTudo();
                        }}
                        className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditandoFidelidade(null)}
                        className="bg-zinc-700 text-white px-4 py-2 rounded-lg hover:bg-zinc-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA ADICIONAIS */}
        {aba === "adicionais" && (
          <div className="flex flex-col gap-6">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-yellow-400 font-bold">Novo Adicional</h2>
              <input
                type="text"
                placeholder="Nome (ex: Bacon extra)"
                value={novoAdicional.nome}
                onChange={(e) => setNovoAdicional({ ...novoAdicional, nome: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="number"
                placeholder="Preço (ex: 2)"
                value={novoAdicional.preco}
                onChange={(e) => setNovoAdicional({ ...novoAdicional, preco: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={async () => {
                  if (!novoAdicional.nome || !novoAdicional.preco) return;
                  await adicionarAdicional({ nome: novoAdicional.nome, preco: parseFloat(novoAdicional.preco) });
                  setNovoAdicional({ nome: "", preco: "" });
                  const adics = await listarAdicionais();
                  setAdicionais(adics);
                }}
                className="bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
              >
                + Adicionar
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {adicionais.map((a) => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-2">
                  {editandoAdicional?.id === a.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={editandoAdicional.nome}
                        onChange={(e) => setEditandoAdicional({ ...editandoAdicional, nome: e.target.value })}
                        className="bg-zinc-800 border border-yellow-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        value={editandoAdicional.preco}
                        onChange={(e) => setEditandoAdicional({ ...editandoAdicional, preco: e.target.value })}
                        className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await atualizarAdicional(a.id, { nome: editandoAdicional.nome, preco: parseFloat(editandoAdicional.preco) });
                            setEditandoAdicional(null);
                            const adics = await listarAdicionais();
                            setAdicionais(adics);
                          }}
                          className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditandoAdicional(null)}
                          className="flex-1 bg-zinc-700 text-white py-2 rounded-lg hover:bg-zinc-600 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{a.nome}</p>
                        <p className="text-yellow-400 font-bold">R$ {a.preco.toFixed(2).replace(".", ",")}</p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => setEditandoAdicional({ id: a.id, nome: a.nome, preco: a.preco })}
                          className="text-zinc-400 hover:text-yellow-400 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Apagar este adicional?")) return;
                            await deletarAdicional(a.id);
                            const adics = await listarAdicionais();
                            setAdicionais(adics);
                          }}
                          className="text-zinc-400 hover:text-red-400 transition"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPainel;
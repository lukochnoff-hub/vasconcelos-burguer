import { useState, useEffect } from "react";
import {
  listarCategorias,
  listarProdutos,
  adicionarCategoria,
  deletarCategoria,
  adicionarProduto,
  atualizarProduto,
  deletarProduto,
} from "../data/api";

function AdminPainel({ onSair }) {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [aba, setAba] = useState("produtos");
  const [carregando, setCarregando] = useState(true);

  // Estados para nova categoria
  const [novaCategoria, setNovaCategoria] = useState("");

  // Estados para novo produto
  const [novoProduto, setNovoProduto] = useState({
    nome: "", preco: "", descricao: "", categoria: ""
  });

  // Estado de edição
  const [editando, setEditando] = useState(null); // { id, campo, valor }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    const [cats, prods] = await Promise.all([listarCategorias(), listarProdutos()]);
    setCategorias(cats);
    setProdutos(prods);
    setNovoProduto((p) => ({ ...p, categoria: cats[0] || "" }));
    setCarregando(false);
  }

  // --- Categorias ---
  async function handleAdicionarCategoria() {
    if (!novaCategoria.trim()) return;
    await adicionarCategoria(novaCategoria.trim());
    setNovaCategoria("");
    carregarTudo();
  }

  async function handleDeletarCategoria(nome) {
    const confirm = window.confirm(
      `Apagar categoria "${nome}"? Todos os produtos dela serão removidos!`
    );
    if (!confirm) return;
    await deletarCategoria(nome);
    carregarTudo();
  }

  // --- Produtos ---
  async function handleAdicionarProduto() {
    if (!novoProduto.nome || !novoProduto.preco || !novoProduto.categoria) return;
    await adicionarProduto({
      ...novoProduto,
      preco: parseFloat(novoProduto.preco),
    });
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-4 flex items-center justify-between">
        <h1 className="text-yellow-400 font-bold text-xl">⚙️ Painel Admin</h1>
        <button
          onClick={onSair}
          className="text-zinc-400 hover:text-white text-sm transition"
        >
          Sair
        </button>
      </div>

      {/* Abas */}
      <div className="flex border-b border-zinc-800">
        {["produtos", "categorias"].map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`flex-1 py-3 font-bold capitalize transition ${
              aba === a
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {a === "produtos" ? "🍔 Produtos" : "📂 Categorias"}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ABA CATEGORIAS */}
        {aba === "categorias" && (
          <div className="flex flex-col gap-6">
            {/* Adicionar */}
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

            {/* Lista */}
            <div className="flex flex-col gap-2">
              {categorias.map((cat) => (
                <div
                  key={cat}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 flex justify-between items-center"
                >
                  <span className="font-semibold">{cat}</span>
                  <button
                    onClick={() => handleDeletarCategoria(cat)}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
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
            {/* Adicionar produto */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-yellow-400 font-bold">Novo Produto</h2>
              <select
                value={novoProduto.categoria}
                onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
              >
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Nome do produto"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={novoProduto.descricao}
                onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="number"
                placeholder="Preço (ex: 25)"
                value={novoProduto.preco}
                onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={handleAdicionarProduto}
                className="bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
              >
                + Adicionar Produto
              </button>
            </div>

            {/* Lista por categoria */}
            {categorias.map((cat) => {
              const prods = produtos.filter((p) => p.categoria === cat);
              if (prods.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-yellow-400 font-bold mb-2">{cat}</h3>
                  <div className="flex flex-col gap-2">
                    {prods.map((prod) => (
                      <div
                        key={prod.id}
                        className={`bg-zinc-900 border rounded-xl p-4 flex flex-col gap-2 transition ${
                          prod.disponivel ? "border-zinc-700" : "border-zinc-800 opacity-50"
                        }`}
                      >
                        {editando?.id === prod.id ? (
                          // Modo edição
                          <div className="flex flex-col gap-2">
                            <input
                              value={editando.nome}
                              onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                              className="bg-zinc-800 border border-yellow-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                            />
                            <input
                              value={editando.descricao}
                              onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                              className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none"
                              placeholder="Descrição"
                            />
                            <input
                              type="number"
                              value={editando.preco}
                              onChange={(e) => setEditando({ ...editando, preco: e.target.value })}
                              className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSalvarEdicao(prod)}
                                className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditando(null)}
                                className="flex-1 bg-zinc-700 text-white py-2 rounded-lg hover:bg-zinc-600 transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo visualização
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{prod.nome}</p>
                              {prod.descricao && (
                                <p className="text-zinc-400 text-sm">{prod.descricao}</p>
                              )}
                              <p className="text-yellow-400 font-bold">
                                R$ {prod.preco.toFixed(2).replace(".", ",")}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => handleToggleDisponivel(prod)}
                                className={`text-xs px-3 py-1 rounded-full font-bold transition ${
                                  prod.disponivel
                                    ? "bg-green-900 text-green-400 hover:bg-green-800"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                }`}
                              >
                                {prod.disponivel ? "✓ Disponível" : "✗ Indisponível"}
                              </button>
                              <button
                                onClick={() => setEditando({
                                  id: prod.id,
                                  nome: prod.nome,
                                  preco: prod.preco,
                                  descricao: prod.descricao || "",
                                })}
                                className="text-zinc-400 hover:text-yellow-400 transition text-sm"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeletarProduto(prod.id)}
                                className="text-zinc-400 hover:text-red-400 transition text-sm"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPainel;
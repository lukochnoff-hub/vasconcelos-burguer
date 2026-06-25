import { useState, useEffect } from "react";
import { listarProdutos, listarCategorias } from "../data/api";
import CardProduto from "../components/CarProduto";

function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [prods, cats] = await Promise.all([listarProdutos(), listarCategorias()]);
      setProdutos(prods);
      setCategorias(cats);
      setCategoriaAtiva(cats[0] || "");
      setCarregando(false);
    }
    carregar();
  }, []);

  const produtosFiltrados = produtos.filter(
    (p) => p.categoria === categoriaAtiva && p.disponivel
  );

  if (carregando) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-yellow-400 text-lg">Carregando cardápio...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Filtro de categorias */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-5 py-2 rounded-full font-bold transition whitespace-nowrap ${
              categoriaAtiva === cat
                ? "bg-yellow-400 text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de produtos */}
      <div className="flex flex-col gap-4">
        {produtosFiltrados.length === 0 ? (
          <p className="text-zinc-400 text-center py-10">
            Nenhum produto disponível nessa categoria.
          </p>
        ) : (
          produtosFiltrados.map((produto) => (
            <CardProduto key={produto.id} produto={produto} />
          ))
        )}
      </div>
    </div>
  );
}

export default Cardapio;
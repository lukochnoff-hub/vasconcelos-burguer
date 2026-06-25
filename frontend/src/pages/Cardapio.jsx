import { useState } from "react";
import { produtos, categorias } from "../data/produtos";
import CardProduto from "../components/CarProduto";

function Cardapio() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Hambúrgueres");

  const produtosFiltrados = produtos.filter(
    (p) => p.categoria === categoriaAtiva && p.disponivel
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Filtro de categorias */}
      <div className="flex gap-3 mb-6">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-5 py-2 rounded-full font-bold transition ${
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
        {produtosFiltrados.map((produto) => (
          <CardProduto key={produto.id} produto={produto} />
        ))}
      </div>
    </div>
  );
}

export default Cardapio;
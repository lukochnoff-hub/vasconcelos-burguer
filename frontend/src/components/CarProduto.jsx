import { useCarrinho } from "../context/CarrinhoContext";

function CardProduto({ produto }) {
  const { adicionarItem } = useCarrinho();

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
      <div>
        <h3 className="text-white font-bold text-lg">{produto.nome}</h3>
        <p className="text-zinc-400 text-sm">{produto.descricao}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-yellow-400 font-bold text-xl">
          R$ {produto.preco.toFixed(2).replace(".", ",")}
        </span>
        <button
          onClick={() => adicionarItem(produto)}
          className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
        >
          + Adicionar
        </button>
      </div>
    </div>
  );
}

export default CardProduto;
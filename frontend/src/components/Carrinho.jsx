import { useState } from "react";
import { useCarrinho } from "../context/CarrinhoContext";

function Carrinho({ onFinalizar }) {
  const [aberto, setAberto] = useState(false);
  const { itens, adicionarItem, removerItem, total, quantidade } = useCarrinho();

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-6 right-6 bg-yellow-400 text-black font-bold px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-yellow-300 transition z-50"
      >
        🛒 Carrinho
        {quantidade > 0 && (
          <span className="bg-black text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {quantidade}
          </span>
        )}
      </button>

      {/* Painel lateral */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fundo escuro */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAberto(false)}
          />

          {/* Painel */}
          <div className="relative bg-zinc-900 w-full max-w-sm h-full flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-yellow-400 text-xl font-bold">Seu Pedido</h2>
              <button
                onClick={() => setAberto(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {itens.length === 0 ? (
              <p className="text-zinc-400 text-center mt-10">
                Seu carrinho está vazio 🍔
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-4 flex-1">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-zinc-700 pb-3"
                    >
                      <div>
                        <p className="text-white font-semibold">{item.nome}</p>
                        <p className="text-zinc-400 text-sm">
                          R$ {item.preco.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removerItem(item.id)}
                          className="bg-zinc-700 text-white w-7 h-7 rounded-full hover:bg-zinc-600 transition"
                        >
                          −
                        </button>
                        <span className="text-white font-bold">{item.quantidade}</span>
                        <button
                          onClick={() => adicionarItem(item)}
                          className="bg-yellow-400 text-black w-7 h-7 rounded-full font-bold hover:bg-yellow-300 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 border-t border-zinc-700 pt-4">
                  <div className="flex justify-between text-white font-bold text-lg mb-4">
                    <span>Total</span>
                    <span className="text-yellow-400">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <button
                    onClick={() => { setAberto(false); onFinalizar(); }}
                    className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition"
                  >
                    Finalizar Pedido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Carrinho;
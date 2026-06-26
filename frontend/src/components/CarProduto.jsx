import { useState, useEffect } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { listarAdicionais } from "../data/api";

function CardProduto({ produto }) {
  const { adicionarItem } = useCarrinho();
  const [modalOpcoes, setModalOpcoes] = useState(false);
  const [modalAdicionais, setModalAdicionais] = useState(false);
  const [adicionaisDisponiveis, setAdicionaisDisponiveis] = useState([]);
  const [selecionados, setSelecionados] = useState({});

  useEffect(() => {
    if (produto.categoria === "Hambúrgueres") {
      listarAdicionais().then(setAdicionaisDisponiveis);
    }
  }, [produto.categoria]);

  function handleAdicionar() {
    if (produto.categoria === "Hambúrgueres") {
      setSelecionados({});
      setModalAdicionais(true);
    } else if (produto.opcoes && produto.opcoes.length > 0) {
      setModalOpcoes(true);
    } else {
      adicionarItem({ ...produto, opcao: null, adicionais: [] });
    }
  }

  function handleEscolherOpcao(opcao) {
    adicionarItem({ ...produto, opcao, nome: `${produto.nome} — ${opcao}`, adicionais: [] });
    setModalOpcoes(false);
  }

  function handleQuantidadeAdicional(id, delta) {
    setSelecionados((prev) => {
      const atual = prev[id] || 0;
      const nova = Math.max(0, atual + delta);
      if (nova === 0) {
        const { [id]: _, ...resto } = prev;
        return resto;
      }
      return { ...prev, [id]: nova };
    });
  }

  function handleConfirmarAdicionais() {
    const adicionaisEscolhidos = adicionaisDisponiveis
      .filter((a) => selecionados[a.id])
      .map((a) => ({ ...a, quantidade: selecionados[a.id] }));

    const totalAdicionais = adicionaisEscolhidos.reduce(
      (acc, a) => acc + a.preco * a.quantidade, 0
    );

    adicionarItem({
      ...produto,
      opcao: null,
      adicionais: adicionaisEscolhidos,
      preco: produto.preco + totalAdicionais,
      precoBase: produto.preco,
    });

    setModalAdicionais(false);
    setSelecionados({});
  }

  return (
    <>
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
            onClick={handleAdicionar}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* Modal de opções (pastéis) */}
      {modalOpcoes && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 px-4 pb-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-1">{produto.nome}</h3>
            <p className="text-zinc-400 text-sm mb-4">Escolha o recheio:</p>
            <div className="flex flex-col gap-2">
              {produto.opcoes.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => handleEscolherOpcao(opcao)}
                  className="w-full bg-zinc-800 hover:bg-yellow-400 hover:text-black text-white font-bold py-3 rounded-xl transition"
                >
                  {opcao}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalOpcoes(false)}
              className="w-full mt-3 text-zinc-500 hover:text-white text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de adicionais (hambúrgueres) */}
      {modalAdicionais && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 px-4 pb-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-1">{produto.nome}</h3>
            <p className="text-zinc-400 text-sm mb-4">Deseja adicionar algo?</p>

            <div className="flex flex-col gap-3 mb-5">
              {adicionaisDisponiveis.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">{a.nome}</p>
                    <p className="text-yellow-400 text-xs">+ R$ {a.preco.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantidadeAdicional(a.id, -1)}
                      className="w-8 h-8 rounded-full bg-zinc-700 text-white font-bold hover:bg-zinc-600 transition"
                    >
                      −
                    </button>
                    <span className="text-white font-bold w-4 text-center">
                      {selecionados[a.id] || 0}
                    </span>
                    <button
                      onClick={() => handleQuantidadeAdicional(a.id, 1)}
                      className="w-8 h-8 rounded-full bg-zinc-700 text-white font-bold hover:bg-zinc-600 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmarAdicionais}
              className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition"
            >
              Adicionar ao carrinho ✓
            </button>
            <button
              onClick={() => { setModalAdicionais(false); setSelecionados({}); }}
              className="w-full mt-2 text-zinc-500 hover:text-white text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CardProduto;
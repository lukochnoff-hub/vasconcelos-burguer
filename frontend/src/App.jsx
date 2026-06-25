import { useState } from "react";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import Cardapio from "./pages/Cardapio";
import FinalizarPedido from "./pages/FinalizarPedido";
import Carrinho from "./components/Carrinho";
import Admin from "./pages/Admin";

function App() {
  const [pagina, setPagina] = useState("cardapio");
  const [cliques, setCliques] = useState(0);

  // 5 cliques no nome abre o admin
  function handleLogoClick() {
    const novos = cliques + 1;
    setCliques(novos);
    if (novos >= 5) {
      setPagina("admin");
      setCliques(0);
    }
  }

  if (pagina === "admin") {
    return <Admin onSair={() => setPagina("cardapio")} />;
  }

  return (
    <CarrinhoProvider>
      <div className="min-h-screen bg-black text-white">
        <header className="bg-zinc-900 border-b border-zinc-700 py-4 px-4 text-center">
          <h1
            onClick={handleLogoClick}
            className="text-yellow-400 text-2xl font-bold tracking-wide cursor-pointer select-none"
          >
            Vasconcelos Burguer 🍔
          </h1>
        </header>
        <main>
          {pagina === "cardapio" ? (
            <Cardapio />
          ) : (
            <FinalizarPedido onVoltar={() => setPagina("cardapio")} />
          )}
        </main>
        {pagina === "cardapio" && (
          <Carrinho onFinalizar={() => setPagina("finalizar")} />
        )}
      </div>
    </CarrinhoProvider>
  );
}

export default App;
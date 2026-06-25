import { useState } from "react";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import Cardapio from "./pages/Cardapio";
import FinalizarPedido from "./pages/FinalizarPedido";
import Carrinho from "./components/Carrinho";
import Admin from "./pages/Admin";

function App() {
  const [pagina, setPagina] = useState("cardapio");

  // Acessa /admin pela URL
  const isAdmin = window.location.pathname === "/admin";

  if (isAdmin) return <Admin />;

  return (
    <CarrinhoProvider>
      <div className="min-h-screen bg-black text-white">
        <header className="bg-zinc-900 border-b border-zinc-700 py-4 px-4 text-center">
          <h1 className="text-yellow-400 text-2xl font-bold tracking-wide">
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
import { useState, useEffect } from "react";
import { listarProdutos, listarCategorias, consultarFuncionamento } from "../data/api";
import CardProduto from "../components/CarProduto";

const HORARIOS = {
  0: { abre: 20, fecha: 23 }, // Domingo
  1: { abre: 19, fecha: 23 }, // Segunda
  2: { abre: 21, fecha: 23 }, // Terça
  3: { abre: 19, fecha: 23 }, // Quarta
  4: { abre: 19, fecha: 23 }, // Quinta
  5: { abre: 21, fecha: 23 }, // Sexta
  6: { abre: 19, fecha: 23 }, // Sábado
};

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [funcionamento, setFuncionamento] = useState({ aberto: false });

  useEffect(() => {
    async function carregar() {
      const [prods, cats, func] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
        consultarFuncionamento(),
      ]);
      setProdutos(prods);
      setCategorias(cats);
      setCategoriaAtiva(cats[0] || "");
      setFuncionamento(func);
      setCarregando(false);
    }
    carregar();
  }, []);

  const produtosFiltrados = produtos.filter(
    (p) => p.categoria === categoriaAtiva && p.disponivel
  );

  const agora = new Date();
  const diaSemana = agora.getDay();
  const hora = agora.getHours();
  const horarioDia = HORARIOS[diaSemana];
  const dentroDoHorario = hora >= horarioDia.abre && hora < horarioDia.fecha;
  const lojaAberta = funcionamento.manual ? funcionamento.aberto : dentroDoHorario;

  if (carregando) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-yellow-400 text-lg">Carregando cardápio...</p>
    </div>
  );

  if (!lojaAberta) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="text-yellow-400 text-2xl font-bold mb-2">Estamos fechados</h2>
      <p className="text-zinc-400 mb-6">Mas já voltamos em breve!</p>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-full max-w-xs">
        <p className="text-white font-bold mb-3 text-center">Horário de funcionamento</p>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-zinc-300">
            <span>Segunda, Qua, Qui, Sáb</span><span>19h às 23h</span>
          </div>
          <div className="flex justify-between text-zinc-300">
            <span>Terça e Sexta</span><span>21h às 23h</span>
          </div>
          <div className="flex justify-between text-zinc-300">
            <span>Domingo</span><span>20h às 23h</span>
          </div>
        </div>
        <p className="text-yellow-400 text-xs text-center mt-3">
          Hoje ({DIAS_SEMANA[diaSemana]}): abre às {horarioDia.abre}h
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
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
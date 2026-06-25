import { useState } from "react";

const SENHA = "vasconcelos2024";

function AdminLogin({ onLogin }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);

  function handleEntrar() {
    if (senha === SENHA) {
      onLogin();
    } else {
      setErro(true);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-yellow-400 text-2xl font-bold text-center">
          🔐 Admin
        </h2>
        <p className="text-zinc-400 text-sm text-center">
          Área restrita — Vasconcelos Burguer
        </p>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => { setSenha(e.target.value); setErro(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleEntrar()}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
        />
        {erro && (
          <p className="text-red-400 text-sm text-center">Senha incorreta!</p>
        )}
        <button
          onClick={handleEntrar}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
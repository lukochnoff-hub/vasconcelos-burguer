import { useState } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminPainel from "../components/AdminPainel";

function Admin({ onSair }) {
  const [logado, setLogado] = useState(false);

  return logado ? (
    <AdminPainel onSair={onSair} />
  ) : (
    <AdminLogin onLogin={() => setLogado(true)} onSair={onSair} />
  );
}

export default Admin;
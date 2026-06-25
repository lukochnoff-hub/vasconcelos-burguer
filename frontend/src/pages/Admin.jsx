import { useState } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminPainel from "../components/AdminPainel";

function Admin() {
  const [logado, setLogado] = useState(false);

  return logado ? (
    <AdminPainel onSair={() => setLogado(false)} />
  ) : (
    <AdminLogin onLogin={() => setLogado(true)} />
  );
}

export default Admin;
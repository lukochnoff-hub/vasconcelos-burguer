const BASE_URL = "http://127.0.0.1:5000";

export async function registrarPedido(pedido) {
  const res = await fetch(`${BASE_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  return res.json();
}

export async function registrarFidelidade(telefone) {
  const res = await fetch(`${BASE_URL}/fidelidade/${telefone}`, {
    method: "POST",
  });
  return res.json();
}

export async function consultarFidelidade(telefone) {
  const res = await fetch(`${BASE_URL}/fidelidade/${telefone}`);
  return res.json();
}
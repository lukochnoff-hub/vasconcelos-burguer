const BASE_URL = "http://127.0.0.1:5000";

// Produtos
export async function listarProdutos() {
  const res = await fetch(`${BASE_URL}/produtos`);
  return res.json();
}

export async function adicionarProduto(produto) {
  const res = await fetch(`${BASE_URL}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  return res.json();
}

export async function atualizarProduto(id, produto) {
  const res = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  return res.json();
}

export async function deletarProduto(id) {
  const res = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// Categorias
export async function listarCategorias() {
  const res = await fetch(`${BASE_URL}/categorias`);
  return res.json();
}

export async function adicionarCategoria(nome) {
  const res = await fetch(`${BASE_URL}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
  return res.json();
}

export async function deletarCategoria(nome) {
  const res = await fetch(`${BASE_URL}/categorias/${encodeURIComponent(nome)}`, {
    method: "DELETE",
  });
  return res.json();
}

// Pedidos
export async function registrarPedido(pedido) {
  const res = await fetch(`${BASE_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  return res.json();
}

// Fidelidade
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
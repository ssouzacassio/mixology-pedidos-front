"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, PedidoAdmin, Produto, StatusPedido } from "@/lib/api";
import ModalEditarPedido from "@/components/ModalEditarPedido";
import AdminNav from "@/components/AdminNav";
import { prepararSom, tocarNotificacaoPedido } from "@/lib/som";

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

const ABAS: { valor: StatusPedido | "todos"; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "recebido", texto: "Recebido" },
  { valor: "preparando", texto: "Preparando" },
  { valor: "saiu_para_entrega", texto: "Saiu para entrega" },
  { valor: "entregue", texto: "Entregue" },
  { valor: "cancelado", texto: "Cancelado" },
];

const OPCOES_STATUS: { valor: StatusPedido; texto: string }[] = ABAS.filter(
  (a): a is { valor: StatusPedido; texto: string } => a.valor !== "todos"
);

const RÓTULOS_PAGAMENTO: Record<string, string> = {
  pix: "Pix",
  credito: "Crédito",
  debito: "Débito",
};

export default function PaginaPedidosAdmin() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pedidoEditando, setPedidoEditando] = useState<PedidoAdmin | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [aba, setAba] = useState<StatusPedido | "todos">("recebido");
  const ultimoIdRef = useRef<number | null>(null);

  const carregar = useCallback(async () => {
    const token = localStorage.getItem("pedidos_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    try {
      const dados = await api.listarPedidosAdmin(token);

      const maiorId = dados.reduce((max, p) => Math.max(max, p.id), 0);
      if (ultimoIdRef.current !== null && maiorId > ultimoIdRef.current) {
        tocarNotificacaoPedido();
      }
      ultimoIdRef.current = maiorId;

      setPedidos(dados);
      setErro("");
    } catch (e) {
      if (e instanceof Error && e.message.includes("inválido")) {
        localStorage.removeItem("pedidos_admin_token");
        router.replace("/admin/login");
        return;
      }
      setErro("Não foi possível carregar os pedidos.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    setAdminToken(localStorage.getItem("pedidos_admin_token"));
    carregar();
    api.listarProdutos().then(setProdutos);
    const intervalo = setInterval(carregar, 15000);

    // Navegadores só liberam áudio depois de uma interação — desbloqueia no primeiro clique.
    document.addEventListener("click", prepararSom, { once: true });

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("click", prepararSom);
    };
  }, [carregar]);

  async function mudarStatus(pedidoId: number, status: StatusPedido) {
    const token = localStorage.getItem("pedidos_admin_token");
    if (!token) return;

    setPedidos((atual) => atual.map((p) => (p.id === pedidoId ? { ...p, status } : p)));
    try {
      await api.atualizarStatusPedido(token, pedidoId, status);
    } catch {
      carregar();
    }
  }

  function cancelarPedido(pedido: PedidoAdmin) {
    if (!confirm(`Cancelar o pedido #${pedido.id} de ${pedido.cliente.nome}?`)) return;
    mudarStatus(pedido.id, "cancelado");
  }

  async function salvarEdicao(dados: { itens: { produtoId: number; quantidade: number }[]; enderecoEntrega: string }) {
    const token = localStorage.getItem("pedidos_admin_token");
    if (!token || !pedidoEditando) return;

    await api.editarPedidoAdmin(token, pedidoEditando.id, dados);
    setPedidoEditando(null);
    carregar();
  }

  const pedidosFiltrados = aba === "todos" ? pedidos : pedidos.filter((p) => p.status === aba);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AdminNav adminToken={adminToken} />

      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Pedidos</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {ABAS.map((item) => {
          const quantidade = item.valor === "todos" ? pedidos.length : pedidos.filter((p) => p.status === item.valor).length;
          return (
            <button
              key={item.valor}
              onClick={() => setAba(item.valor)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                aba === item.valor
                  ? "border-marca-vermelho bg-marca-vermelho text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {item.texto} <span className={aba === item.valor ? "text-white/80" : "text-zinc-400"}>({quantidade})</span>
            </button>
          );
        })}
      </div>

      {carregando && <p className="text-zinc-500">Carregando pedidos...</p>}
      {erro && <p className="text-marca-vermelho">{erro}</p>}

      {!carregando && pedidosFiltrados.length === 0 && (
        <p className="text-zinc-500">Nenhum pedido nesse status.</p>
      )}

      {pedidosFiltrados.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{formatarData(pedido.criadoEm)}</td>
                  <td className="px-4 py-3 font-medium">{pedido.cliente.nome}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    <div>{pedido.cliente.telefone}</div>
                    <div className="text-xs text-zinc-400">{pedido.cliente.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {pedido.itens.map((item) => (
                      <div key={item.id}>
                        {item.quantidade}x {item.produto?.nome}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {pedido.tipoEntrega === "delivery" ? (
                      <>
                        <span className="font-medium text-marca-azul">Delivery</span>
                        <div className="text-xs text-zinc-500">{pedido.enderecoEntrega}</div>
                      </>
                    ) : (
                      "Retirada"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-marca-vermelho">
                    R$ {pedido.valorTotal.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3">
                    <div>{RÓTULOS_PAGAMENTO[pedido.formaPagamento] || pedido.formaPagamento}</div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        pedido.statusPagamento === "pago"
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {pedido.statusPagamento}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={pedido.status}
                      onChange={(e) => mudarStatus(pedido.id, e.target.value as StatusPedido)}
                      className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-marca-vermelho"
                    >
                      {OPCOES_STATUS.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                          {opcao.texto}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPedidoEditando(pedido)}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => cancelarPedido(pedido)}
                        disabled={pedido.status === "cancelado"}
                        className="rounded-md border border-marca-vermelho px-2 py-1 text-xs font-medium text-marca-vermelho hover:bg-marca-vermelho/5 disabled:opacity-40"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pedidoEditando && (
        <ModalEditarPedido
          pedido={pedidoEditando}
          produtos={produtos}
          onFechar={() => setPedidoEditando(null)}
          onSalvar={salvarEdicao}
        />
      )}
    </div>
  );
}

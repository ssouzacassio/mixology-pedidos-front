"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { api, Pedido } from "@/lib/api";
import DrinkPreparando from "@/components/DrinkPreparando";

const RÓTULOS_STATUS: Record<string, { texto: string; cor: string }> = {
  recebido: { texto: "Recebido", cor: "bg-zinc-100 text-zinc-600" },
  preparando: { texto: "Preparando", cor: "bg-marca-laranja/15 text-marca-laranja" },
  saiu_para_entrega: { texto: "Saiu para entrega", cor: "bg-marca-azul/15 text-marca-azul" },
  entregue: { texto: "Entregue", cor: "bg-green-100 text-green-700" },
  cancelado: { texto: "Cancelado", cor: "bg-marca-vermelho/10 text-marca-vermelho" },
};

const RÓTULOS_PAGAMENTO: Record<string, string> = {
  pendente: "Pagamento pendente",
  pago: "Pago",
  falhou: "Pagamento falhou",
};

export default function PaginaPedidos() {
  const { token, carregando: carregandoAuth } = useAutenticacao();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    if (!token) return;
    api
      .listarMeusPedidos(token)
      .then(setPedidos)
      .finally(() => setCarregando(false));
  }, [token]);

  useEffect(() => {
    if (carregandoAuth) return;
    if (!token) {
      setCarregando(false);
      return;
    }
    carregar();
    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, [token, carregandoAuth, carregar]);

  if (!carregandoAuth && !token) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="mb-4 text-zinc-500">
          <Link href="/login" className="font-medium text-marca-vermelho hover:underline">
            Entre na sua conta
          </Link>{" "}
          para ver seu histórico de pedidos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">Meus pedidos</h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {carregando && <p className="text-zinc-500">Carregando pedidos...</p>}

        {!carregando && pedidos.length === 0 && (
          <p className="text-zinc-500">Você ainda não fez nenhum pedido.</p>
        )}

        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const status = RÓTULOS_STATUS[pedido.status] || { texto: pedido.status, cor: "bg-zinc-100 text-zinc-600" };
            return (
              <div key={pedido.id} className="animar-surgir rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">Pedido #{pedido.id}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cor}`}>
                    {status.texto}
                  </span>
                </div>

                <ul className="mb-2 text-sm text-zinc-600">
                  {pedido.itens.map((item) => (
                    <li key={item.id}>
                      {item.quantidade}x {item.produto?.nome}
                    </li>
                  ))}
                </ul>

                {pedido.status === "preparando" && (
                  <div className="mb-2">
                    <DrinkPreparando />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    {pedido.tipoEntrega === "delivery" ? "Delivery" : "Retirada na loja"} ·{" "}
                    {RÓTULOS_PAGAMENTO[pedido.statusPagamento] || pedido.statusPagamento}
                  </span>
                  <span className="font-semibold text-marca-vermelho">
                    R$ {pedido.valorTotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

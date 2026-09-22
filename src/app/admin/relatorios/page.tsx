"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Relatorio } from "@/lib/api";
import AdminNav from "@/components/AdminNav";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaginaRelatoriosAdmin() {
  const router = useRouter();
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("pedidos_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setAdminToken(token);

    api
      .obterRelatorioAdmin(token)
      .then(setRelatorio)
      .catch(() => setErro("Não foi possível carregar o relatório."))
      .finally(() => setCarregando(false));
  }, [router]);

  const maiorQuantidade = relatorio?.maisVendidos?.[0]?.quantidade || 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AdminNav adminToken={adminToken} />

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Relatórios</h1>

      {carregando && <p className="text-zinc-500">Carregando relatório...</p>}
      {erro && <p className="text-marca-vermelho">{erro}</p>}

      {relatorio && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardEstatistica rotulo="Faturamento hoje" valor={formatarMoeda(relatorio.faturamentoHoje)} />
            <CardEstatistica rotulo="Faturamento no mês" valor={formatarMoeda(relatorio.faturamentoMes)} />
            <CardEstatistica rotulo="Faturamento no ano" valor={formatarMoeda(relatorio.faturamentoAno)} />
            <CardEstatistica rotulo="Pedidos hoje" valor={String(relatorio.pedidosHoje)} />
          </div>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-[family-name:var(--font-titulo)] text-lg font-semibold">
              Produtos mais vendidos
            </h2>

            {relatorio.maisVendidos.length === 0 && (
              <p className="text-sm text-zinc-400">Ainda não há vendas suficientes pra esse ranking.</p>
            )}

            <div className="space-y-3">
              {relatorio.maisVendidos.map((item) => (
                <div key={item.nome} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm text-zinc-700">{item.nome}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-marca-vermelho"
                      style={{ width: `${Math.max(4, (item.quantidade / maiorQuantidade) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-medium text-zinc-500">
                    {item.quantidade}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CardEstatistica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{rotulo}</p>
      <p className="mt-1 font-[family-name:var(--font-titulo)] text-2xl font-semibold text-zinc-900">{valor}</p>
    </div>
  );
}

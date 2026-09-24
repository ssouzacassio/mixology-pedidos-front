"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Produto } from "@/lib/api";
import { useCarrinho } from "@/contexts/CarrinhoContexto";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaginaCardapio() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const { adicionar } = useCarrinho();

  useEffect(() => {
    api
      .listarProdutos()
      .then(setProdutos)
      .catch(() => setErro("Não foi possível carregar o cardápio agora. Tente novamente em instantes."))
      .finally(() => setCarregando(false));
  }, []);

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria || "Outros")));

  return (
    <div>
      <section className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">Cardápio</h1>
          <p className="mt-1 text-zinc-400">Escolha seu drink e peça pra retirar ou receber em casa.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/monte-seu-drink"
          className="animar-surgir mb-8 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-marca-vermelho via-[#c23330] to-marca-laranja p-5 text-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div>
            <p className="font-[family-name:var(--font-titulo)] text-lg font-semibold">Monte seu drink</p>
            <p className="text-sm text-white/85">Escolha a base, o mixer e o extra do seu jeito.</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 shrink-0">
            <path d="M4 4h16l-7 8.5V19h3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 19H16" strokeLinecap="round" />
          </svg>
        </Link>

        {carregando && <p className="text-muted-foreground">Carregando cardápio...</p>}
        {erro && <p className="text-destructive">{erro}</p>}

        {!carregando && !erro && produtos.length === 0 && (
          <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
        )}

        {categorias.map((categoria) => (
          <section key={categoria} className="animar-surgir mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca-vermelho">
              {categoria}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {produtos
                .filter((p) => (p.categoria || "Outros") === categoria)
                .map((produto) => (
                  <Card
                    key={produto.id}
                    className="flex-row items-center justify-between gap-3 p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div>
                      <p className="font-medium text-foreground">{produto.nome}</p>
                      {produto.descricao && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{produto.descricao}</p>
                      )}
                      <p className="mt-2 text-sm font-semibold text-marca-vermelho">
                        R$ {produto.preco.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <Button onClick={() => adicionar(produto)} size="sm" className="shrink-0">
                      Adicionar
                    </Button>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

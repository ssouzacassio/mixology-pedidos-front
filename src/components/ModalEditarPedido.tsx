"use client";

import { useState } from "react";
import { PedidoAdmin, Produto } from "@/lib/api";

interface ItemEdicao {
  produtoId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

export default function ModalEditarPedido({
  pedido,
  produtos,
  onFechar,
  onSalvar,
}: {
  pedido: PedidoAdmin;
  produtos: Produto[];
  onFechar: () => void;
  onSalvar: (dados: { itens: { produtoId: number; quantidade: number }[]; enderecoEntrega: string }) => Promise<void>;
}) {
  const [itens, setItens] = useState<ItemEdicao[]>(
    pedido.itens.map((item) => ({
      produtoId: item.produtoId,
      nome: item.produto?.nome || `Produto #${item.produtoId}`,
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
    }))
  );
  const [enderecoEntrega, setEnderecoEntrega] = useState(pedido.enderecoEntrega);
  const [produtoParaAdicionar, setProdutoParaAdicionar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function definirQuantidade(produtoId: number, quantidade: number) {
    if (quantidade <= 0) {
      setItens((atual) => atual.filter((item) => item.produtoId !== produtoId));
      return;
    }
    setItens((atual) => atual.map((item) => (item.produtoId === produtoId ? { ...item, quantidade } : item)));
  }

  function adicionarProduto() {
    const produto = produtos.find((p) => p.id === Number(produtoParaAdicionar));
    if (!produto) return;

    setItens((atual) => {
      const existente = atual.find((item) => item.produtoId === produto.id);
      if (existente) {
        return atual.map((item) =>
          item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...atual, { produtoId: produto.id, nome: produto.nome, precoUnitario: produto.preco, quantidade: 1 }];
    });
    setProdutoParaAdicionar("");
  }

  const total = itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  async function salvar() {
    if (itens.length === 0) {
      setErro("O pedido precisa ter pelo menos um item.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({
        itens: itens.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
        enderecoEntrega,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar pedido");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="animar-surgir w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Editar pedido #{pedido.id}</h2>

        <div className="mb-4 space-y-2">
          {itens.map((item) => (
            <div key={item.produtoId} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex-1">{item.nome}</span>
              <input
                type="number"
                min={0}
                value={item.quantidade}
                onChange={(e) => definirQuantidade(item.produtoId, Number(e.target.value))}
                className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-center"
              />
            </div>
          ))}
          {itens.length === 0 && <p className="text-sm text-zinc-400">Nenhum item.</p>}
        </div>

        <div className="mb-4 flex gap-2">
          <select
            value={produtoParaAdicionar}
            onChange={(e) => setProdutoParaAdicionar(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-marca-vermelho"
          >
            <option value="">Adicionar produto...</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} — R$ {produto.preco.toFixed(2).replace(".", ",")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={adicionarProduto}
            disabled={!produtoParaAdicionar}
            className="rounded-md border border-marca-vermelho px-3 py-1.5 text-sm font-medium text-marca-vermelho disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-zinc-700">Endereço de entrega</span>
          <input
            type="text"
            value={enderecoEntrega}
            onChange={(e) => setEnderecoEntrega(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
          />
        </label>

        <div className="mb-4 flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span className="text-marca-vermelho">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>

        {erro && <p className="mb-3 text-sm text-marca-vermelho">{erro}</p>}

        <div className="flex gap-2">
          <button
            onClick={onFechar}
            type="button"
            className="flex-1 rounded-md border border-zinc-300 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando} className="botao-primario flex-1 py-2 text-sm">
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

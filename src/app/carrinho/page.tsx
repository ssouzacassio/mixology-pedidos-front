"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCarrinho } from "@/contexts/CarrinhoContexto";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { api, FormaPagamento, ItemPedidoEntrada, Pedido } from "@/lib/api";

const OPCOES_PAGAMENTO: { valor: FormaPagamento; texto: string }[] = [
  { valor: "pix", texto: "Pix" },
  { valor: "credito", texto: "Crédito" },
  { valor: "debito", texto: "Débito" },
];

export default function PaginaCarrinho() {
  const { itens, definirQuantidade, remover, limpar, total } = useCarrinho();
  const { cliente, token } = useAutenticacao();
  const router = useRouter();

  const enderecoPadrao = cliente?.enderecos.find((e) => e.padrao) || cliente?.enderecos[0];
  const [enderecoId, setEnderecoId] = useState<number | undefined>(enderecoPadrao?.id);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedidoCriado, setPedidoCriado] = useState<Pedido | null>(null);
  const [cobrancaPix, setCobrancaPix] = useState<{ copiaECola: string; valor: number } | null>(null);

  async function finalizarPedido() {
    if (!token) {
      router.push("/cadastro?retorno=/carrinho");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      const itensEntrada: ItemPedidoEntrada[] = itens.map((item) =>
        item.produto
          ? { produtoId: item.produto.id, quantidade: item.quantidade }
          : {
              personalizado: true,
              ingredientesIds: item.personalizado!.ingredientes.map((i) => i.id),
              nomePersonalizado: item.personalizado!.nomePersonalizado,
              quantidade: item.quantidade,
            }
      );

      const pedido = await api.criarPedido(token, {
        itens: itensEntrada,
        tipoEntrega: "delivery",
        enderecoId,
        formaPagamento,
      });

      if (formaPagamento === "pix") {
        const pix = await api.gerarCobrancaPix(token, pedido.id);
        setCobrancaPix(pix);
      }

      setPedidoCriado(pedido);
      limpar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao finalizar pedido");
    } finally {
      setEnviando(false);
    }
  }

  if (pedidoCriado) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Pedido #{pedidoCriado.id} recebido!</h1>
        <p className="mb-4 text-sm text-zinc-500">
          Itens: R$ {(pedidoCriado.valorTotal - pedidoCriado.valorFrete).toFixed(2).replace(".", ",")} + Entrega: R${" "}
          {pedidoCriado.valorFrete.toFixed(2).replace(".", ",")} = <strong>R$ {pedidoCriado.valorTotal.toFixed(2).replace(".", ",")}</strong>
        </p>

        {cobrancaPix ? (
          <>
            <p className="mb-6 text-zinc-500">Finalize o pagamento via Pix para confirmar.</p>
            <div className="animar-surgir overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-marca-vermelho via-marca-laranja to-marca-azul" />
              <div className="p-6">
                <p className="text-sm text-zinc-500">Valor a pagar</p>
                <p className="mb-4 text-2xl font-semibold text-marca-vermelho">
                  R$ {cobrancaPix.valor.toFixed(2).replace(".", ",")}
                </p>
                <p className="mb-1 text-sm text-zinc-500">Pix copia e cola</p>
                <p className="break-all rounded-md bg-zinc-100 p-3 font-mono text-xs">{cobrancaPix.copiaECola}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="mb-6 text-zinc-500">
            Pagamento no {formaPagamento === "credito" ? "crédito" : "débito"} na maquininha, na hora da entrega.
          </p>
        )}

        <Link href="/pedidos" className="mt-6 inline-block font-medium text-marca-vermelho hover:underline">
          Acompanhar meus pedidos
        </Link>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="mb-4 text-zinc-500">Seu carrinho está vazio.</p>
        <Link href="/" className="font-medium text-marca-vermelho hover:underline">
          Ver cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Carrinho</h1>

      <div className="mb-6 space-y-3">
        {itens.map((item) => {
          const nome = item.produto?.nome || item.personalizado?.nomePersonalizado || item.personalizado?.nome || "Item";
          const preco = item.produto?.preco ?? item.personalizado?.preco ?? 0;
          const subtitulo = item.personalizado?.nomePersonalizado ? item.personalizado.nome : null;
          return (
            <div
              key={item.chave}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
            >
              <div>
                <p className="font-medium">{nome}</p>
                {subtitulo && <p className="text-xs text-zinc-400">{subtitulo}</p>}
                <p className="text-sm text-zinc-500">R$ {preco.toFixed(2).replace(".", ",")} cada</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) => definirQuantidade(item.chave, Number(e.target.value))}
                  className="w-14 rounded-md border border-zinc-300 px-2 py-1 text-center"
                />
                <button onClick={() => remover(item.chave)} className="text-sm text-zinc-400 hover:text-marca-vermelho">
                  remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-zinc-700">
          Entrega <span className="font-normal text-zinc-400">— por enquanto só fazemos delivery</span>
        </p>
        {cliente && cliente.enderecos.length > 0 ? (
          <select
            value={enderecoId}
            onChange={(e) => setEnderecoId(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-marca-vermelho"
          >
            {cliente.enderecos.map((endereco) => (
              <option key={endereco.id} value={endereco.id}>
                {endereco.rotulo ? `${endereco.rotulo} — ` : ""}
                {endereco.endereco}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-zinc-400">
            {cliente ? (
              <>
                Nenhum endereço cadastrado.{" "}
                <Link href="/perfil" className="font-medium text-marca-vermelho hover:underline">
                  Adicione um no seu perfil
                </Link>
                .
              </>
            ) : (
              "O endereço do seu cadastro será usado na entrega."
            )}
          </p>
        )}
      </div>

      <div className="mb-6 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-zinc-700">Forma de pagamento</p>
        <div className="flex gap-4 text-sm">
          {OPCOES_PAGAMENTO.map((opcao) => (
            <label key={opcao.valor} className="flex items-center gap-2">
              <input
                type="radio"
                checked={formaPagamento === opcao.valor}
                onChange={() => setFormaPagamento(opcao.valor)}
                className="accent-marca-vermelho"
              />
              {opcao.texto}
            </label>
          ))}
        </div>
        {formaPagamento !== "pix" && (
          <p className="text-xs text-zinc-400">Pagamento na maquininha, na hora da entrega.</p>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between text-lg font-semibold">
        <span>Subtotal</span>
        <span className="text-marca-vermelho">R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>
      <p className="mb-6 text-xs text-zinc-400">+ taxa de entrega, calculada ao confirmar o pedido</p>

      {erro && <p className="mb-4 text-sm text-marca-vermelho">{erro}</p>}

      <button
        onClick={finalizarPedido}
        disabled={enviando || (!!cliente && !enderecoId)}
        className="botao-primario w-full py-2"
      >
        {enviando ? "Enviando pedido..." : cliente ? "Finalizar pedido" : "Criar conta e finalizar pedido"}
      </button>
    </div>
  );
}
